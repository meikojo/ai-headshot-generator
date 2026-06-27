# Handoff Report: Tier 4 Test Plan

## 1. Observation
- `TEST_INFRA.md` requires exactly 4 "Tier 4" Real-World Application Scenarios to be tested.
- `SCOPE.md` specifies these tests should be opaque-box, requirement-driven, using Playwright, and relying on `page.route()` for mocking Replicate and Stripe APIs.
- The tests are to reside in `d:/ai-headshot-generator/e2e/tier4/`.
- No application code exists yet; tests must be defined purely on required behavior.

## 2. Logic Chain
1. **Scenario 1: Full Free User Flow** must exercise features 1, 2, 3, 6, 7, 8. The logical sequence is visiting the site, observing the layout, generating an image within free limits, verifying the watermark, downloading, and sharing.
2. **Scenario 2: Free to Paid Upgrade Flow** must exercise features 1, 2, 3, 4, 5, 6, 8. The sequence starts with exhausting the free limit, triggering the paywall, mocking a Stripe checkout and webhook success, and verifying subsequent generations lack watermarks.
3. **Scenario 3: Existing Paid User Flow** must exercise features 1, 2, 5, 6, 8. This tests the steady state of a premium user. We must mock the initial subscription state, perform a generation, and assert the absence of a paywall and watermarks.
4. **Scenario 4: Subscription Cancellation/Renewal** must exercise features 4, 5, 8. This focuses on subscription management, navigating to a mock Stripe customer portal, triggering a cancellation webhook, and verifying the app downgrades the user.
5. **Mocking Strategy**: Since external APIs cannot be hit, `page.route()` will intercept outbound requests to Replicate (for AI generation) and Stripe (for checkout/portal sessions). Webhooks will be simulated using Playwright's `request.post()` to the app's webhook endpoint.

## 3. Caveats
- Without a defined authentication mechanism, identifying users (especially "Existing Paid") assumes a cookie or local storage token that the test can inject, or a simple identifier input on the frontend.
- Element selectors are conceptual (e.g., `getByRole('button', { name: /upload/i })`); they will need to be strictly matched when the app is built.

## 4. Conclusion
Below is the detailed test plan designed for `d:/ai-headshot-generator/e2e/tier4/`.

### Test Case 1: Full Free User Flow
- **Title**: `should complete full free user flow with watermarked generation and social sharing`
- **User Actions**: 
  1. Navigate to `/`.
  2. Verify Hero section and FAQ are visible.
  3. Upload an image file via the file input.
  4. Click "Generate Headshot".
  5. Wait for generation to complete.
  6. Click "Download".
  7. Click "Share to Twitter".
- **Assertions**:
  - Hero and FAQ elements exist.
  - Freemium generation counter updates (e.g., "1/3 free uses remaining").
  - Generated image is visible and contains a watermark element or source query param.
  - Download event is triggered successfully.
  - Clipboard contains the expected promotional tweet text.
- **External API Mocks**:
  - **Replicate**: `page.route('**/api/generate', ...)` (or outbound Replicate API if hit directly from browser, though typically proxied) mocked to return a dummy watermarked image URL after a 1-second delay.

### Test Case 2: Free to Paid Upgrade Flow
- **Title**: `should trigger paywall after free limit and upgrade to premium via Stripe`
- **User Actions**:
  1. Exhaust free limit by performing N uploads/generations.
  2. Attempt one more upload/generation.
  3. Assert Paywall Modal appears.
  4. Click "Upgrade Now" in the modal.
  5. (Simulate Stripe Checkout) Intercept the redirect and simulate a successful payment.
  6. (Simulate Webhook) Trigger the Stripe webhook endpoint to mark the user as paid.
  7. Return to app and generate a new headshot.
- **Assertions**:
  - Paywall modal is visible when limits are hit.
  - Clicking upgrade requests a Stripe Checkout Session.
  - After payment simulation, the UI reflects "Premium" status.
  - The next generated image does NOT contain a watermark.
- **External API Mocks**:
  - **Stripe Checkout**: `page.route('**/api/checkout', ...)` mocked to return a mock `checkout_url`.
  - **Stripe Webhook**: Playwright's `request.post('/api/webhooks/stripe')` payload with `checkout.session.completed`.
  - **Replicate**: Mocked to return a premium, non-watermarked image.

### Test Case 3: Existing Paid User Flow
- **Title**: `should recognize existing premium user and allow unwatermarked generations without paywall`
- **User Actions**:
  1. Set premium user state (e.g., inject session cookie or local storage).
  2. Navigate to `/`.
  3. Upload an image and click "Generate".
  4. Download the image.
- **Assertions**:
  - Freemium counter is NOT displayed; premium badge is visible.
  - Paywall is never triggered.
  - Generated image does not have a watermark.
- **External API Mocks**:
  - **Stripe/Auth**: Intercept session validation `page.route('**/api/auth/session', ...)` to return an active subscription payload.
  - **Replicate**: Mocked to return a premium image.

### Test Case 4: Subscription Cancellation/Renewal
- **Title**: `should allow premium user to cancel subscription and revert to free tier`
- **User Actions**:
  1. Start as a premium user.
  2. Navigate to "Manage Subscription" or billing settings.
  3. Click "Cancel Subscription".
  4. (Simulate Stripe Portal) Intercept redirect to Stripe Billing Portal.
  5. (Simulate Webhook) Send `customer.subscription.deleted` to the webhook endpoint.
  6. Refresh or navigate back to the main app.
  7. Attempt to generate an image beyond the free limit.
- **Assertions**:
  - Billing section is accessible.
  - UI updates to show subscription is canceled.
  - Paywall modal reappears when attempting to exceed free limits post-cancellation.
- **External API Mocks**:
  - **Stripe Portal**: `page.route('**/api/billing-portal', ...)` mocked to return a dummy portal URL.
  - **Stripe Webhook**: Playwright `request.post()` simulates the cancellation event.

## 5. Verification Method
1. Review this test plan against `TEST_INFRA.md` to ensure all 4 required real-world scenarios and their associated feature IDs are accurately mapped.
2. Verify that Playwright route mocking (`page.route`) and webhook simulation via `request.post` align with the `SCOPE.md` interface contracts for opaque-box testing without real external API dependencies.

(Note: Tests are not yet runnable as the application logic and UI are not implemented. This plan dictates the strict behavioral requirements for when they are built.)
