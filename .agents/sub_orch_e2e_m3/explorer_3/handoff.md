# Handoff Report: Tier 3 Tests (Cross-Feature Interactions) Analysis

## 1. Observation
- `d:/ai-headshot-generator/ORIGINAL_REQUEST.md` (lines 17-27) outlines core features: Freemium Enforcement System (R1), Clipdrop Tools (R2), Usage Gate and Monetization / Stripe (R3), UI/UX Design System (R4).
- `d:/ai-headshot-generator/TEST_INFRA.md` (line 45) specifies that Tier 3 requires "pairwise coverage of major feature interactions".
- `d:/ai-headshot-generator/TEST_INFRA.md` (lines 33-40) specifies that full user journey scenarios (e.g., normal user exhausts quota, upgrades, uses tools) belong to Tier 4.

## 2. Logic Chain
- Because Tier 4 handles end-to-end user journeys, Tier 3 must focus purely on the integration boundaries between major subsystems.
- Based on `ORIGINAL_REQUEST.md`, the major subsystems are: F1 (Freemium Tracking), F2 (Clipdrop Tools), F3 (Usage Gate), F4 (Stripe Monetization), and F5 (UI Theme/Layout).
- We can derive critical pairwise interactions:
  - **F1 x F2:** Tools must share a unified freemium quota, rather than having individual quotas.
  - **F2 x F3:** The Usage Gate must dynamically respond to tool actions (decrementing uses) and successfully block tool interaction when empty.
  - **F2 x F5:** The layout system (40% upload, 60% result) must maintain integrity across structurally different tools (e.g., image-upload tools vs. text-to-image tools).
  - **F3 x F4:** The Usage Gate component must immediately unmount/unlock when Stripe updates a user's status.
  - **F1 x F4:** The underlying `/api/check-limit` must stop counting and return an unlimited state for Stripe-verified paid users.
- By structuring the Playwright tests around these specific interactions, we fulfill the Tier 3 pairwise requirement in a structured, targeted manner.

## 3. Caveats
- Exact selectors, network intercepts, and testing patterns (e.g., database seeding vs API mocking for Stripe) are not defined here, as implementation is not required in this phase.
- Assumes the Text-to-Image tool has a different input DOM structure than upload tools, making the F2 x F5 UI consistency test valuable.

## 4. Conclusion
Tier 3 testing in `interactions.spec.ts` should consist of 5 distinct `describe` blocks corresponding to the pairwise intersections of Freemium, Tools, Usage Gate, Stripe, and UI. This ensures robust integration before moving to Tier 4 user journeys.

### Proposed Structure for `d:/ai-headshot-generator/e2e/tier3/interactions.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tier 3: Cross-Feature Interactions', () => {

  test.describe('F1 (Freemium Tracking) x F2 (Clipdrop Tools)', () => {
    test('Cross-tool usage accumulates towards a single freemium quota', async ({ page }) => {
      // Strategy: Use Tool A, then Tool B, then Tool C.
      // Verify the server tracks this as 3 combined uses for the same fingerprint/IP.
    });
  });

  test.describe('F2 (Clipdrop Tools) x F3 (Usage Gate)', () => {
    test('Usage Gate badge dynamically updates upon successful tool execution', async ({ page }) => {
      // Strategy: Load tool. Verify badge = 3. Execute tool. Verify badge dynamically updates to 2.
    });
    
    test('Usage Gate completely blocks tool interaction when quota is 0', async ({ page }) => {
      // Strategy: Exhaust quota. Verify the tool input/upload section is completely overlaid/disabled by the paywall.
    });
  });

  test.describe('F2 (Clipdrop Tools) x F5 (UI Design System)', () => {
    test('Diverse tools maintain the 40/60 layout split on desktop', async ({ page }) => {
      // Strategy: Compare DOM flex/grid ratios of an upload-based tool vs a text-based tool.
    });

    test('Responsive behavior is consistent across diverse tools at 375px', async ({ page }) => {
      // Strategy: Set viewport to 375px. Ensure both upload-based and text-based tools stack correctly without horizontal overflow.
    });
  });

  test.describe('F3 (Usage Gate) x F4 (Stripe Monetization)', () => {
    test('Paywall unlocks immediately after successful Stripe webhook', async ({ request, page }) => {
      // Strategy: Exhaust quota. Simulate Stripe webhook success for current user. Verify paywall is removed.
    });
  });

  test.describe('F1 (Freemium Tracking) x F4 (Stripe Monetization)', () => {
    test('Paid user IP/fingerprint ignores freemium limits and usage incrementing', async ({ request }) => {
      // Strategy: Simulate paid user status. Call /api/increment-usage multiple times. 
      // Call /api/check-limit and verify it bypasses the 3-use limit.
    });
  });

});
```

## 5. Verification Method
- Implement the test cases within `d:/ai-headshot-generator/e2e/tier3/interactions.spec.ts`.
- Run the Playwright command: `npx playwright test e2e/tier3/interactions.spec.ts`
- Pass condition: 0 exit code, with all pairwise interaction tests validating the integration boundaries.
