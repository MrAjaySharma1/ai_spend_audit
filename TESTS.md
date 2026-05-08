# Testing Strategy

## Philosophy
We prioritize high-coverage testing of the **Audit Engine**, as it represents the core value proposition and financial accuracy of the app. UI testing is handled via manual verification and browser-based smoke tests.

## Test Suite
- **Audit Engine Logic**: Verified via Vitest (`src/lib/audit-engine.test.ts`).
  - [x] Duplicate Tool Detection
  - [x] Enterprise-to-Pro Downgrade logic
  - [x] API-vs-Seat recommendation
  - [x] Premium Tier (ChatGPT Pro) validation
  - [x] Mathematical accuracy of monthly/annual savings

## Manual Verification Checklist
1. [x] Form persistence across page reloads.
2. [x] Responsive layout on mobile vs desktop.
3. [x] Share link generation and clipboard copying.
4. [x] Lead capture modal validation and submission.
5. [x] Empty state handling (no tools entered).

## Running Tests
```bash
npx vitest run
```
