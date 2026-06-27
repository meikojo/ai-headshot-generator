# Handoff: Tier 2 Tests (Boundary & Corner Cases)

## 1. Observation
- `SCOPE.md` and `TEST_INFRA.md` define the requirement for 55 Playwright tests for Tier 2 (Boundary & Corner Cases).
- There are exactly 11 features to cover, requiring 5 tests each.
- Tests must use mocked network requests for external APIs (Clipdrop, Stripe).
- Focus areas: empty inputs, max-size inputs, zero/negative values, missing configuration, graceful error handling.

## 2. Logic Chain
To fulfill the Tier 2 requirements, tests are designed to explicitly hit the limits, failure states, and unexpected inputs for each of the 11 features. 
- **Clipdrop Mocking Strategy**: Mocks must intercept `https://clipdrop-api.co/*` (or corresponding endpoints). Responses must simulate 400 (Bad Request), 429 (Rate Limit), 500 (Internal Error), 504 (Timeout), and malformed binary responses.
- **Stripe Mocking Strategy**: Mocks must simulate webhook requests to `/api/webhook` with missing/invalid signatures, missing user metadata, and unhandled event types.
- **Supabase/Tracking**: Focus on race conditions, exact boundary limits (e.g., transition from 2 to 3 uses), and malformed headers.

### Feature 1: Freemium IP & Fingerprinting
1. **T2.1.1**: Missing IP header (`x-forwarded-for` empty/missing) -> fallback to default or reject gracefully.
2. **T2.1.2**: Multiple IPs in `x-forwarded-for` (proxy chain "192.168.1.1, 10.0.0.1") -> should parse client IP correctly.
3. **T2.1.3**: Invalid fingerprint string (e.g., >1000 characters, special characters, or empty string).
4. **T2.1.4**: Concurrent requests from same IP/Fingerprint at boundary limit (race condition test).
5. **T2.1.5**: IPv6 address format parsing check.

### Feature 2: Remove Background Tool
1. **T2.2.1**: Image exactly at max file size boundary (e.g., 20MB or defined max).
2. **T2.2.2**: Invalid image format (`.txt` renamed to `.png`) -> mock rejects with 400.
3. **T2.2.3**: Clipdrop API Timeout -> mock delays >30s, returns 504, UI shows user-friendly error.
4. **T2.2.4**: Image with 1x1 pixel dimension.
5. **T2.2.5**: Extremely large resolution image (e.g., 10000x10000) but small file size.

### Feature 3: Cleanup Tool
1. **T2.3.1**: Empty mask or mask covering 0 pixels.
2. **T2.3.2**: Mask completely covering the entire image.
3. **T2.3.3**: Base image and mask have mismatched dimensions -> backend/mock rejects.
4. **T2.3.4**: Clipdrop API Rate Limit -> mock returns 429 Too Many Requests, UI handles gracefully.
5. **T2.3.5**: Missing mask file in request payload.

### Feature 4: Replace Background Tool
1. **T2.4.1**: Extremely long prompt for new background (e.g., 5000+ chars).
2. **T2.4.2**: Prompt containing HTML/script tags (ensure no XSS).
3. **T2.4.3**: Clipdrop API 500 Internal Server Error -> gracefully show "Service Unavailable".
4. **T2.4.4**: Base image is completely transparent.
5. **T2.4.5**: Prompt contains only whitespace or unicode emojis.

### Feature 5: Reimagine Tool
1. **T2.5.1**: Corrupted image file upload (invalid binary data).
2. **T2.5.2**: Clipdrop mock returns a 0-byte blank image response -> UI shows error, does not crash.
3. **T2.5.3**: High latency upload -> user cancels/navigates away mid-upload, verify no state corruption.
4. **T2.5.4**: Uploading non-image MIME type (e.g., `application/pdf`).
5. **T2.5.5**: Clipdrop mock returns 401 Unauthorized (invalid key) -> graceful generic error to user.

