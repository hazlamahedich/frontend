# Surge - AI-Powered SEO Platform

Surge is a next-generation, AI-powered SEO platform that leverages advanced LLM capabilities to provide innovative features and extensive automation for SEO professionals and businesses.

## Features

- **AI Strategy Engine**: Get customized SEO strategies based on your industry, competitors, and website performance
- **Content Optimization**: Analyze and optimize your content with AI-powered recommendations
- **Real-Time SERP Monitoring**: Track your rankings with real-time SERP monitoring
- **Keyword Intelligence**: Discover high-value keywords with our AI-powered keyword research tool
- **Technical SEO Audit**: Identify and fix technical SEO issues with our comprehensive site audit
- **Predictive SEO Modeling**: Simulate the impact of SEO changes before implementing them
- **Flexible LLM Integration**: Support for multiple LLM providers (OpenAI, Anthropic, Mistral, Together.ai, OpenRouter) and locally hosted models via Ollama

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **UI**: React 18+, Tailwind CSS, shadcn/ui components
- **Animation**: Framer Motion
- **AI Integration**: LiteLLM, LangChain.js, LangGraph.js
- **State Management**: Zustand + React Query
- **Deployment**: Vercel

## LLM Integration

Surge features a flexible LLM integration system that allows users to choose from various providers:

### Cloud Providers
- **OpenAI**: GPT-4o, GPT-3.5 Turbo
- **Anthropic**: Claude 3 Opus, Claude 3 Sonnet
- **Mistral AI**: Mistral Large, Mistral Small
- **Together.ai**: Llama 3 70B, DeepSeek Coder 33B
- **OpenRouter.ai**: Access to multiple models through a unified API

### Local Hosting
- **Ollama**: Run models locally including Llama 3 and DeepSeek Coder

### Custom Models
- Premium users can configure custom model endpoints

Users can set their preferred provider and hosting type in the AI Model Settings page, and the system will automatically select the best model based on the user's subscription tier and preferences.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key (and optionally Anthropic, Mistral API keys)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/surge.git
   cd surge/frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your API keys and Supabase credentials.

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

1. Create a new Supabase project
2. Run the SQL script in `src/lib/supabase/schema.sql` in the Supabase SQL editor

## Project Structure

- `src/app`: Next.js App Router pages and API routes
- `src/components`: React components
- `src/lib`: Utility functions and services
  - `src/lib/ai`: AI-related utilities and services
  - `src/lib/supabase`: Supabase client and utilities
  - `src/lib/utils`: General utility functions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [LangChain.js](https://js.langchain.com/)
- [LangGraph.js](https://github.com/langchain-ai/langgraphjs)
