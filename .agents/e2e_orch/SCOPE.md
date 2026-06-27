# Scope: E2E Test Suite Creation

## Architecture
- Playwright E2E framework under `d:/ai-headshot-generator/e2e/`
- Tests written in TypeScript using `@playwright/test`
- No dependency on implementation internals

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Infrastructure | Initialize Playwright, tsconfig, package.json scripts. | none | DONE |
| 2 | Tier 1 Tests | 40 tests covering all 8 features (Happy Path). | M1 | DONE |
| 3 | Tier 2 Tests | 40 tests covering boundaries, corner cases, error states. | M2 | DONE |
| 4 | Tier 3 Tests | 8 tests for pairwise combinations of major features. | M3 | DONE |
| 5 | Tier 4 Tests | 4 real-world application scenarios. | M4 | PLANNED |

## Interface Contracts
### Tests ↔ App
- App should run on `http://localhost:3000` or port configured by Playwright.
- Selectors should be based on accessibility roles, text, or specific semantic classes/IDs defined in the tests.
- Mocking: Replicate API and Stripe should be mockable via route interception in Playwright (`page.route()`) to avoid hitting real APIs during testing.
