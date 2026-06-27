# Observation
- Read `TEST_INFRA.md` which requires 8 Tier 3 tests for pairwise coverage of major feature interactions.
- Read `SCOPE.md` which outlines the Playwright architecture, mocking via `page.route()`, and the scope of Tier 3 tests.
- Identified 8 major features: (1) File Upload & Preview, (2) AI Generation & Loading, (3) Freemium Count Tracking, (4) Paywall Modal & UI, (5) Stripe Checkout & Webhook, (6) Download & Watermark, (7) Share/Copy Tweet Button, (8) UI Layout (Hero, FAQ).

# Logic Chain
- To achieve pairwise coverage of major features as per the E2E methodology, exactly 8 tests must be designed.
- Selected 8 meaningful combinations that cover all features, heavily utilizing the prompt's suggestions (Upload + Freemium gate, Generation + Watermark, Stripe + Download).
- Formulated an opaque-box test flow for each, defining external dependencies to mock with Playwright's `page.route` to keep tests isolated and independent of actual backend implementations.

# Caveats
- No code was implemented, as instructed.
- Exact endpoints (e.g., `/api/generate`, `/api/user`) are assumed based on standard conventions; implementation tests should adapt to the real endpoint paths.

# Conclusion
- Designed 8 Tier 3 Playwright test cases focusing on pairwise feature interactions.

## Test Cases

### 1. `upload_to_generation`
- **Features Combined:** (1) File Upload & Preview + (2) AI Generation & Loading
- **Execution Flow:**
  1. Navigate to the main application page.
  2. Locate the file upload input and submit a valid sample image file.
  3. Assert that the image preview correctly appears on the screen.
  4. Click the "Generate Headshots" button.
  5. Assert that a loading indicator/spinner becomes visible.
  6. Wait for the generation to finish and assert the final AI-generated image is displayed.
- **External Dependencies to Mock:**
  - `page.route('**/api/generate')`: Return a delayed success response with a mock generated image URL to simulate loading and success states.

### 2. `upload_freemium_gate`
- **Features Combined:** (1) File Upload & Preview + (3) Freemium Count Tracking
- **Execution Flow:**
  1. Navigate to the main page as a free user with 0 remaining credits.
  2. Locate the file upload input and select an image file.
  3. Observe that the upload process is intercepted, or an error message ("0 credits remaining") is displayed.
  4. Assert that the "Generate" button remains disabled or blocked, preventing generation.
- **External Dependencies to Mock:**
  - `page.route('**/api/user/session')`: Return a mock user profile with `credits: 0` and `plan: 'free'`.

### 3. `freemium_triggers_paywall`
- **Features Combined:** (3) Freemium Count Tracking + (4) Paywall Modal & UI
- **Execution Flow:**
  1. Navigate to the main page as a free user with exactly 1 credit.
  2. Upload an image and click "Generate".
  3. Verify the generation succeeds.
  4. Attempt to upload and generate a second time.
  5. Assert that the Paywall Modal automatically opens, displaying the upgrade options.
- **External Dependencies to Mock:**
  - `page.route('**/api/user/session')`: Return 1 credit initially, and 0 credits on subsequent fetch.
  - `page.route('**/api/generate')`: Return success for the first request, and a 402 Payment Required (or similar) for the second request.

### 4. `paywall_stripe_checkout`
- **Features Combined:** (4) Paywall Modal & UI + (5) Stripe Checkout & Webhook
- **Execution Flow:**
  1. Navigate to the main page and trigger the Paywall Modal (e.g., via an "Upgrade" button).
  2. Inside the Paywall Modal, click the "Subscribe" or "Upgrade Now" button.
  3. Intercept the page navigation to the Stripe Checkout domain and assert the checkout URL is correct.
  4. Simulate returning from Stripe by navigating back to the success URL.
  5. Assert the Paywall Modal closes and the UI updates to reflect a paid plan.
- **External Dependencies to Mock:**
  - `page.route('**/api/checkout')`: Return a mock Stripe Checkout URL (e.g., `https://mock-stripe.com/checkout`).
  - `page.route('**/api/user/session')`: Return `plan: 'paid'` after the simulated success redirect to mimic a processed webhook.

### 5. `paid_download_no_watermark`
- **Features Combined:** (5) Stripe Checkout & Webhook + (6) Download & Watermark
- **Execution Flow:**
  1. Navigate to the app as a Paid user (simulating post-checkout).
  2. Generate a new headshot or view an existing one.
  3. Click the "Download" button for the generated image.
  4. Intercept the download request and verify that the watermark parameter is absent or `watermark=false`.
  5. Assert the downloaded file is successfully saved.
- **External Dependencies to Mock:**
  - `page.route('**/api/user/session')`: Return a user object with `plan: 'paid'`.
  - `page.route('**/api/generate')`: Return a mock generated image.
  - `page.route('**/api/download*')`: Intercept the download network call to verify parameters and return a clean image blob.

### 6. `generation_watermarked_download`
- **Features Combined:** (2) AI Generation & Loading + (6) Download & Watermark
- **Execution Flow:**
  1. Navigate to the app as a Free user with sufficient credits.
  2. Upload an image and click "Generate".
  3. Wait for the generation loading state to complete and the image to appear.
  4. Click the "Download" button.
  5. Intercept the download request and verify that a watermark is applied (e.g., `watermark=true`).
  6. Assert the downloaded file is successfully saved.
- **External Dependencies to Mock:**
  - `page.route('**/api/user/session')`: Return a user object with `plan: 'free'` and `credits: 1+`.
  - `page.route('**/api/generate')`: Return a mock generated image.
  - `page.route('**/api/download*')`: Intercept the download network call to verify watermark request parameters and return a watermarked image blob.

### 7. `generation_share_tweet`
- **Features Combined:** (2) AI Generation & Loading + (7) Share/Copy Tweet Button
- **Execution Flow:**
  1. Navigate to the app, upload an image, and generate a headshot.
  2. Once the generated image is fully loaded, click the "Share to Twitter" (or "Tweet") button.
  3. Capture the new browser tab/popup context that opens.
  4. Assert that the popup URL is a valid Twitter intent URL (e.g., `https://twitter.com/intent/tweet`) and contains the specific link to the generated AI headshot.
- **External Dependencies to Mock:**
  - `page.route('**/api/generate')`: Return a mock generated image with a known shareable ID/URL.
  - Intercept window popups using Playwright's `page.waitForEvent('popup')`.

### 8. `ui_layout_freemium_sync`
- **Features Combined:** (8) UI Layout (Hero, FAQ) + (3) Freemium Count Tracking
- **Execution Flow:**
  1. Navigate to the app as a free user with 3 credits.
  2. Observe the main UI Layout (e.g., Header/Navbar) displays a "3 credits remaining" badge.
  3. Upload an image and generate a headshot.
  4. Wait for the generation to complete.
  5. Assert that the UI Layout (Header/Navbar) automatically updates to display "2 credits remaining" dynamically, without requiring a page reload.
- **External Dependencies to Mock:**
  - `page.route('**/api/user/session')`: Return 3 credits initially, and 2 credits after the generation API is called.
  - `page.route('**/api/generate')`: Return a successful mock generation.

# Verification Method
- **Method**: The design can be reviewed against the `TEST_INFRA.md` Tier 3 requirements. The implementation can be verified by creating these `.spec.ts` files in the `e2e/tier3/` directory and running `npx playwright test e2e/tier3/`. The tests will pass only if the UI and mocks behave correctly.
