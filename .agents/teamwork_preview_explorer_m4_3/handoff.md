# Observation
- Target test directory: `d:/ai-headshot-generator/e2e/tier3/` (per `TEST_INFRA.md`).
- Objective: Design exactly 8 Tier 3 Playwright test cases that cover pairwise combinations of major features as per the E2E methodology.
- Major Features:
  1. File Upload & Preview
  2. AI Generation & Loading
  3. Freemium Count Tracking
  4. Paywall Modal & UI
  5. Stripe Checkout & Webhook
  6. Download & Watermark
  7. Share/Copy Tweet Button
  8. UI Layout (Hero, FAQ)
- Requirements: Select 8 meaningful pairs, define test name, state features combined, provide step-by-step opaque-box execution flow, and define external dependencies to mock via `page.route()`.

# Logic Chain
To ensure maximum interaction coverage without redundancy, I selected the following 8 pairs based on realistic user journeys (from first upload to subscription and sharing):

**Test 1: `Upload_Freemium_Gate.spec.ts`**
- **Features**: File Upload & Preview (1) + Freemium Count Tracking (3)
- **Flow**:
  1. Load the application.
  2. Simulate a user state with 0 freemium credits.
  3. User attempts to upload an image via the Hero upload area.
  4. Verify the upload or preview is rejected.
  5. Verify the UI displays a "credits exhausted" or similar warning.
- **Mocks**: 
  - `page.route` for the user/credits initialization API to return `{ credits: 0 }`.

**Test 2: `Generation_Watermark_Free.spec.ts`**
- **Features**: AI Generation & Loading (2) + Download & Watermark (6)
- **Flow**:
  1. Load application as a free user.
  2. Upload an image and click "Generate".
  3. Wait for the loading state/indicator to complete.
  4. Click "Download" on the generated result.
  5. Verify the downloaded image filename, DOM attributes, or visual UI indicates a watermark is present.
- **Mocks**: 
  - `page.route` for the AI generation endpoint to return a mock generated URL after a simulated delay.

**Test 3: `Stripe_Download_NoWatermark.spec.ts`**
- **Features**: Stripe Checkout & Webhook (5) + Download & Watermark (6)
- **Flow**:
  1. Load application as a paid/premium user.
  2. Upload an image and generate.
  3. Click "Download" on the generated result.
  4. Verify the downloaded image lacks any watermark indications.
- **Mocks**: 
  - `page.route` for user/credits endpoint to return `{ premium: true }` (mocking a successful Stripe webhook state).
  - `page.route` for the AI generation endpoint to return an unwatermarked mock URL.

**Test 4: `Freemium_Paywall_Trigger.spec.ts`**
- **Features**: Freemium Count Tracking (3) + Paywall Modal & UI (4)
- **Flow**:
  1. Load application with exactly 1 freemium credit.
  2. Upload and generate an image.
  3. Verify generation succeeds and credit count decreases to 0.
  4. Attempt to upload/generate a second time.
  5. Verify the Paywall Modal automatically appears to block the action.
- **Mocks**: 
  - `page.route` for the credits endpoint to initially return 1, then update to 0.
  - `page.route` for the AI generation endpoint.

**Test 5: `Paywall_Stripe_Checkout.spec.ts`**
- **Features**: Paywall Modal & UI (4) + Stripe Checkout & Webhook (5)
- **Flow**:
  1. Trigger the Paywall Modal (e.g., clicking an "Upgrade" button).
  2. Click the subscription plan button inside the modal.
  3. Verify the application initiates a checkout session.
  4. Verify the page navigates to a Stripe Checkout URL.
- **Mocks**: 
  - `page.route` for the create-checkout-session API to return a fake Stripe URL (`https://checkout.stripe.com/fake-session`).

**Test 6: `Generation_Share_Tweet.spec.ts`**
- **Features**: AI Generation & Loading (2) + Share/Copy Tweet Button (7)
- **Flow**:
  1. Upload an image and start generation.
  2. Wait for the loading indicator to disappear.
  3. Verify the generated image appears alongside a "Share" or "Tweet" button.
  4. Click the button and verify it generates the correct social sharing link (e.g., `twitter.com/intent/tweet?url=...`).
- **Mocks**: 
  - `page.route` for the AI generation endpoint to return a specific mock image URL for sharing.

**Test 7: `Upload_Hero_Layout.spec.ts`**
- **Features**: File Upload & Preview (1) + UI Layout (Hero, FAQ) (8)
- **Flow**:
  1. Load application.
  2. Note the initial position and visibility of the FAQ section below the Hero.
  3. Upload an image to trigger the preview mode.
  4. Verify the Hero section updates to display the preview without causing the FAQ section to overlap or disappear.
- **Mocks**: None needed.

**Test 8: `Paywall_Layout_Overlay.spec.ts`**
- **Features**: Paywall Modal & UI (4) + UI Layout (Hero, FAQ) (8)
- **Flow**:
  1. Open the Paywall Modal.
  2. Verify the modal is visible and centered on the screen.
  3. Attempt to interact with background layout elements (e.g., Hero upload button, FAQ expanders).
  4. Verify background elements are non-interactive due to the modal overlay/backdrop (e.g., checking pointer-events or aria-hidden).
- **Mocks**: None needed.

# Caveats
- No code was implemented, strictly design as requested.
- State mutation (like freemium credits updating) is assumed to be mockable via intercepted API endpoints. If the app uses LocalStorage entirely for free credits, `page.evaluate` will replace `page.route` for those specific mock steps.

# Conclusion
The proposed design provides exactly 8 pairwise test cases fulfilling the Tier 3 testing criteria outlined in `SCOPE.md` and `TEST_INFRA.md`.

# Verification Method
Review the proposed test cases in this report against the `SCOPE.md` Tier 3 requirements. Verify that all 8 features are utilized at least once across the combinations.
