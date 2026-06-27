# Tier 3 E2E Test Design Handoff

## 1. Observation
- `TEST_INFRA.md` explicitly requires exactly 8 Tier 3 pairwise combination tests using Playwright (`npx playwright test`).
- The testing methodology must be opaque-box, meaning no assertions should rely on internal state or component design.
- `SCOPE.md` mandates that all external dependencies (Stripe API, AI generation endpoints) must be intercepted and mocked using Playwright's `page.route()`.
- The 8 major features to be combined are: (1) File Upload & Preview, (2) AI Generation & Loading, (3) Freemium Count Tracking, (4) Paywall Modal & UI, (5) Stripe Checkout & Webhook, (6) Download & Watermark, (7) Share/Copy Tweet Button, (8) UI Layout (Hero, FAQ).

## 2. Logic Chain
To satisfy the Tier 3 requirements, I have selected 8 pairwise combinations that represent critical intersection points in the user journey:
- **T3.1** verifies that a successful upload and generation correctly updates the free quota.
- **T3.2** verifies the boundary condition where exhausting the quota triggers the monetization flow instead of generation.
- **T3.3** bridges the internal UI with external payment providers.
- **T3.4** verifies that payment success correctly alters the core product output (removing the watermark).
- **T3.5** and **T3.6** test the core engagement loops (waiting for generation, then downloading or sharing).
- **T3.7** verifies the validation barrier between the upload and generation steps.
- **T3.8** verifies that the marketing layout effectively funnels users into the core upload interaction.

## 3. Caveats
- The test designs use generic actions (e.g., "Click Generate", "Upload a file"). The implementing agent will need to map these to the precise DOM selectors (preferably accessibility roles or data-test IDs).
- It is assumed that the Stripe implementation uses a backend endpoint to generate a session URL. The exact mocked endpoint (`**/api/checkout`, etc.) may need adjustment based on the actual backend routing.

## 4. Conclusion
The following 8 test cases have been designed and are ready for implementation:

### Test 1: Upload Updates Freemium Count
- **Features Combined:** (1) File Upload & Preview + (3) Freemium Count Tracking
- **Execution Flow:**
  1. Load application. Note the initial freemium count displayed in the UI (e.g., "3 left").
  2. Upload a valid image file via the drag-and-drop or file input.
  3. Verify the image preview renders correctly.
  4. Click the "Generate" button.
  5. Wait for the generation to complete.
  6. Verify the UI updates to show the decremented count (e.g., "2 left").
- **Mocks Needed:** 
  - `page.route('**/api/user')` to mock an initial state of 3 credits.
  - `page.route('**/api/generate')` to mock a successful image generation response and return 2 remaining credits.

### Test 2: Zero Count Triggers Paywall
- **Features Combined:** (3) Freemium Count Tracking + (4) Paywall Modal & UI
- **Execution Flow:**
  1. Load the application with the user state mocked to have 0 free generations.
  2. Verify the UI displays 0 credits remaining.
  3. Upload a valid image and click the "Generate" button.
  4. Verify that the AI generation loading state does NOT initiate.
  5. Verify that the Paywall Modal becomes visible on screen.
- **Mocks Needed:**
  - `page.route('**/api/user')` returning 0 credits.
  - `page.route('**/api/generate')` configured to assert it is never called, or returns a 403.

### Test 3: Paywall Redirects to Stripe Checkout
- **Features Combined:** (4) Paywall Modal & UI + (5) Stripe Checkout & Webhook
- **Execution Flow:**
  1. Load the application and trigger the Paywall Modal (either via a direct "Upgrade" button or by exhausting credits).
  2. Click the primary "Subscribe" or "Upgrade" CTA within the paywall.
  3. Verify the application initiates a redirect to the mocked Stripe Checkout URL instead of a real Stripe URL.
- **Mocks Needed:**
  - `page.route('**/api/checkout-session')` to intercept the backend call and return a dummy Stripe redirect URL (e.g., `https://mock-stripe.com/checkout`).

### Test 4: Premium User Downloads Without Watermark
- **Features Combined:** (5) Stripe Checkout & Webhook + (6) Download & Watermark
- **Execution Flow:**
  1. Load the application with the user state mocked as "Premium" (simulating a successful Stripe webhook).
  2. Upload an image and generate a headshot.
  3. Verify the generated image displayed in the UI does NOT contain a watermark.
  4. Click the "Download" button.
  5. Intercept the download event and verify the downloaded file does not have the watermark applied.
- **Mocks Needed:**
  - `page.route('**/api/user')` returning `isPremium: true`.
  - `page.route('**/api/generate')` returning a premium, unwatermarked image URL.

### Test 5: Free Generation Yields Watermarked Download
- **Features Combined:** (2) AI Generation & Loading + (6) Download & Watermark
- **Execution Flow:**
  1. Load the application as a free user with >0 credits.
  2. Upload an image and click "Generate".
  3. Observe the loading skeleton or spinner during the generation delay.
  4. Once generation completes, verify the displayed image has the visible watermark element.
  5. Click the "Download" button and intercept the file download to ensure it originates from the watermarked URL.
- **Mocks Needed:**
  - `page.route('**/api/generate')` programmed with an artificial delay (e.g., 2000ms) to allow loading state verification, eventually returning a watermarked image URL.

### Test 6: Share Tweet After Generation
- **Features Combined:** (2) AI Generation & Loading + (7) Share/Copy Tweet Button
- **Execution Flow:**
  1. Load application, upload image, and start an AI generation.
  2. Wait for the loading state to complete and the generated image to render.
  3. Locate and click the "Share on Twitter" (or X) button.
  4. Intercept the resulting new page/popup or check the `href` attribute.
  5. Verify the URL matches the Twitter intent format (`https://twitter.com/intent/tweet`) and contains the generated image's public link.
- **Mocks Needed:**
  - `page.route('**/api/generate')` returning a success response with a public image URL.

### Test 7: Invalid Upload Prevents Generation
- **Features Combined:** (1) File Upload & Preview + (2) AI Generation & Loading
- **Execution Flow:**
  1. Load the application.
  2. Upload an invalid file type (e.g., a `.pdf` or a file exceeding the size limit).
  3. Verify the UI displays a file validation error and prevents the image preview from showing.
  4. Verify the "Generate" button is disabled or, if clicked, does not trigger the loading sequence.
- **Mocks Needed:**
  - `page.route('**/api/generate')` to assert that the generation endpoint is NEVER called during this flow.

### Test 8: Hero CTA Navigates to Upload Layout
- **Features Combined:** (8) UI Layout (Hero, FAQ) + (1) File Upload & Preview
- **Execution Flow:**
  1. Load the application's landing page.
  2. Verify the Hero section, main headers, and FAQ sections are visibly rendered.
  3. Click the primary "Get Started" CTA button in the Hero section.
  4. Verify the viewport smoothly scrolls to the File Upload & Preview section.
  5. Verify the file upload dropzone is prominently visible and focused within the viewport.
- **Mocks Needed:** None (Pure UI/DOM interaction test).

## 5. Verification Method
- **Implementation:** Create a TypeScript file (e.g., `e2e/tier3/pairwise.spec.ts`) implementing these exact 8 test cases.
- **Execution:** Run `npx playwright test e2e/tier3/`
- **Validation:** All 8 tests must pass (exit code 0), and Playwright trace logs should confirm that the specified `page.route` interceptions were successfully hit during execution, proving that the external APIs were properly mocked.
