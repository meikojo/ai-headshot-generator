# Handoff Report: Tier 4 Scenarios E2E Tests

## 1. Observation
I reviewed `d:/ai-headshot-generator/e2e/tier4/tier4-scenarios.spec.ts`. Several structural issues, race conditions, and unmocked dependencies were found:

1. **Race Condition on Upload**: In Tests 2, 3, and 4, the `uploadAndGenerate` function (or equivalent loop) calls `fileInput.setInputFiles(...)` and immediately follows it with `page.getByRole('button', { name: /generate ai headshot/i }).click()`. 
   *(Contrast this with Test 1, which correctly waits for `img[alt*="preview" i]` to become visible before clicking the button).*
2. **Missing UI Reset Step**: In Tests 2, 3, and 4, `uploadAndGenerate` is called in tight loops. There is no step to click "Generate Another" or "Start Over". It simply re-uses the `input[type="file"]` locator.
3. **Missing Billing Portal API Mock**: In Test 4 (line 280+), the test clicks "Manage Subscription" and expects the page to navigate to `billing.stripe.com`, which it intercepts. However, there is no mock for the API call that would typically generate this portal session URL (e.g., `POST /api/create-portal-session`). 
4. **Backend Limit Enforcement Assumption**: The mock for `**/api/generate` (e.g. lines 106-118) always returns HTTP 200, even when `freeUsed >= 3` or `credits <= 0`.
5. **Generous Downgrade Logic**: In Test 4 (line 287), the mock resets `freeUsed = 0` when simulating a downgraded subscription, essentially granting the user 3 fresh free generations.

## 2. Logic Chain
1. **Race Condition**: If the frontend uploads the image to Cloudinary (as mocked) asynchronously upon selection, clicking "Generate" immediately will likely execute before the upload completes. If the form validation requires the uploaded image URL, the submit action will fail or be ignored.
2. **Missing UI Reset**: If the application replaces the upload dropzone with the generated result image (a standard UX pattern), the `input[type="file"]` element will be detached from the DOM. Playwright's subsequent `setInputFiles` calls will timeout waiting for the element to reappear.
3. **Missing Billing Portal API Mock**: Stripe Customer Portal URLs must be generated dynamically on the backend using a secret key. A frontend cannot hardcode this URL. When the frontend attempts to call the backend to get the portal URL, the unmocked request will 404, the navigation will never happen, and the test will timeout.
4. **Backend Limit Enforcement**: The test assumes the frontend handles the paywall logic entirely on the client side (e.g., checking `freeUsed >= 3` and showing the modal without attempting the generation). If the app relies on the backend to reject unauthorized generation requests with a `403` or `402`, the test's mock (which returns `200`) will cause the app to display a successfully generated image instead of the paywall modal, failing the test.

## 3. Caveats
- Since the application implementation code is not available, these challenges are based on standard frontend/backend architecture patterns. If the frontend is implemented as a single unmounting view (where uploader is always visible) and the Cloudinary mock is perfectly instantaneous, some of these might coincidentally pass.
- I was unable to compile the test with `tsc` due to user permission timeouts on my shell commands, but the TypeScript syntax is standard Playwright and looks valid.

## 4. Conclusion
The E2E tests contain severe race conditions and missing API mocks that will likely cause flakiness or outright failures. The missing "Reset" UI interaction in the loops and the missing `/api/create-portal-session` (or similar) mock are the highest risk items. The tests should be updated to wait for image upload completion (as Test 1 does), simulate "Generate Another" interactions in loops, and mock all necessary backend API calls.

## 5. Verification Method
- Run `npx playwright test e2e/tier4/tier4-scenarios.spec.ts`.
- Watch the test execution to see if it hangs on `setInputFiles` during the second loop iteration.
- Throttling the network during test execution will easily expose the upload race condition in Tests 2, 3, and 4.
- Inspect the network tab during the Test 4 "Manage Subscription" click to observe the unmocked portal session API call failing.
