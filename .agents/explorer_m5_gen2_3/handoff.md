# Handoff Report: E2E Tier 4 Test Defects Analysis

## 1. Observation
- **Stripe Mock Defect**: The mocks in `e2e/tier4/tier4-scenarios.spec.ts` for Stripe checkouts return `window.location.href = '/?success=true'` (line 135) and `/?cancelled=true` (line 291). Because Playwright intercepts the Stripe domain, the relative redirect resolves to `https://checkout.stripe.com/?success=true` and `https://billing.stripe.com/?cancelled=true`, creating a redirect loop and failing to return to the app domain.
- **Missing Download Action**: Test 2 asserts the lack of a watermark before concluding but skips the download steps, contrary to the comment `// 10. Download the image` (lines 188-189).
- **Permissive API Mock**: The `**/api/generate` mocks across tests unconditionally return `status: 200` without validating credit exhaustion (lines 27-35, 106-118, 204-212, 264-276).
- **Race Conditions**: The `uploadAndGenerate` helper and inline test loops (Tests 2, 3, and 4) call `fileInput.setInputFiles(...)` and immediately click "Generate" without awaiting the image preview rendering (`img[alt*="preview" i]`), risking test flakiness (e.g., lines 145-152, 226-229).
- **Missing UI Reset**: Tests 2, 3, and 4 execute loops that upload and generate multiple images consecutively. However, the app's `GenerationResult.tsx` replaces the `UploadZone.tsx` upon success. The tests fail to click the "Generate Another" button (defined in `app/generate/page.tsx:140`) to reset the UI before the next iteration.
- **Missing API Mocks**: Test 4 assumes the app directly hardcodes `billing.stripe.com` upon clicking "Manage Subscription", omitting the intermediate backend call that typically creates the portal session (`**/api/portal`).
- **Button Name Mismatch (Bonus)**: Tests attempt to click `page.getByRole('button', { name: /generate ai headshot/i })`, but the app's button text is "Generate Now (1 Credit)" (`app/generate/page.tsx:113`).

## 2. Logic Chain
1. To fix the Stripe loop, the mock injected script must specify an absolute URL pointing to the app's test base URL (`http://localhost:3000/?success=true`).
2. Test 2 needs to trigger and wait for the download event to fully validate the scenario, matching Test 1's behavior.
3. The `**/api/generate` route should conditionally return an HTTP 403 response with an error payload when limits are exhausted (`credits <= 0 && freeUsed >= 3`) to realistically trigger UI paywalls driven by backend enforcement.
4. Adding `await expect(page.locator('img[alt*="preview" i]').first()).toBeVisible()` directly after `setInputFiles` prevents the "Generate" click from firing before React state updates and the upload button becomes active.
5. Injecting `await page.getByRole('button', { name: /generate another/i }).click()` at the end of each generation loop resets the application state to `'idle'`, re-rendering the file input for subsequent iterations.
6. Test 4 must include `await page.route('**/api/portal', ...)` to satisfy the pattern of calling a backend endpoint before navigating to Stripe.
7. Updating the locator regex to `/generate/i` or `/generate now/i` is required because the actual UI label differs from the test script assumption.

## 3. Caveats
- The app's frontend primarily uses `localStorage.getItem('headshot_count')` to trigger the paywall *before* calling the backend. Changing the mock to return 403 is correct for robust full-stack validation, but the frontend may not reach the 403 response if local limits are hit first.
- The tests assume "Account" and "Manage Subscription" UI elements exist, though `src/app` currently lacks a dedicated `/account` page. Modifying the tests to fulfill the scenarios is prioritized, assuming these elements are injected or tested via integration boundaries.
- I acted in a read-only capacity; the proposed fixes should be applied by an implementer.

## 4. Conclusion
The file `e2e/tier4/tier4-scenarios.spec.ts` requires the following modifications to pass:
1. Replace relative paths in Stripe mocks with `http://localhost:3000/?...`.
2. Append `page.waitForEvent('download')` logic to Test 2.
3. Update `**/api/generate` mocks to return HTTP 403 when out of credits.
4. Insert preview visibility assertions (`img[alt*="preview" i]`) in all upload sequences.
5. Insert "Generate Another" button clicks at the end of generation loops.
6. Add an `**/api/portal` mock for Test 4 returning a Stripe portal session URL.
7. Correct the button click regex to `/generate/i` or `/generate now/i`.

## 5. Verification Method
After an implementer applies these changes, run the test suite using:
```bash
npx playwright test e2e/tier4/tier4-scenarios.spec.ts
```
A successful implementation will yield 0 failures without redirect loops, race condition timeouts, or locator errors.
