# Handoff Report: E2E Tier 4 Tests Fix Strategy

## 1. Observation
- **Stripe Mock Defect:** In `e2e/tier4/tier4-scenarios.spec.ts` at line 135 and 291, the Stripe mocks return `<script>window.location.href = '/?success=true';</script>` on origins like `checkout.stripe.com`. This causes a redirect to `https://checkout.stripe.com/?success=true` instead of the local app.
- **Missing Download Action:** In Test 2 (line 188), the code says `// 10. Download the image` but only checks for the watermark visibility. The actual Playwright download action (`waitForEvent('download')`) is missing.
- **Permissive API Mock:** In Test 2 (line 106-118), Test 3 (line 204-212), and Test 4 (line 264-276), the `**/api/generate` mock indiscriminately returns HTTP 200 OK. It does not enforce out-of-credits errors (e.g., HTTP 403), relying solely on the UI which violates realistic API expectations.
- **Race Conditions:** In Test 2 (line 145-152), Test 3 (line 226-229), and Test 4 (line 306-307, 316-317), the code uploads a file and immediately clicks "Generate AI Headshot". Unlike Test 1, there is no `await expect(page.locator('img[alt*="preview" i]').first()).toBeVisible();` to ensure the preview has loaded.
- **Missing UI Reset:** In the loops of Test 2 (line 155), Test 3 (line 224), and Test 4 (line 305), the test consecutively uploads and generates images. It assumes the file input remains in the DOM and fails to reset the UI state between generations.
- **Missing API Mocks:** Test 4 (line 284) mocks the Stripe billing domain but lacks the `/api/portal` backend mock that returns the portal URL.

## 2. Logic Chain
1. The Stripe mock redirect uses a relative path. `playwright.config.ts` defines `baseURL: 'http://localhost:3000'`. Using absolute URLs in the mock (`http://localhost:3000/?success=true`) will resolve the redirect loop.
2. The missing download action means Test 2 isn't actually testing the download functionality of unwatermarked images. Appending the Playwright download pattern fixes this.
3. The app is expected to show a paywall when the API returns a limit error. Since opaque-box E2E testing evaluates integrated behavior, the `**/api/generate` mock must accurately simulate the backend's enforcement (HTTP 403) when limits are exceeded.
4. Without waiting for the image preview, Playwright might attempt to generate before the application has finished handling the `onFileChange` event, causing sporadic test failures. Injecting a wait for the preview image locator guarantees the component is ready.
5. In a real application flow, after generating an image, the user must click a button (e.g., "Go Back" or "Generate Another") to return to the upload state. Simulating this UI reset in the loop allows subsequent iterations to succeed.
6. The "Manage Subscription" button typically invokes an API (like `/api/portal`) to create a Stripe portal session. Mocking this route provides the URL needed for the frontend to navigate to the Stripe mock.

## 3. Caveats
- The UI reset button is assumed to match `/generate another|go back/i`. If the actual implementation uses a different label, the locator might fail.
- It is assumed that the app is served at `http://localhost:3000` during tests, as indicated in `playwright.config.ts`.
- The exact paywall HTTP status code is assumed to be `403`. 

## 4. Conclusion
We must rewrite `e2e/tier4/tier4-scenarios.spec.ts` with these precise adjustments:
- Update Stripe mocks to use `window.location.href = 'http://localhost:3000/...';`
- Insert the download click and wait promise in Test 2.
- Refactor the `**/api/generate` intercepts to calculate credits correctly and return `status: 403` with an error message when limits are exceeded.
- Insert `await expect(page.locator('img[alt*="preview" i]').first()).toBeVisible();` before every `Generate AI Headshot` click.
- Insert `await page.getByRole('button', { name: /generate another|go back/i }).click();` at the end of loop iterations.
- Add an intercept for `**/api/portal` in Test 4 before clicking "Manage Subscription".

## 5. Verification Method
1. Execute `npm run test:e2e e2e/tier4/tier4-scenarios.spec.ts`.
2. Observe 0 test failures. The test should not timeout in loops, and the paywall modals should accurately appear due to the `403` HTTP status mocks.
