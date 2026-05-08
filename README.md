# AI Spend Audit 🚀

AI Spend Audit is a production-quality SaaS tool designed to help startup founders and engineering managers optimize their AI tooling expenditures. It identifies overspending, recommends cost-effective alternatives, and provides an AI-powered personalized audit summary.

## Core Features
- **Deterministic Audit Engine**: Logic-based analysis of AI tool spend (not hallucinatory AI logic).
- **Lead Capture & Viral Sharing**: High-conversion landing page with shareable results.
- **AI-Powered Summaries**: Personalized insights generated via Anthropic Claude.
- **Data Persistence**: LocalStorage for session persistence and Supabase for lead/audit storage.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **UI Components**: Shadcn UI (Radix UI primitives).
- **Backend**: Next.js Server Components/Actions, Anthropic SDK.
- **Storage/DB**: Supabase.
- **Emails**: Resend.

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase Project (optional for local dev)
- Anthropic API Key (optional for local dev)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ANTHROPIC_API_KEY=your_api_key
   RESEND_API_KEY=your_resend_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Running Tests
```bash
npm test
```

## Repository Structure
- `src/app`: App Router pages and API routes.
- `src/components`: UI components and domain-specific components.
- `src/lib`: Core logic (Audit engine, pricing data, utility functions).

## License
MIT
