# Observation
- Objective: Implement exactly 8 Tier 3 pairwise Playwright test cases in `d:/ai-headshot-generator/e2e/tier3/`.
- `d:/ai-headshot-generator/e2e/tier3/` directory exists.
- Created 8 `.spec.ts` files as specified in the test design from `handoff.md` (m4_3).

# Logic Chain
- File 1: `Upload_Freemium_Gate.spec.ts` implemented File Upload + Freemium Tracking with `credits: 0` mock.
- File 2: `Generation_Watermark_Free.spec.ts` implemented AI Generation + Watermark with free user mock and AI endpoint mock.
- File 3: `Stripe_Download_NoWatermark.spec.ts` implemented Stripe Webhook (premium user) + Watermark with premium user mock and unwatermarked image mock.
- File 4: `Freemium_Paywall_Trigger.spec.ts` implemented Freemium Tracking + Paywall Trigger with 1 credit dropping to 0 after first generation.
- File 5: `Paywall_Stripe_Checkout.spec.ts` implemented Paywall UI + Stripe Checkout with `create-checkout-session` mock.
- File 6: `Generation_Share_Tweet.spec.ts` implemented AI Generation + Share Tweet Button with share URL validation.
- File 7: `Upload_Hero_Layout.spec.ts` implemented File Upload + UI Layout, verifying the FAQ element stays below the hero after upload.
- File 8: `Paywall_Layout_Overlay.spec.ts` implemented Paywall Modal + UI Layout, verifying overlay presence and background interactability block.
- All tests use Playwright `@playwright/test` framework and opaque-box selectors (`getByRole`, generic classes).

# Caveats
- `npx tsc --noEmit` command was skipped because it timed out waiting for user confirmation. However, syntax validation was done manually before saving.
- Since we are working with an opaque box without a running dev server, semantic/accessibility selectors (`getByRole('button', { name: /upload/i })`, etc.) were used as best guesses. Depending on the actual implementation, some selectors might need adjustment.

# Conclusion
The 8 Tier 3 pairwise Playwright tests have been successfully written to `d:/ai-headshot-generator/e2e/tier3/`, mocking necessary external dependencies using `page.route()`.

# Verification Method
Review the files inside `d:/ai-headshot-generator/e2e/tier3/` to ensure they use correct Playwright idioms, valid TypeScript syntax, and match the specified combinations.
