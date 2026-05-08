# Project Reflection

## Challenges
- **API Reliability**: Managing potential Anthropic API downtime required a robust fallback templating system.
- **Financial Accuracy**: Ensuring the audit logic didn't recommend impossible configurations (e.g., enterprise features on hobby plans).
- **UX Flow**: Designing a form that felt "pro" but wasn't overwhelming for users with many tools.

## Key Decisions
- **Deterministic Engine**: Decided against using AI to calculate savings. Financial tools must be predictable and auditable. AI is best suited for the *synthesis* of the result, not the *calculation*.
- **Glassmorphism Design**: Chose a high-end "Vercel/Linear" aesthetic to build immediate trust with a tech-savvy audience.
- **Privacy-First**: No requirement for account creation to see results. This maximizes conversion and virality.

## Future Improvements
- **Direct SSO Integration**: Pull seat counts directly from Google Workspace or GitHub.
- **Automated Implementation**: Provide one-click downgrade paths via vendor APIs.
- **Ongoing Monitoring**: Monthly email alerts when spend exceeds the optimized baseline.
