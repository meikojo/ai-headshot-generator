# Handoff Report: Tier 2 Test Planning

## 1. Observation
- The project is an AI Image Studio with 11 distinct features, requiring 55 Tier 2 tests (Boundary & Corner Cases).
- Features to test: Freemium IP & Fingerprinting, 7 Image Tools (Remove Background, Cleanup, Replace Background, Reimagine, Upscale, Uncrop, Text to Image), Usage Gate, Stripe Monetization, and UI Theme.
- Tier 2 testing emphasizes boundary conditions, edge cases, error-prone inputs, missing configs, and maximum limits.
- External API calls (Clipdrop, Stripe) are handled server-side, requiring careful mocking strategies for E2E tests.

## 2. Logic Chain
Based on the `TEST_INFRA.md`, `ORIGINAL_REQUEST.md`, and `SCOPE.md`, I've mapped exactly 5 distinct boundary/corner cases per feature. 

### Feature 1: Freemium IP & Fingerprinting
1. Simulate client with Canvas API disabled/blocked (e.g., override Canvas rendering to return empty/null).
2. Override `X-Forwarded-For` header in Playwright request to simulate comma-separated chained IPs (`client, proxy1`).
3. Fire concurrent API requests via `page.evaluate` using `Promise.all` to test race conditions on usage counting.
4. Pass an exceptionally long User-Agent string to test database column limits.
5. Disable browser cookies and localStorage entirely to ensure tracking strictly relies on IP/Canvas fingerprinting.

### Feature 2: Remove Background Tool
1. Upload an image that is exactly at the maximum allowed byte limit (e.g., 20.00MB).
2. Upload a minimal 1x1 pixel valid image.
3. Upload an invalid file format disguised as an image (e.g., `.txt` file renamed to `.jpg`).
4. Upload an image completely transparent (alpha=0 everywhere).
5. Mock the server response to return a 500 Internal Server Error and verify graceful UI handling without crashing.

### Feature 3: Cleanup Tool
1. Submit an empty mask (no pixels selected).
2. Submit a mask that covers 100% of the image.
3. Upload a mask with dimensions differing from the original image (e.g., 1024x1024 image, 512x512 mask).
4. Perform rapid, repeated UI strokes to create an extremely complex mask path, then submit.
5. Mock a timeout response from the internal API to verify the UI's loading state gracefully times out.

### Feature 4: Replace Background Tool
1. Provide an extremely long text prompt (e.g., 5000 characters).
2. Provide a completely empty text prompt.
3. Provide a prompt consisting entirely of emojis and non-Latin characters (e.g., 🦄, 汉字).
4. Upload an image that is highly asymmetrical (e.g., 100x4000).
5. Mock a Clipdrop 400 Bad Request (e.g., moderation filter) and ensure the UI shows the specific violation.

### Feature 5: Reimagine Tool
1. Click the "Reimagine" button multiple times rapidly to test debounce/loading state handling.
2. Upload an image consisting of a single solid color (e.g., all black).
3. Upload an image with an extreme aspect ratio (1:20).
4. Mock the backend returning an invalid, non-image payload (e.g., HTML error page).
5. Interrupt the network connection (offline mode) mid-upload and verify the error recovery.

### Feature 6: Upscale Tool
1. Upload an image exactly at the maximum allowed input resolution for upscaling.
2. Provide an invalid upscale factor in the request payload by intercepting the request via Playwright.
3. Upload a corrupted image file.
4. Mock the API to return a 429 Too Many Requests and verify retry/error messaging.
5. Process an image with an extremely small resolution (e.g., 2x2).

### Feature 7: Uncrop Tool
1. Provide negative padding values or boundaries.
2. Provide zero padding on all sides.
3. Request an uncrop aspect ratio that is highly irregular (e.g., 100:1).
4. Request uncrop with padding that pushes the resulting image beyond the API's maximum dimensions.
5. Mock an incomplete response where the server truncates the image stream.

