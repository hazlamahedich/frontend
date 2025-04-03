import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Validate URL format
    new URL(url);

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SurgeSEO/1.0; +https://surge-seo.com/bot)',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || '';

    // Only process HTML content
    if (!contentType.includes('text/html')) {
      return NextResponse.json(
        { error: 'URL does not point to an HTML page' },
        { status: 400 }
      );
    }

    // Get the page content
    const content = await response.text();
    const contentSize = content.length;

    return NextResponse.json({
      content,
      contentSize,
      url,
      timestamp: new Date().toISOString(),
      contentType
    });
  } catch (error) {
    console.error('Error fetching page:', error);

    return NextResponse.json(
      { error: 'Failed to fetch page content' },
      { status: 500 }
    );
  }
}
