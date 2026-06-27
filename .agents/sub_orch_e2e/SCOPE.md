# Scope: E2E Test Suite

## Architecture
- 4 testing tiers (Tier 1-4) stored in `e2e/tier1`, `e2e/tier2`, `e2e/tier3`, `e2e/tier4`
- Test runner: Playwright

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Tier 1 Tests | Feature Coverage (55 tests) | none | IN_PROGRESS |
| 2 | Tier 2 Tests | Boundary & Corner Cases (55 tests) | M1 | IN_PROGRESS |
| 3 | Tier 3 Tests | Cross-Feature Interactions | M1, M2 | IN_PROGRESS |
| 4 | Tier 4 Tests | Real-World Application Scenarios | M1, M2, M3 | IN_PROGRESS |

## Interface Contracts
### e2e tests ↔ webapp
- Tests interact via DOM, network intercepts (for APIs like Supabase/Stripe/Clipdrop if needed, though opaque-box might prefer real or mock endpoints at the test boundary), and browser fingerprinting.
