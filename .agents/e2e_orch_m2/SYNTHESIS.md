# Tier 1 Test Implementation Plan

## Consensus Findings
All 3 Explorers agreed on the opaque-box approach utilizing web semantics and `page.route` to avoid hitting actual backend implementation or external APIs.
1. **Mocking Replicate**: Intercept `**/api/generate**`. Return a mock payload with `status: "succeeded"` and a mock image URL or base64 data. Introduce an artificial delay if needed to test loading states.
2. **Mocking Stripe**: Intercept checkout endpoints (`**/api/checkout**` or external Stripe URLs). Mock the flow to immediately redirect to a `/success` route or return a payload that sets the user state to premium.
3. **Clipboard Permissions**: For Feature 7 (Share Button), ensure browser context permissions `['clipboard-read', 'clipboard-write']` are configured in the tests.

## 40 Test Cases (to be implemented in `d:/ai-headshot-generator/e2e/tier1/*.spec.ts`)
Distribute tests into 8 files, 5 tests per file.

**01-upload.spec.ts** (File Upload & Preview)
1. User can successfully upload a valid image file.
2. Uploading displays a visual preview.
3. Valid upload enables the "Generate" button.
4. User can replace an uploaded image.
5. Upload control uses correct semantic labels (accessible).

**02-generation.spec.ts** (AI Generation & Loading)
1. "Generate" click triggers loading state (spinner/aria-busy).
2. Loading state persists during mock API delay.
3. Mock API success removes loading state.
4. Mock API success displays the AI generated image.
5. Generated image contains appropriate alt text.

**03-freemium.spec.ts** (Freemium Count Tracking)
1. New user sees initial freemium count (e.g. 3 remaining).
2. Successful generation decrements count by exactly 1.
3. Count persists after page reload (e.g., using localStorage or cookies, verifiable via UI).
4. Reaching 0 credits updates UI to indicate limit reached.
5. Freemium counter value is accessible to screen readers.

**04-paywall.spec.ts** (Paywall Modal & UI)
1. Generating with 0 credits triggers paywall modal.
2. Modal is visible, traps focus (or role="dialog"), displays pricing.
3. Modal has a prominent "Upgrade" or "Subscribe" button.
4. User can close modal using a visual "Close" button.
5. User can close modal using Escape key.

**05-checkout.spec.ts** (Stripe Checkout & Webhook Mock)
1. Clicking "Upgrade" triggers mock checkout (intercepted).
2. Mock success redirect displays payment success message.
3. Mock success updates user to "Premium" status.
4. "Premium" user bypasses paywall on generation.
5. Mock cancel redirect displays payment cancelled message.

**06-download.spec.ts** (Download & Watermark)
1. Free users see a watermark on preview.
2. "Download" button triggers file download (wait for download event).
3. Downloaded filename matches expected format (e.g. `*.png`).
4. Premium users do not see a watermark.
5. Premium users can download without watermark constraints.

**07-share.spec.ts** (Share/Copy Tweet Button)
1. "Share on X" opens correct Twitter intent URL (mock/intercept window open).
2. "Copy Link" copies shareable URL to clipboard.
3. Visual confirmation ("Copied!") appears temporarily.
4. Share/Copy buttons are hidden before generation.
5. Share buttons have accessible labels.

**08-layout.spec.ts** (UI Layout)
1. Hero section is visible with an `h1`.
2. Hero CTA focuses/navigates to file upload.
3. FAQ section is visible with multiple questions.
4. Clicking FAQ item expands to reveal answer.
5. Semantic HTML landmarks (`<header>`, `<main>`, `<footer>`) are present.
