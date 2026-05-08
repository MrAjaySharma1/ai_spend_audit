# Architecture Document

## Design Principles
1. **Separation of Concerns**: Audit logic is decoupled from the UI (React) and the API (Next.js Routes).
2. **Deterministic Over AI**: The core financial reasoning uses a rule-based engine to ensure accuracy. AI is only used for synthesizing summaries.
3. **Resilience**: The app gracefully degrades if external APIs (Anthropic, Supabase) are unavailable.
4. **Performance**: Minimal client-side JavaScript where possible; heavy use of server-side data processing.

## Components

### 1. Audit Engine (`src/lib/audit-engine.ts`)
A pure function library that takes user input (tools, seats, spend) and runs it against a set of business rules:
- **Small Team/Enterprise Rule**: Downgrades teams <= 5 to Pro tiers.
- **Duplicate IDE Rule**: Flags overlapping subscriptions (Cursor + Copilot).
- **API vs Seat Rule**: Recommends PAYG API for low-usage small teams.
- **Unnecessary Premium Rule**: Flags excessive tiers like ChatGPT Pro ($200/mo).

### 2. Pricing Data (`src/lib/pricing-data.ts`)
The authoritative "source of truth" for AI tool pricing. Structured as a lookup table for easy updates.

### 3. API Routes
- `/api/audit`: The main entry point. Handles rate limiting, calls the audit engine, generates AI summaries, and persists results to Supabase.
- `/api/leads`: Captures user contact info for post-audit conversion.

### 4. Database Schema (Supabase)
Relational storage for audits and leads.
- `audits`: Stores input parameters and calculated results (JSONB).
- `leads`: Stores contact information linked to share IDs.

## Data Flow
1. User enters data into `AuditForm`.
2. Form persists to `localStorage`.
3. On Submit, data is sent to `/api/audit`.
4. API runs the `AuditEngine`.
5. API calls Anthropic for a summary.
6. API saves to Supabase and returns a `shareId`.
7. User is redirected to `/results/[shareId]`.
8. Results page loads data from `localStorage` (instant) or Supabase (if via share link).
