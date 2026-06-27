# Handoff Report: Tier 4 E2E Test Strategy

## 1. Observation
- **Application Routes**: Only `/generate` and `/remove-bg` exist. The 5 other requested tools (e.g., `/tools/cleanup`, `/tools/reimagine`) are completely missing.
- **Freemium Enforcement**: The app currently uses client-side tracking (`localStorage.getItem('headshot_count')`) instead of the required Supabase IP and canvas-fingerprinting tracking system. The `/remove-bg` tool has no usage limits at all.
- **Monetization Architecture**: The Stripe checkout integration (`/api/credits/checkout`) does not capture the user's IP, nor is there a frontend login system. The Stripe webhook (`/api/webhook`) successfully updates the `user_credits` table (instead of the required `usage_tracking` table) using the email provided during Stripe checkout.
- **DOM Selectors**:
  - File upload: `input[type="file"]`
  - Generate button: `button:has-text("Generate Now")`
  - Paywall trigger: Appears when `localStorage` count >= 3, contains text `"Out of Free Generations"`.

## 2. Logic Chain
- **Testing Approach**: Since `TEST_INFRA.md` dictates "opaque-box, requirement-driven" testing, the tests must be written against the *expected* behavior defined in `ORIGINAL_REQUEST.md`, even though the current implementation is flawed.
- **Scenario 1 (Quota Exhaustion)**: Tests should intercept `**/api/generate` using `page.route` to return mock data (`{ resultUrl: 'fake.jpg', id: '1' }`). This prevents the test from burning real Replicate API credits while testing the 3-use limit.
- **Scenario 2 & 5 (Stripe Mocking)**: Playwright cannot easily use real Stripe test cards in a headless CI environment without flakiness. The tests should intercept the `**/api/credits/checkout` route to prevent redirecting to Stripe, and instead directly mutate the Supabase `user_credits` (or `usage_tracking`) table using the Supabase Node client (`@supabase/supabase-js`) with the service role key to simulate the webhook's effect.
- **Scenario 3 (Incognito)**: Playwright's `browser.newContext()` natively simulates an incognito session with isolated `localStorage`. However, to test the required IP tracking properly, the test must also inject a mock IP header during context creation: `await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': '203.0.113.1' } })`.
- **Scenario 4 (All Tools)**: The test should loop through all 7 required tool routes and attempt an upload. It must assert that the generation succeeds. 

## 3. Caveats
- **Guaranteed Test Failures**: Scenarios 2 and 4 will fail on the current codebase. Because the app has no authentication system and relies on `localStorage` instead of IP tracking, there is no way for the frontend to recognize that a user has paid. Furthermore, tests hitting the 5 missing tool routes will result in 404s.
- **Database Mismatch**: The requirements specify a `usage_tracking` table, but the current DB uses `user_credits`. The test setup scripts might need to target `user_credits` to align with the current schema, or create the `usage_tracking` table if strict adherence to requirements is prioritized.
- **Missing `/api/check-limit`**: The requirement dictates checking limits server-side, but this API route does not exist. Tests assuming server-side blockage on the 4th request will fail, as the backend `/api/generate` route currently allows infinite generations.

## 4. Conclusion
The Worker agent should implement `d:/ai-headshot-generator/e2e/tier4/real-world.spec.ts` using the following plan:
1. **Setup**: Import `@supabase/supabase-js` to directly manipulate the database state before/after tests.
2. **Scenario 1**: Mock `/api/generate`. Upload an image 3 times. Verify the 4th attempt renders the `"Out of Free Generations"` paywall.
3. **Scenario 2**: Exhaust quota, click "Pro", intercept the checkout route, use the Supabase client to add 50 credits to the user's DB record, then attempt a 4th generation. (Will fail but accurately tests the requirement).
4. **Scenario 3**: Create two Playwright contexts with different `x-forwarded-for` headers. Verify both contexts get 3 independent free uses.
5. **Scenario 4**: Seed the DB with a paid user state. Array.forEach over all 7 tool routes, upload an image, and verify the paywall does not appear. (Will fail on 404s).
6. **Scenario 5**: Exhaust quota, click checkout but abort (no DB update), verify the 4th attempt is still blocked.

## 5. Verification Method
- Execute the Playwright tests using `npx playwright test e2e/tier4/real-world.spec.ts`.
- The tests are expected to run and fail specifically on the assertions that expose the missing tools and disconnected payment architecture.
- You can manually inspect `src/app/generate/page.tsx` line 25 to verify that `localStorage` is being used instead of server-side tracking.
