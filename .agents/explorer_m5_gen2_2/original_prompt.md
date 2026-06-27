## 2026-06-23T05:47:48+03:00
You are Explorer 2 for Milestone 5: Tier 4 Tests (E2E Testing Track) - Gen 2, Iteration 3.
Working directory: d:/ai-headshot-generator/.agents/explorer_m5_gen2_2/
Task:
1. We are fixing `e2e/tier4/tier4-scenarios.spec.ts`. The current implementation failed empirical verification.
2. The Challengers found the following critical defects:
   - **Stripe Mock Defect**: `window.location.href = '/?success=true'` runs on the Stripe mock's origin (`checkout.stripe.com` or `billing.stripe.com`), which leads to `https://checkout.stripe.com/?success=true` and causes a redirect loop. The mock should navigate to `http://localhost:3000/?success=true` or similar app domain.
   - **Missing Download Action**: Test 2 claims to test downloading the unwatermarked image but completely lacks the Playwright download actions (present in other tests).
   - **Permissive API Mock**: The `**/api/generate` mock indiscriminately returns HTTP 200 OK. It should return 402 or 403 when out of credits to trigger the paywall modal if the app relies on the backend for limit enforcement.
   - **Race Conditions**: Tests 2, 3, and 4 do not wait for the image upload to complete before clicking "Generate", unlike Test 1 which safely waits for a preview image.
   - **Missing UI Reset**: Tests 2, 3, and 4 loop through generation steps without resetting the UI (e.g. clicking a "Go Back" or "Generate Another" button), assuming the file input remains in the DOM after generation.
   - **Missing API Mocks**: Test 4 assumes "Manage Subscription" directly navigates to `billing.stripe.com` and lacks a mock for the backend API call (e.g. `/api/portal`) that generates the portal session URL.
3. Review `TEST_INFRA.md` and `e2e/tier4/tier4-scenarios.spec.ts`.
4. Produce a detailed fix strategy and action plan in `handoff.md` and send a message when done.
