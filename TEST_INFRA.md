# E2E Test Infra: AI Image Studio

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|----------------------|:------:|:------:|:------:|
| 1 | Freemium IP & Fingerprinting | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Remove Background Tool | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 3 | Cleanup Tool | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 4 | Replace Background Tool | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 5 | Reimagine Tool | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 6 | Upscale Tool | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | Uncrop Tool | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 8 | Text to Image Tool | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 9 | Usage Gate & Paywall | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 10 | Stripe Monetization & Webhook | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 11 | UI Theme & Layout | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |

## Test Architecture
- **Test runner**: Playwright (`npx playwright test`)
- **Invocation**: `npx playwright test`
- **Pass/Fail semantics**: 0 exit code indicates all tests passed.
- **Test case format**: TypeScript files (`.spec.ts`)
- **Directory layout**: `d:/ai-headshot-generator/e2e/`
  - `e2e/tier1/`
  - `e2e/tier2/`
  - `e2e/tier3/`
  - `e2e/tier4/`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Normal Free User exhausts quota | 1, 2, 9, 11 | High |
| 2 | Free User upgrades to Paid and uses tools indefinitely | 1, 9, 10, 4, 5, 11 | High |
| 3 | Incognito browser bypasses limit | 1, 3, 6, 9 | Medium |
| 4 | Existing Paid User accesses all tools | 10, 7, 8, 11 | Medium |
| 5 | Failed payment keeps user on free tier | 9, 10 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature
- Tier 3: pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
