# Task: Implement Tier 3 E2E Tests (Cross-Feature Interactions)

## Objective
Write Playwright tests inside `d:/ai-headshot-generator/e2e/tier3/interactions.spec.ts`.
You MUST implement a minimum of 11 distinct test cases covering pairwise major feature interactions, based on `ORIGINAL_REQUEST.md` and `TEST_INFRA.md`.

## Required Interactions (11 pairs)
1. Freemium (1) + Remove Background Tool (2)
2. Freemium (1) + Usage Gate (9)
3. Stripe Monetization (10) + Usage Gate (9)
4. Stripe Monetization (10) + Freemium (1)
5. UI Theme & Layout (11) + Text to Image Tool (8)
6. UI Theme & Layout (11) + Reimagine Tool (5)
7. Remove Background Tool (2) + Cleanup Tool (3)
8. Upscale Tool (6) + Freemium (1)
9. Uncrop Tool (7) + Usage Gate (9)
10. Replace Background Tool (4) + Stripe Monetization (10)
11. Cleanup Tool (3) + UI Theme & Layout (11)

## Instructions
- Ensure tests are opaque-box (testing user-facing UI and URL transitions, mock Stripe webhooks/sessions if necessary via page requests or UI).
- Write valid Playwright syntax.
- Verify that your code compiles correctly (e.g. `npx tsc --noEmit` or `npx playwright test e2e/tier3 --dry-run`).
- Write your completion report to `d:/ai-headshot-generator/.agents/sub_orch_e2e_m3/worker_1/handoff.md`. Include your compilation verification output.

## MANDATORY INTEGRITY WARNING
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
