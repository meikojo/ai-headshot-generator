# SCOPE — Tier 2 Tests

## Objective
Write 55 Tier 2 Playwright tests for the AI Image Studio project.
Location: `d:/ai-headshot-generator/e2e/tier2/`

## Requirements
Tier 2 is Boundary & Corner Cases. ≥5 tests per feature.

Features:
1. Freemium IP & Fingerprinting (5 tests)
2. Remove Background Tool (5 tests)
3. Cleanup Tool (5 tests)
4. Replace Background Tool (5 tests)
5. Reimagine Tool (5 tests)
6. Upscale Tool (5 tests)
7. Uncrop Tool (5 tests)
8. Text to Image Tool (5 tests)
9. Usage Gate & Paywall (5 tests)
10. Stripe Monetization & Webhook (5 tests)
11. UI Theme & Layout (5 tests)

Total: 55 tests.

### Focus
- Boundary conditions, edge cases, error-prone inputs.
- Empty inputs, max-size inputs, zero/negative values, domain-specific extremes.
- Missing configuration gracefully handled.
- Tests should use mocked network requests where external APIs are involved (Clipdrop, Stripe).
