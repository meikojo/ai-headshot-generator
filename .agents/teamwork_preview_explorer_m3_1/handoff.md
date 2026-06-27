# Handoff Report: E2E Tier 2 Test Plan

## 1. Observation
- `TEST_INFRA.md` specifies 8 features requiring testing.
- Coverage threshold for Tier 2: ≥5 tests per feature (Total: 40 tests).
- Focus of Tier 2: Boundary, Corner Case, and Error State testing.
- Methodology constraints: Opaque-box, requirement-driven. No dependency on implementation internals. Rely on accessible roles and semantic web selectors.
- Network operations constraints: External APIs (Replicate, Stripe, etc.) must be mocked using Playwright's `page.route()`.
- Reference tests in `e2e/tier1/*.spec.ts` use standard Playwright test structures (`test.describe`, `test.beforeEach`, `test`) and mock API paths like `**/api/generate`.

## 2. Logic Chain
Based on the observations, we must design negative and edge-case scenarios for each of the 8 features, totaling 40 tests. The design logic is as follows:

**Feature 1: File Upload & Preview (`01-upload-errors.spec.ts`)**
1. *Error State:* Uploading an unsupported file format (e.g., `.txt`) shows a validation error and prevents generation.
2. *Error State:* Uploading a 0-byte file shows an "empty file" error.
3. *Boundary:* Uploading a file exceeding the maximum size limit (e.g., via a large buffer mock) shows a "file too large" error.
4. *Corner Case:* Uploading multiple files concurrently rejects the input or shows a warning.
5. *Corner Case:* Uploading a file with an extremely long file name (e.g., 255+ characters) renders the name without breaking the UI layout.

**Feature 2: AI Generation & Loading (`02-generation-errors.spec.ts`)**
1. *Error State:* API returns a 500 status (mocked via `page.route`) – UI displays a user-friendly server error message.
2. *Error State:* API returns a 429 Rate Limit status (mocked) – UI handles it gracefully and alerts the user to wait.
3. *Error State:* Network timeout (mocked by aborting the route) – UI displays a connection error instead of infinite loading.
4. *Corner Case:* Rapidly double-clicking the "Generate" button only triggers a single API request and safely disables the button.
5. *Error State:* API returns a 200 status but malformed JSON (missing URL) – UI handles the invalid data without crashing.

**Feature 3: Freemium Count Tracking (`03-freemium-errors.spec.ts`)**
1. *Boundary:* With exactly 1 free generation remaining, triggering generation successfully decrements the counter to 0.
2. *Boundary:* Attempting to generate when the count is exactly 0 immediately triggers the paywall modal without firing an API request.
3. *Error State:* If the backend/API fails during generation (mocked 500), the freemium count is *not* decremented.
4. *Corner Case:* Simulating an invalid/corrupted local freemium count (e.g., negative number via mocked state) forces a safe fallback state (like showing 0 remaining).
5. *Corner Case:* Reloading the page during a generation process preserves the correct decremented count upon return.

**Feature 4: Paywall Modal & UI (`04-paywall-errors.spec.ts`)**
1. *Corner Case:* Pressing the `Escape` key successfully closes the paywall modal and returns focus to the main page.
2. *Corner Case:* Clicking on the modal's external backdrop (overlay) closes the modal.
3. *Boundary:* Focus is trapped within the modal while it is open (tabbing repeatedly cycles through modal elements only).
4. *Error State:* Mocking a failure to load pricing tiers from the server displays a fallback error within the modal.
5. *Corner Case:* Opening the paywall multiple times in quick succession does not spawn duplicate DOM modals or lock the UI.

**Feature 5: Stripe Checkout & Webhook (`05-checkout-errors.spec.ts`)**
1. *Error State:* Mocking a 500 error when the user clicks "Checkout" shows an error message instead of redirecting.
2. *Error State:* Simulating a canceled checkout (e.g., returning to `/?canceled=true`) correctly displays a cancellation banner and no upgrade occurs.
3. *Corner Case:* Simulating a Stripe webhook processing delay – the UI provides a "processing payment" or polling indicator when the user returns.
4. *Error State:* Simulating a webhook failure (if exposed to UI polling) shows a "Payment verification failed" message.
5. *Error State:* Clicking the checkout button while disconnected from the network (mocked offline) shows a network error.

**Feature 6: Download & Watermark (`06-download-errors.spec.ts`)**
1. *Error State:* Mocking a 404 response for the image download URL shows an error and does not trigger a broken download.
2. *Corner Case:* Attempting to click the download button before generation is fully complete (button disabled state verification).
3. *Boundary:* A free user's downloaded image includes watermark parameters (verified by checking the href or simulated download parameters).
4. *Boundary:* A paid user's downloaded image does *not* include watermark parameters.
5. *Error State:* Simulating a failure during the Blob creation/download process surfaces an error to the user.

**Feature 7: Share/Copy Tweet Button (`07-share-errors.spec.ts`)**
1. *Error State:* Mocking a denial of clipboard permissions causes the "Copy" button to show a "Failed to copy" tooltip rather than crashing.
2. *Corner Case:* The share button is disabled and completely unclickable before an image is generated.
3. *Boundary:* Ensuring the generated tweet text falls within standard character limits and appropriately URL-encodes the content.
4. *Error State:* Mocking a network failure while generating a shareable link displays a graceful fallback.
5. *Corner Case:* Clicking the copy button repeatedly rapidly toggles the "Copied!" feedback without permanent UI glitches.

**Feature 8: UI Layout (Hero, FAQ) (`08-layout-errors.spec.ts`)**
1. *Boundary:* Narrow viewport (320px) – FAQ elements do not overflow the screen horizontally.
2. *Boundary:* Wide viewport (3840px) – the main content remains constrained within a max-width container and doesn't stretch infinitely.
3. *Corner Case:* Opening all FAQ items simultaneously does not break the vertical page layout or hide the footer.
4. *Error State:* Mocking a failure for the Hero image to load (404) ensures the layout does not collapse and alt text is displayed.
5. *Corner Case:* Rapidly toggling a single FAQ accordion item during its open/close animation resolves cleanly without getting stuck in a half-open state.

## 3. Caveats
- The exact CSS classes, ARIA roles, or data-testids needed for these tests depend on the DOM structure. Selectors will need to be written dynamically by the implementer using standard Playwright accessible locators (e.g., `getByRole`, `getByLabel`).
- Mocking webhook behavior entirely from the frontend (Feature 5) might be tricky if the UI relies on polling an endpoint; the mock should intercept the polling endpoint (e.g., `**/api/user/status`).
- Testing clipboard API failures (Feature 7) in Playwright requires granting/denying specific browser context permissions (`context.grantPermissions([])`).
- Simulating a file size limit (Feature 1) can be done by creating a large dummy `Buffer` in memory.

## 4. Conclusion
The test plan covers all 8 features with precisely 5 scenarios each, meeting the 40 test minimum. It focuses on non-happy-path flows: boundary tests, network errors, mocked API rejections, and UI corner cases, aligning perfectly with the Tier 2 testing requirements.

## 5. Verification Method
- **Implementer**: Read the 40 scenarios above. Create 8 files in `e2e/tier2/` (e.g., `01-upload-errors.spec.ts` through `08-layout-errors.spec.ts`).
- **Reviewer**: Verify that exactly 40 tests are created and that `npx playwright test e2e/tier2` runs successfully.
- **Auditor**: Check that `page.route` is heavily utilized to mock negative responses (500s, 429s, 404s) and no external networks are hit.
