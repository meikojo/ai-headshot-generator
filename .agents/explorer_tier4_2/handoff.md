# Tier 4 E2E Test Strategy (Real-World Application Scenarios)

## Observation
An investigation of the application codebase reveals that the implementation severely deviates from the original requirements (`ORIGINAL_REQUEST.md`):
1. **Routes**: Only `/generate` and `/remove-bg` are implemented, not the 7 distinct tools under `/tools/[tool-name]`.
2. **Usage Tracking**: The requirement specifies Supabase IP & fingerprinting tracking and a `usage_tracking` table. The implementation tracks usage locally using `localStorage.getItem('headshot_count')` and server-side checks (`/api/generate`) do not block based on usage. The `usage_tracking` table does not exist; only a `user_credits` table exists.
3. **Monetization**: While Stripe checkout (`/api/credits/checkout`) and webhooks (`/api/webhook`) are present and update `user_credits` using the email from checkout, the UI completely lacks an authentication system for a user to log in and access these paid credits. 
4. **DOM Elements**: No `data-testid` attributes are present. Selectors must rely on element types (e.g., `input[type="file"]`) and visible text (e.g., `"Generate Now (1 Credit)"`, `"Out of Free Generations"`, `"Starter (10 Credits)"`).

## Logic Chain
Per `TEST_INFRA.md`, tests must be "Opaque-box, requirement-driven" and have "No dependency on implementation design". Thus, tests should simulate the expected user journeys. While some will invariably fail (which is the correct outcome for requirement-driven testing against missing features), the Playwright implementation strategy is as follows:

1. **Normal Free User exhausts quota**: Navigate to `/generate`. Upload a mock image via `input[type="file"]` and click "Generate Now". Repeat 3 times. On the 4th attempt, assert that the paywall appears (look for text `"Out of Free Generations"`). 
2. **Free User upgrades to Paid**: At the paywall, trigger the upgrade flow. Instead of navigating Stripe's UI, intercept the call to `/api/credits/checkout`. Then, manually trigger `/api/webhook` using Playwright's `request.post` with a mock `checkout.session.completed` payload signed via `stripe.webhooks.generateTestHeaderString`. Assert the user can subsequently generate a 4th image (this will fail in reality due to missing frontend auth).
3. **Incognito browser bypasses limit**: Exhaust quota in `browser.newContext()`. Create a second isolated context and verify the user can generate an image from scratch. (This will unexpectedly pass because the app uses `localStorage`).
4. **Existing Paid User accesses all tools**: Seed the Supabase `user_credits` table directly via `@supabase/supabase-js` with a test email and >0 credits. Attempt to navigate the UI as this user to generate images without seeing the paywall.
5. **Failed payment keeps user on free tier**: Click to upgrade but abort. Ensure the paywall remains blocking the generation.

## Caveats
- Since the application lacks a login mechanism, Scenario 4 ("Existing Paid User") is impossible to orchestrate gracefully from the UI. The test will need to attempt a flow and fail.
- The absence of the 7 `/tools/[tool-name]` means the tests will have to substitute `/generate` as the primary test vector, or fail immediately when trying to navigate to the 7 required routes. Given the requirement for opaque-box testing, asserting 404s on the missing routes is valid.
- There are no `data-testid` properties, so UI interactions might be brittle. We must use robust Playwright text locators like `getByText()`.

## Conclusion
The Tier 4 Playwright tests must be constructed using `d:/ai-headshot-generator/src/app`'s currently exposed elements, but they will actively highlight the application's failure to adhere to the requested architecture.
- **Mocking Stripe**: Do not navigate to the real Stripe URL. Use `request.post('/api/webhook')` with a valid test signature using the `stripe` Node module.
- **DB Operations**: Use the `@supabase/supabase-js` client in Playwright's `beforeAll/afterAll` hooks to insert/clean `user_credits` records.
- **Contexts**: Utilize `browser.newContext()` to simulate incognito windows.

## Verification Method
The Worker agent should implement these strategies in `d:/ai-headshot-generator/e2e/tier4/*.spec.ts`. Verification is achieved by running `npx playwright test e2e/tier4`. A correct requirement-driven opaque-box test will yield failures exactly where the app's implementation falls short.
