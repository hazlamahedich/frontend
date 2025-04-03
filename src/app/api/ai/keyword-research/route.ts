import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('=== KEYWORD RESEARCH API CALLED ===');
  try {
    // Parse the request body
    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body received:', body);

    // Skip authentication for simplicity
    console.log('Skipping authentication for simplicity');

    // Prepare the request to Ollama
    const apiUrl = 'http://localhost:11434/api/generate';
    const headers = {
      'Content-Type': 'application/json',
    };

    // Prepare the messages for the prompt
    let messagesText = body.messages.map((msg: any) => {
      if (msg.role === 'system') {
        return `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        return `User: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        return `Assistant: ${msg.content}\n\n`;
      }
      return `${msg.content}\n\n`;
    }).join('');

    // Add a specific instruction to return only a JSON array
    messagesText += 'IMPORTANT: Your response must be ONLY a valid JSON array of objects with the following properties: keyword, searchVolume, difficulty, intent, competition, seasonality, relatedKeywords, recommendation. The seasonality field should indicate when the keyword is most popular during the year (e.g., "Year-round", "Summer months", "December-January", "Q4", etc.). The relatedKeywords field should contain 3-5 related keywords or phrases separated by commas. Do not include any explanations, markdown formatting, or any text outside the JSON array. The response should start with [ and end with ] and be valid JSON that can be parsed directly with JSON.parse().\n\n';

    // Add an example of the expected format
    messagesText += 'Example of the expected format:\n[{"keyword":"example keyword","searchVolume":"1000","difficulty":"medium","intent":"informational","competition":"0.5","seasonality":"Year-round","relatedKeywords":"similar term, alternative phrase, related search, another keyword","recommendation":"Create a comprehensive guide"}]\n\n';

    // Prepare the request body for Ollama
    // Try the model name without colon first
    let modelName = 'deepseek-r1-14b';

    // Check if Ollama is running and has the model
    try {
      console.log('Checking if Ollama has the model:', modelName);
      const modelCheckResponse = await fetch('http://localhost:11434/api/tags');
      if (modelCheckResponse.ok) {
        const models = await modelCheckResponse.json();
        console.log('Available Ollama models:', JSON.stringify(models, null, 2));

        // If our model isn't found, try the original format with colon
        if (!models.models?.some(m => m.name === modelName)) {
          const originalModelName = 'deepseek-r1:14b';
          console.log(`Model ${modelName} not found, trying ${originalModelName}`);
          if (models.models?.some(m => m.name === originalModelName)) {
            console.log(`Found model with original name: ${originalModelName}`);
            modelName = originalModelName;
          }
        }
      }
    } catch (error) {
      console.error('Error checking Ollama models:', error);
      // Continue with default model name
    }

    const requestBody = {
      model: modelName,
      prompt: messagesText,
      stream: body.stream,
      options: {
        temperature: body.temperature || 0.7,
        num_predict: body.max_tokens || 3000
      }
    };

    console.log('=== MAKING REQUEST TO OLLAMA ===');
    console.log('API URL:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Make the request to Ollama
    console.log('Sending fetch request...');
    const llmResponse = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('Response received. Status:', llmResponse.status, llmResponse.statusText);

    if (!llmResponse.ok) {
      console.log('=== LLM RESPONSE ERROR ===');
      console.log('Response not OK. Status:', llmResponse.status, llmResponse.statusText);
      try {
        // Try to get the error text first
        console.log('Attempting to read error response text...');
        const errorText = await llmResponse.text();
        console.error('LLM provider error text:', errorText);

        // Try to parse as JSON if possible
        try {
          console.log('Attempting to parse error text as JSON...');
          const errorData = JSON.parse(errorText);
          console.error('LLM provider error data:', errorData);
          console.log('Returning JSON error response');
          return NextResponse.json(
            { error: errorData.error?.message || 'Error from LLM provider' },
            { status: llmResponse.status }
          );
        } catch (jsonError) {
          // If it's not valid JSON, return the text
          console.error('Failed to parse error as JSON:', jsonError);
          console.log('Returning text error response');
          return NextResponse.json(
            { error: `Error from LLM provider: ${errorText || llmResponse.statusText}` },
            { status: llmResponse.status }
          );
        }
      } catch (e) {
        // If we can't even get the text, return the status text
        console.error('Failed to get error response:', e);
        console.log('Returning status text error response');
        return NextResponse.json(
          { error: `Error from LLM provider: ${llmResponse.statusText}` },
          { status: llmResponse.status }
        );
      }
    }

    // Handle streaming responses
    if (body.stream) {
      console.log('=== HANDLING STREAMING RESPONSE ===');
      // Set up streaming response
      const encoder = new TextEncoder();
      console.log('Setting up ReadableStream...');
      const stream = new ReadableStream({
        async start(controller) {
          // Function to send a chunk to the client
          function sendChunk(chunk: string) {
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          }

          try {
            console.log('Starting to stream response from LLM provider...');
            // Stream the response from the LLM provider
            const reader = llmResponse.body?.getReader();
            if (!reader) {
              console.error('Response body is null');
              throw new Error('Response body is null');
            }
            console.log('Got reader from response body');

            let accumulatedTokens = 0;

            console.log('Starting read loop...');
            let chunkCount = 0;
            while (true) {
              console.log(`Reading chunk ${++chunkCount}...`);
              const { done, value } = await reader.read();
              if (done) {
                console.log('Read complete (done=true)');
                break;
              }

              // Forward the chunk to the client
              const chunk = new TextDecoder().decode(value);
              console.log(`Received chunk ${chunkCount} of length ${chunk.length}`);
              console.log(`Chunk preview: ${chunk.substring(0, 100)}${chunk.length > 100 ? '...' : ''}`);

              try {
                // Ollama responses are newline-delimited JSON objects
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                  try {
                    const ollamaData = JSON.parse(line);
                    console.log('Parsed Ollama data:', JSON.stringify(ollamaData, null, 2));

                    // Just pass through the Ollama format directly
                    // This is simpler and more reliable than trying to convert to OpenAI format
                    console.log('Passing through Ollama format directly');
                    sendChunk(JSON.stringify(ollamaData));
                  } catch (parseError) {
                    console.error('Error parsing Ollama line:', parseError);
                    console.log('Problematic line:', line);
                  }
                }
              } catch (error) {
                console.error('Error processing Ollama chunk:', error);
                // Fall back to sending the raw chunk
                sendChunk(chunk);
              }

              // Roughly estimate token count for streaming (this is approximate)
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.includes('"content":')) {
                  // Roughly count tokens in content (4 chars ≈ 1 token)
                  const contentMatch = line.match(/"content":\s*"([^"]*)"/);
                  if (contentMatch && contentMatch[1]) {
                    accumulatedTokens += Math.ceil(contentMatch[1].length / 4);
                  }
                }
              }
            }

            // Skip token tracking for simplicity

            // End the stream
            console.log('Streaming complete, sending [DONE]');
            sendChunk('[DONE]');
            controller.close();
          } catch (error) {
            console.log('=== ERROR DURING STREAMING ===');
            console.error('Error streaming response:', error);
            console.log('Sending error to client');
            controller.error(error);
          }
        },
      });

      // Return the streaming response
      console.log('Returning streaming response to client');
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      console.log('=== HANDLING NON-STREAMING RESPONSE ===');
      // Handle non-streaming response
      console.log('Parsing response JSON...');
      const data = await llmResponse.json();
      console.log('Response data:', JSON.stringify(data, null, 2));

      // Skip token tracking for simplicity

      // Extract the JSON array from the response
      console.log('Extracting JSON array from response...');

      // The Ollama response contains the generated text in the 'response' field
      const responseText = data.response || '';
      console.log('Response text length:', responseText.length);
      console.log('Response text preview:', responseText.substring(0, 200) + '...');

      // Try to extract a JSON array from the response text
      let jsonData = null;

      // First, try to find a JSON array using regex
      const jsonRegex = /\[\s*\{[\s\S]*?\}\s*\]/g;
      const jsonMatches = responseText.match(jsonRegex);

      if (jsonMatches && jsonMatches.length > 0) {
        console.log('Found JSON array in response text');
        try {
          jsonData = JSON.parse(jsonMatches[0]);
          console.log('Successfully parsed JSON array');
        } catch (parseError) {
          console.error('Failed to parse extracted JSON array:', parseError);
        }
      }

      // If regex approach failed, try manual extraction
      if (!jsonData) {
        console.log('Trying manual extraction...');
        const startIndex = responseText.indexOf('[');
        const endIndex = responseText.lastIndexOf(']');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const jsonCandidate = responseText.substring(startIndex, endIndex + 1);
          console.log('JSON candidate found, length:', jsonCandidate.length);
          try {
            jsonData = JSON.parse(jsonCandidate);
            console.log('Successfully parsed JSON with manual extraction');
          } catch (manualError) {
            console.error('Manual extraction failed:', manualError);
          }
        }
      }

      // If we have valid JSON data, return it
      if (jsonData && Array.isArray(jsonData)) {
        console.log('Returning parsed JSON array to client');
        return NextResponse.json(jsonData);
      }

      // If all parsing attempts failed, return the raw response
      console.log('Returning raw response to client');
      return NextResponse.json({
        rawResponse: data.response,
        error: 'Failed to parse JSON from LLM response'
      });
    }
  } catch (error) {
    console.log('=== FATAL ERROR IN KEYWORD RESEARCH ===');
    console.error('Error in keyword research:', error);
    return NextResponse.json(
      { error: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
