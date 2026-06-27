# Handoff Report: Tier 2 Boundary & Corner Case Tests

## 1. Observation
- `TEST_INFRA.md` requires Tier 2 tests to be "Boundary & Corner Cases" covering 11 features with exactly 5 tests per feature (55 tests total).
- `ORIGINAL_REQUEST.md` details the functional requirements, such as exactly 3 free uses, 7 Clipdrop tools, strict dark theme (#080b14), and Stripe integration.
- `SCOPE.md` specifies that boundary conditions include "empty inputs, max-size inputs, zero/negative values, domain-specific extremes, missing configuration gracefully handled." It explicitly states that tests should use mocked network requests for external APIs (Clipdrop, Stripe).
- Test layout must be `.spec.ts` files under `d:/ai-headshot-generator/e2e/tier2/`.

## 2. Logic Chain
To fulfill the Tier 2 requirements, we define 55 specific edge-case and boundary tests.

**Feature 1: Freemium IP & Fingerprinting**
1. **Missing Proxy Headers**: Request without `X-Forwarded-For` gracefully falls back to direct socket IP.
2. **Spoofed IP Headers**: Submit multiple comma-separated IPs in `X-Forwarded-For`; server correctly parses the true client IP.
3. **Disabled Canvas/Missing Fingerprint**: Browser blocks canvas fingerprinting; server uses a fallback or defaults to IP-only tracking without failing.
4. **Race Condition at Limit**: Fire 3 concurrent tool requests with 2 credits remaining; exactly 2 succeed and 1 gets a 429 limit error.
5. **Extreme Header Size**: Send a `User-Agent` string of 10,000 characters; server processes or truncates it without crashing.

**Feature 2: Remove Background Tool**
6. **Boundary File Size**: Upload an image exactly at the maximum size limit (e.g., 20.00 MB).
7. **Zero-Byte File**: Upload an empty file; verify client/server validation blocks it.
8. **Corrupted Image**: Upload a `.txt` file renamed to `.png`; verify graceful failure.
9. **Clipdrop API 500 Error**: Mock API returning 500; verify usage quota is NOT deducted.
10. **API Timeout**: Mock API taking >30s; verify request aborts gracefully without freezing UI or deducting quota.

**Feature 3: Cleanup Tool**
11. **Empty Mask**: Submit with no mask drawn; verify validation blocks it.
12. **100% Full Mask**: Submit with the entire image masked; verify boundary behavior.
13. **Dimension Mismatch**: Intercept and alter request to send a mask of different dimensions than the image.
14. **API 400 Bad Request**: Mock API rejecting mask format; verify quota is preserved.
15. **Transparent Base Image**: Upload a fully transparent PNG; verify handling.

**Feature 4: Replace Background Tool**
16. **Empty Prompt**: Submit with an empty background prompt; verify default behavior.
17. **Extremely Long Prompt**: Submit 5000-character text; verify truncation/validation.
18. **Special Characters/RTL**: Submit emojis and Right-to-Left text; verify correct encoding to API.
19. **Unsupported Format**: Upload `.tiff` or `.webp`; verify immediate UI rejection.
20. **API 429 Rate Limit**: Mock API returning 429; verify user sees retry message and no quota is lost.

**Feature 5: Reimagine Tool**
21. **Minimum Dimensions**: Upload 1x1 pixel image; verify validation error.
22. **Maximum Dimensions**: Upload 10000x10000 pixel image; verify resizing or rejection.
23. **Solid Color Image**: Upload completely solid black image; verify processing succeeds or API error is handled.
24. **API 401 Unauthorized**: Mock API 401; verify user sees generic "Service Unavailable" (hiding key issues).
25. **Network Drop**: Abort browser network connection mid-upload; verify graceful UI recovery.

**Feature 6: Upscale Tool**
26. **Already Max Resolution**: Upload image already at maximum allowed size; verify validation blocks upscale attempt.
27. **Manipulated Scale Factor**: Intercept request to send `-2x` or `10x` scale; verify server validation blocks it.
28. **Tiny Image**: Upscale a 10x10 pixel image; verify normal handling.
29. **Non-Image API Response**: Mock API returning HTML error page; verify parser catches error and doesn't crash.
30. **Rapid Double Click**: Double click upscale button; verify only one request fires and 1 quota is used.

**Feature 7: Uncrop Tool**
31. **Extreme Expansion**: Request 1000% uncrop ratio on one side.
32. **Zero Expansion**: Request uncrop with original dimensions; verify validation block.
33. **Asymmetric Uncrop**: Expand only the top boundary by 1 pixel.
34. **Extreme Aspect Ratio**: Uncrop into a 1:100 aspect ratio.
35. **API Limit Exceeded**: Mock API error when uncrop exceeds max output resolution; verify graceful handling.

**Feature 8: Text to Image Tool**
36. **Empty Prompt Submission**: Verify submit button is disabled or fails instantly.
37. **XSS Payload**: Input `<script>alert(1)</script>`; verify safe rendering.
38. **Maximum Length**: Input 10,000 characters; verify UI enforcement of max length.
39. **Content Policy Violation**: Mock API returning moderation flag; verify policy warning displays.
40. **Consecutive Requests**: Generate an image, then immediately generate another; verify state resets properly.

**Feature 9: Usage Gate & Paywall**
41. **Local Storage Bypass**: Manually set `usage=0` in browser storage; verify server overrides and blocks based on DB.
42. **Exact Limit Boundary**: On exact 3rd use, processing succeeds, then paywall locks UI immediately for any 4th attempt.
43. **Direct URL Bypass**: Navigate directly to `/tools/cleanup` when usage is 3; verify immediate redirect or overlay.
44. **API Check Failure**: Mock `/api/check-limit` returning 500; verify app "fails closed" and restricts access securely.
45. **Stale Session Check**: Simulate 24-hour token expiration; verify session refreshes correctly.

**Feature 10: Stripe Monetization & Webhook**
46. **Duplicate Webhook**: Send same `checkout.session.completed` event twice; verify idempotency (no duplicate quota resets).
47. **Invalid Signature**: Send webhook with fake `Stripe-Signature`; verify 400 Bad Request rejection.
48. **Unknown User Reference**: Send valid webhook with unknown `client_reference_id`; verify graceful logging.
49. **Expired Session**: Send `checkout.session.expired` webhook; verify user remains free.
50. **Immediate Client Unlock**: Mock webhook success; verify client unlocks instantly via polling/websockets without page reload.

**Feature 11: UI Theme & Layout**
51. **Minimum Viewport (320px)**: Verify tool grid collapses to 1 column without horizontal scrolling.
52. **Ultra-Wide Viewport (4K)**: Verify UI centers and enforces `max-width` rather than stretching.
53. **Extremely Long Filename**: Upload a file named with 255 characters; verify text truncation with ellipsis.
54. **Extreme Aspect Ratio Result**: Mock API returning 10:1 wide image; verify it fits in 60% display zone using `object-fit: contain` without overlapping.
55. **OS Light Mode Override**: Force OS to Light Mode; verify app still renders explicit dark theme (#080b14) per R4 constraints.

### Mock Configurations Identified
*   **Clipdrop API Mocks (`page.route('**/clipdrop-api.co/**')`)**:
    *   Success: Return `status: 200` with a 1x1 base64 dummy PNG.
    *   Errors: Return `400` (bad mask), `401` (auth), `429` (rate limit), `500` (server).
    *   Timeouts: Use `route.abort()` or delays to simulate network failure.
*   **Stripe & Webhook Mocks**:
    *   Checkout API: `page.route('**/api.stripe.com/v1/checkout/sessions')` returns a mock checkout URL.
    *   Webhook Triggers: Use Playwright's `request.post()` to hit the local `/api/webhook` with constructed JSON payloads and mocked `Stripe-Signature` headers.

## 3. Caveats
- Precise HTTP status codes for Clipdrop errors are assumed based on standard REST practices; test assertions may need adjustment if Clipdrop uses custom error codes.
- Assumes the server correctly uses a fallback tracking method if canvas fingerprinting is disabled. If strict enforcement is required, tests might expect the request to be rejected.

## 4. Conclusion
55 distinct, high-value boundary and edge-case tests have been planned across the 11 features for Tier 2. The strategy relies heavily on Playwright's network interception (`page.route`) to reliably trigger external API boundary conditions (Clipdrop, Stripe) without incurring costs or hitting real rate limits, ensuring robust error handling and secure quota enforcement.

## 5. Verification Method
1. Verify the exact test count is 55 by reading the proposed list.
2. Ensure each feature from the inventory receives exactly 5 distinct tests.
3. Validate Playwright routing mocks can be successfully implemented by checking Playwright's documentation on `page.route` and `request.post`.