### Feature 8: Text to Image Tool
1. Submit an empty prompt.
2. Submit a prompt with the exact maximum allowed character limit.
3. Submit a prompt with malicious payloads (e.g., `<script>alert(1)</script>`) to test XSS in UI rendering.
4. Submit a prompt that triggers the mock API's NSFW/content moderation error.
5. Request image generation with conflicting or extreme dimension parameters.

### Feature 9: Usage Gate & Paywall
1. Attempt to navigate directly to `/tools/remove-background` via URL when the usage limit is reached (bypassing the homepage).
2. Reach the 3-use limit, then manipulate browser localStorage/sessionStorage to try and reset it (should fail securely).
3. Perform the 3rd and 4th request concurrently via `fetch` to test race conditions on the gate limits.
4. Verify the Paywall modal cannot be dismissed by pressing Escape or clicking outside if the limit is strictly reached.
5. Mock a failed database lookup for usage tracking and verify it fails securely.

### Feature 10: Stripe Monetization & Webhook
1. Send a mock webhook payload with an invalid `Stripe-Signature` header and verify a 400 response.
2. Send the exact same valid `checkout.session.completed` webhook payload twice to verify idempotency (no double-crediting).
3. Send a valid webhook payload but with a missing or non-existent `client_reference_id` (user ID).
4. Verify that a `checkout.session.expired` or `payment_intent.payment_failed` webhook does not grant paid access.
5. Send a massively large JSON payload to the webhook endpoint to test size limits and parsing.

### Feature 11: UI Theme & Layout
1. Resize the Playwright viewport to exactly 375x667 (mobile boundary) and check for horizontal scrolling (should be none).
2. Resize viewport to 300x500 (below min supported) and verify content layout bounds.
3. Resize viewport to 4K resolution (3840x2160) and verify the tool layout remains centered and the 40/60 split is maintained.
4. Emulate "prefers-color-scheme: light" in the browser and verify the dark navy theme (#080b14) is strictly enforced.
5. Inject extremely long text into the generated result container (e.g., long error message) to verify word-wrap.

### Mock Configurations

**Clipdrop API Mocking:**
Since Clipdrop is called server-side, Playwright tests should use `page.route('/api/tools/*')` to intercept the Next.js internal API routes directly.
- **Success mock:** Return a `200 OK` with a static binary blob representing a dummy image.
- **Error mock:** Return `400`, `429`, or `500` HTTP status codes with JSON error payloads matching the backend's expected error format.

**Stripe API Mocking:**
- **Webhook Events:** Use Playwright's `request.post('/api/webhook')` to manually send mock Stripe JSON payloads (`checkout.session.completed`, etc.). Either generate a valid Stripe-Signature manually, or use a test-environment flag in the backend to bypass signature validation.
- **Checkout Flow:** Use `page.route('/api/create-checkout-session')` to intercept checkout creation. Return a mock URL that instantly triggers the webhook and redirects the user back to the success page.

## 3. Caveats
- Since the actual implementation of the backend is black-boxed, the test design assumes standard Next.js API routes (`/api/tools/[tool]`). If the architecture differs, the routing interceptors for the Clipdrop mock will need adjustment.
- For webhook mocking, bypassing the Stripe signature verification might require backend code changes (e.g., an `if (process.env.NODE_ENV === 'test')` branch).

## 4. Conclusion
We have identified 55 boundary and corner case tests covering all 11 features, meeting the Tier 2 criteria. The mock strategies rely strictly on Playwright's network interception (`page.route`) and direct API requests, ensuring no dependencies on real API tokens or billing.

## 5. Verification Method
- Review the list to confirm exactly 5 tests per feature (11 * 5 = 55 tests).
- All identified tests focus on boundary limits (max file sizes, 1x1 pixels), corner cases (empty masks, irregular aspect ratios), or error handling (500/400 codes, invalid webhook signatures).
