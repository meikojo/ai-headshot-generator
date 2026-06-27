# Handoff Report

## Observation
We reviewed `e2e/tier4/tier4-scenarios.spec.ts` against the 6 critical defects reported by the Challenger.
1. **Stripe Mock Defect**: Lines 135 and 291 use `window.location.href = '/?success=true'` within a mocked `checkout.stripe.com` or `billing.stripe.com` route, respectively, leading to an infinite loop on the external domain.
2. **Missing Download Action**: Test 2 finishes around line 189 by just asserting the watermark is missing, but does not actually trigger or await a download event.
3. **Permissive API Mock**: The `**/api/generate` interceptors in Tests 2 (line 107) and 4 (line 264) indiscriminately return 200 OK even when credits are zero.
4. **Race Conditions**: Tests 2 (line 146), 3 (line 226), and 4 (line 306) call `setInputFiles` and then immediately click "Generate", without waiting for the preview image to render (unlike Test 1).
5. **Missing UI Reset**: The `for` loops in Tests 2 (line 155), 3 (line 224), and 4 (line 305) attempt to re-upload files without clicking a button (like "Generate Another") to reset the DOM state.
6. **Missing API Mocks**: Test 4 clicks "Manage Subscription" on line 295 expecting an external navigation, but lacks a mock for the API call (e.g., `/api/portal`) that provides the Stripe session URL.

## Logic Chain
1. **Stripe Mock**: We must explicitly point the mock script redirect back to the app's Playwright base URL (`http://localhost:3000/?success=true` and `http://localhost:3000/?cancelled=true`).
2. **Download Action**: We must append `page.waitForEvent('download')` and `.click()` the download button at the end of Test 2 to ensure the action is strictly covered.
3. **Permissive Mock**: We must add a condition `if (credits <= 0 && freeUsed >= 3)` to the `**/api/generate` mocks in Tests 2 and 4 that returns an HTTP 403 error. This accurately tests the frontend's paywall behavior in response to backend rejection.
4. **Race Conditions**: We must insert `await expect(page.locator('img[alt*="preview" i]').first()).toBeVisible();` immediately after every `setInputFiles` call across the affected tests.
5. **UI Reset**: We must add `await page.getByRole('button', { name: /generate another|go back|start over/i }).first().click();` at the end of each generation loop (for Test 3, only when `i < 4` to leave the last result on screen for download).
6. **Portal Mock**: We must add `await page.route('**/api/portal', ...)` in Test 4 returning a fake billing portal URL before clicking "Manage Subscription".

## Caveats
- The button name for resetting the UI is assumed to match the regex `/generate another|go back|start over/i`. If the application uses completely different copy, the locator will fail.
- We assume `http://localhost:3000` is the correct target for the Stripe redirect. This aligns with `playwright.config.ts`, but if testing runs against a deployed staging environment via dynamic config, this hardcoded URL might need to reflect the dynamic `baseURL`.

## Conclusion
The 6 defects are confirmed in the implementation. Applying the targeted fixes—fixing redirect URLs, enforcing backend HTTP status codes, adding explicit UI waits and reset clicks, and fulfilling missing mocks—will stabilize the e2e test suite and accurately validate the frontend logic.

## Verification Method
1. Apply the fixes to `e2e/tier4/tier4-scenarios.spec.ts`.
2. Run `npx playwright test e2e/tier4/tier4-scenarios.spec.ts`.
3. Verify an exit code of 0, meaning all scenarios complete successfully.
