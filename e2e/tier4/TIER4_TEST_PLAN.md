# Tier 4 Test Plan: Real-World Application Scenarios

This document details the test strategy and case specifications for the 4 Tier 4 end-to-end (E2E) scenarios for the AI Headshot Generator. These tests exercise full application flows across multiple features.

## General Mocking Strategy

Since these are opaque-box tests running via Playwright, external dependencies will be intercepted and mocked at the network layer:

- **Replicate API**: Intercept requests to `/api/generate` (or direct Replicate calls if exposed, though generally handled by backend). Playwright's `page.route()` will fulfill the request with a mock generated image URL after an artificial delay to simulate processing time.
- **Stripe Checkout/Billing**: 
  - For Checkout: Intercept the redirect to Stripe (`page.route('**/*checkout.stripe.com*')`) and simulate an immediate redirect back to the app's `success_url`.
  - For Webhooks: Since tests are UI-driven, we will simulate the backend receiving a webhook by either providing a test-only API endpoint to update user state, or intercepting the initial state fetch to reflect the "paid" status after a simulated checkout.

---

## Scenario 1: Full Free User Flow

**Features Exercised**: 1, 2, 3, 6, 7, 8 (File Upload & Preview, AI Generation & Loading, Freemium Count Tracking, Download & Watermark, Share/Copy Tweet Button, UI Layout)

**Test Case Title**: `should complete a full free user flow from upload to social share`

**User Actions**:
1. Navigate to the landing page (`/`).
2. Verify Hero and FAQ sections are present.
3. Upload a valid image (`.jpg` or `.png`).
4. Wait for the image preview to render.
5. Click "Generate AI Headshot".
6. Observe the loading state.
7. Wait for the mocked generation to complete.
8. Verify the freemium generation count has decreased by 1.
9. Click "Download".
10. Click the "Share to Twitter" or "Copy Link" button.

**Assertions**:
- The Hero text and FAQ elements are visible.
- The image preview is visible after selecting a file.
- The loading spinner or progress bar is displayed during generation.
- The resulting image is displayed with a visible "Watermark" element or visual indicator.
- The remaining generations counter reflects the updated value (`Initial - 1`).
- The download is triggered correctly (Playwright's `page.waitForEvent('download')`).
- The share button triggers a window popup (for Twitter) or copies a link to the clipboard.

---

## Scenario 2: Free to Paid Upgrade Flow

**Features Exercised**: 1, 2, 3, 4, 5, 6, 8 (Upload, Generation, Freemium Tracking, Paywall, Stripe Checkout, Download/Watermark, Layout)

**Test Case Title**: `should upgrade a free user to paid upon hitting the generation limit`

**User Actions**:
1. Navigate to the app.
2. Exhaust the free tier limit by simulating 3 image uploads and generations.
3. Upload a 4th image and click "Generate AI Headshot".
4. Observe the Paywall Modal appearing.
5. Click "Upgrade to Pro" within the modal.
6. Simulate a successful Stripe Checkout redirect.
7. Return to the app.
8. Attempt the 4th generation again.
9. Wait for the completed generation.
10. Download the image.

**Assertions**:
- On the 4th attempt, the Paywall modal becomes visible and the generation does NOT start.
- Clicking upgrade navigates to the (mocked) Stripe checkout.
- Upon returning, the user's UI state updates to "Pro/Paid" and the generation counter is hidden or shows "Unlimited".
- The 4th generation successfully triggers the loading state.
- The resulting downloaded image lacks the watermark element.

---

## Scenario 3: Existing Paid User Flow

**Features Exercised**: 1, 2, 5, 6, 8 (Upload, Generation, Stripe, Download, Layout)

**Test Case Title**: `should allow an existing paid user to generate unwatermarked headshots without limits`

**User Actions**:
1. Initialize the session as an existing "Paid" user (e.g., set localStorage/cookie or mock initial auth/user-fetch endpoint).
2. Navigate to the app.
3. Upload an image.
4. Click "Generate AI Headshot".
5. Wait for the result.
6. Repeat the upload and generate process 5 times (exceeding the standard free limit).
7. Download the final image.

**Assertions**:
- The user is recognized as "Pro" upon initial load.
- No Paywall modal ever appears, even after 5 generations.
- Every generation succeeds.
- Every generated image is displayed and downloaded without a watermark.

---

## Scenario 4: Subscription Cancellation/Renewal

**Features Exercised**: 4, 5, 8 (Paywall, Stripe, Layout)

**Test Case Title**: `should handle subscription cancellation and reflect downgraded access`

**User Actions**:
1. Initialize the session as a "Paid" user.
2. Navigate to the "Billing" or "Account" section of the UI.
3. Click "Manage Subscription" (mock redirecting to Stripe Billing Portal).
4. Simulate returning from the portal with a "Cancelled" status (mock the user data fetch to return `subscription_status: 'cancelled'`).
5. Upload an image and generate it (assuming they have usage limits again or their cycle ended).
6. Click "Generate" multiple times until hitting the free tier limit again.

**Assertions**:
- The UI reflects the transition from "Pro" to "Free" (or "Canceling at end of cycle").
- When treated as a "Free" user again, the application correctly enforces the 3-generation limit.
- The Paywall modal appears when the limit is reached post-cancellation.
