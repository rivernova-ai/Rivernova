# Environment Setup

## Quick Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual API keys in `.env.local`:
   - **Supabase**: Get from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API
   - **Perplexity**: Get from [Perplexity API](https://www.perplexity.ai/settings/api)
   - **Anthropic**: Get from [Anthropic Console](https://console.anthropic.com/)

## Important
- **Never commit `.env.local`** - it contains your secrets
- Only commit `.env.example` - it's a template
- `.gitignore` already protects `.env*` files