### Feature 6: Upscale Tool
1. **T2.6.1**: Image already at max dimensions (e.g., 4096x4096px).
2. **T2.6.2**: Extremely low resolution image input (e.g., 2x2px).
3. **T2.6.3**: Invalid target dimension parameters requested (0x0 or negative).
4. **T2.6.4**: Clipdrop mock returns JSON instead of binary image format -> handled safely.
5. **T2.6.5**: Rapid repeated clicking on "Upscale" -> UI debounces/throttles calls.

### Feature 7: Uncrop Tool
1. **T2.7.1**: Invalid or extreme aspect ratio requested (e.g., 100:1).
2. **T2.7.2**: Out-of-bounds parameters for uncrop offsets.
3. **T2.7.3**: Original image touches boundary limits without room to uncrop.
4. **T2.7.4**: Invalid format requested for uncropped output (e.g. unsupported WebP).
5. **T2.7.5**: Mock network error (e.g., ECONNRESET connection dropped mid-stream).

### Feature 8: Text to Image Tool
1. **T2.8.1**: Empty prompt / only spaces.
2. **T2.8.2**: Maximum length prompt exactly at boundary.
3. **T2.8.3**: Special characters, foreign languages, and RTL text in prompt.
4. **T2.8.4**: Repeated prompt submission in rapid succession.
5. **T2.8.5**: API mock returns an image size different from what was requested.

### Feature 9: Usage Gate & Paywall
1. **T2.9.1**: User exactly at 2 uses, submits -> succeeds, drops to 0 remaining.
2. **T2.9.2**: User exactly at 3 uses, submits -> gate blocks, no API call made.
3. **T2.9.3**: Supabase mock fails to fetch usage -> default safe behavior (fail closed).
4. **T2.9.4**: Tampered client-side storage (user sets usage=0 locally) -> Server rejects via true tracking.
5. **T2.9.5**: 2 concurrent requests sent when user has 1 use left -> exactly one succeeds.

### Feature 10: Stripe Monetization & Webhook
1. **T2.10.1**: Webhook payload with missing signature header (`stripe-signature`) -> rejected 400.
2. **T2.10.2**: Webhook payload with invalid signature -> rejected 401/400.
3. **T2.10.3**: Valid webhook `checkout.session.completed` but missing metadata -> logged error, 200 OK to Stripe.
4. **T2.10.4**: Webhook event type is unhandled (e.g., `invoice.created`) -> returns 200 OK.
5. **T2.10.5**: Webhook payload is empty or malformed JSON -> rejected 400.

### Feature 11: UI Theme & Layout
1. **T2.11.1**: Extremely small viewport width (e.g., 250px) -> UI does not break completely.
2. **T2.11.2**: Ultra-wide viewport (e.g., 4000px) -> verify max-width constraints center content.
3. **T2.11.3**: Extremely long tool names injected into UI -> verify text truncation/wrapping.
4. **T2.11.4**: High browser zoom level (e.g., 200%) -> text remains accessible, no severe overlap.
5. **T2.11.5**: Disabling CSS or JS entirely (where applicable for basic layout rendering).

## 3. Caveats
- Real Clipdrop and Stripe APIs are not used, relying entirely on the fidelity of the mocks described.
- Concurrency testing (e.g. Feature 1 and 9) via Playwright may require `Promise.all` logic and careful setup to prevent flaky test outcomes.
- Browser-specific behavior for UI bounds (Feature 11) is tested assuming a Chromium engine, which might differ slightly on WebKit/Firefox.

## 4. Conclusion
We have identified 55 specific edge-case and boundary tests (5 for each of the 11 features) that satisfy the Tier 2 requirements. Mocking configurations are specified for 4xx/5xx errors, malformed data, and latency simulations for Clipdrop and Stripe.

## 5. Verification Method
- Ensure the 11 features have 5 tests explicitly written in `e2e/tier2/*.spec.ts`.
- Run `npx playwright test e2e/tier2` once implementation begins. All 55 tests should pass.
- Verify `page.route` or similar mocking mechanisms are successfully capturing Clipdrop/Stripe calls.
