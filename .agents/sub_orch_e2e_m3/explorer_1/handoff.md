# Handoff Report: Tier 3 Test Strategy (Cross-Feature Interactions)

## 1. Observation
- `TEST_INFRA.md` specifies 11 features, grouped into: Freemium (1), Tools (2-8), Usage Gate (9), Stripe (10), UI Theme (11).
- `TEST_INFRA.md` dictates that Tier 3 tests require "pairwise coverage of major feature interactions".
- `ORIGINAL_REQUEST.md` details specific integration points:
  - Tools call `/api/increment-usage` on success.
  - A shared `<UsageGate>` wraps tools and integrates with Stripe.
  - Stripe webhook sets `is_paid=true` in Supabase, bypassing the paywall and usage badge.
  - Tool pages have a consistent layout: 40% upload zone, 60% result display.

## 2. Logic Chain
- To achieve pairwise coverage of major features, we need to map interactions between the primary domains (Tools, Freemium Tracking, Usage Gate, Stripe Monetization, UI Layout).
- Interaction 1 (Tools + Freemium): Executing a tool (F2-F8) must increment the IP/fingerprint tracking (F1).
- Interaction 2 (Tools + Usage Gate): Exhausting limits via tools (F2-F8) must trigger the usage gate (F9).
- Interaction 3 (Usage Gate + Stripe): The Usage Gate (F9) must successfully transition users to Stripe checkout (F10).
- Interaction 4 (UI Theme + Tools): Tool pages (F2-F8) must adhere to the 40/60 layout split (F11).
- Interaction 5 (Stripe + Freemium): A paid user (via Stripe F10) must no longer be restricted by Freemium tracking (F1).
- Playwright's `test.describe` and `test` blocks will be used to structure these interactions in `e2e/tier3/interactions.spec.ts`.

## 3. Caveats
- The strategy does not specify the exact CSS selectors or API mocks since the actual implementation details (DOM structure, mock server behavior) are opaque as per the "opaque-box" philosophy.
- Mocks or database seeding will be required to test the Stripe + Freemium interaction without actually paying.

## 4. Conclusion
The proposed strategy for `d:/ai-headshot-generator/e2e/tier3/interactions.spec.ts` focuses on validating the 5 major cross-feature interactions.

### Proposed Test Structures and Descriptions:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tier 3: Cross-Feature Interactions', () => {

  test('Interaction: Tool + Freemium Tracking', async ({ page }) => {
    // Feature 2-8 + Feature 1
    // Description: Navigate to a tool page, perform a successful image generation/edit. 
    // Verify that the `/api/increment-usage` endpoint is called and the user's free usage count increases by 1.
  });

  test('Interaction: Tool + Usage Gate', async ({ page }) => {
    // Feature 2-8 + Feature 9
    // Description: Simulate a user who has already used their 3 free credits.
    // Attempt to use a tool and verify that the `<UsageGate>` component becomes visible, preventing the tool from executing.
  });

  test('Interaction: Usage Gate + Stripe Monetization', async ({ page }) => {
    // Feature 9 + Feature 10
    // Description: Trigger the Usage Gate. Click on one of the subscription plans ($3 or $12).
    // Verify that the application initiates a Stripe checkout session (e.g., via API call or redirection).
  });

  test('Interaction: UI Theme + Tool Layout', async ({ page }) => {
    // Feature 11 + Feature 2-8
    // Description: Navigate to any tool page (e.g., /tools/remove-background).
    // Measure the layout geometry to verify the upload zone takes approximately 40% of the layout and the result display takes 60%.
  });

  test('Interaction: Stripe Monetization + Freemium Limit Bypass', async ({ page }) => {
    // Feature 10 + Feature 1
    // Description: Mock a scenario where the user has `is_paid=true` (simulating a successful Stripe webhook).
    // Verify the user can perform a 4th tool action without the Usage Gate appearing.
  });

});
```

## 5. Verification Method
- Review the `handoff.md` file to ensure all interactions map accurately to the requirements in `ORIGINAL_REQUEST.md`.
- Ensure the provided structures are valid Playwright syntax and adhere to the opaque-box testing philosophy requested in `TEST_INFRA.md`.
