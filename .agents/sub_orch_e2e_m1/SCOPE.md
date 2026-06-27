# Scope: Tier 1 Tests

## Architecture
- Playwright E2E tests covering Tier 1 Feature Coverage (happy path, basic functionality).
- Written in TypeScript, placed in `d:/ai-headshot-generator/e2e/tier1/`.
- Must cover the 11 features defined in `TEST_INFRA.md` with >= 5 tests per feature.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Tier 1 E2E | Implement >= 5 tests for each of the 11 features | none | IN_PROGRESS |

## Interface Contracts
### Tests ↔ Application
- Uses Playwright opaque-box testing. Navigates to `/` and `/tools/*`.
- Does not import application source code directly.
