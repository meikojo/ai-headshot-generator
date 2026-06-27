# Handoff Report: Tier 1 Test Case Design

## 1. Observation
I reviewed `d:/ai-headshot-generator/TEST_INFRA.md` which defines 11 core features based on the application requirements in `d:/ai-headshot-generator/ORIGINAL_REQUEST.md`. The testing strategy mandates ≥5 test cases per feature for Tier 1 (happy path, basic functionality) using Playwright. 

## 2. Logic Chain
Based on the defined feature inventory, I have designed 5 concrete Playwright test cases for each of the 11 features, totaling 55 test cases. The test cases focus on the happy path, core user flows, and expected system behavior without delving into negative edge cases (which belong to higher tiers).

### Feature 1: Freemium IP & Fingerprinting
1. **TC-F1-01**: Verify a new visitor is assigned a persistent fingerprint stored in browser storage and tracked in Supabase.
2. **TC-F1-02**: Verify `/api/check-limit` returns exactly 3 remaining uses for a new, unused fingerprint.
3. **TC-F1-03**: Verify successful execution of any image tool deducts exactly 1 from the remaining usage count.
4. **TC-F1-04**: Verify the fingerprint remains stable and usage count persists across page reloads and browser restarts.
5. **TC-F1-05**: Verify opening the site in a fresh Incognito window generates a new fingerprint with a full 3-use quota.

### Feature 2: Remove Background Tool
1. **TC-F2-01**: Verify user can navigate to `/tools/remove-background` and upload an image via the 40% upload zone.
2. **TC-F2-02**: Verify clicking "Generate" displays a loading indicator while the server-side API processes the request.
3. **TC-F2-03**: Verify the processed image with transparent background is displayed in the 60% result zone upon success.
4. **TC-F2-04**: Verify clicking the "Download" button saves the resulting image to the user's local machine.
5. **TC-F2-05**: Verify the server-side route `/api/increment-usage` is called successfully after a valid generation.

### Feature 3: Cleanup Tool
1. **TC-F3-01**: Verify user can upload an image to `/tools/cleanup` and interact with the canvas to draw a mask over unwanted objects.
2. **TC-F3-02**: Verify clicking "Generate" submits both the image and mask to the server-side API.
3. **TC-F3-03**: Verify the processed image with the masked object removed is displayed in the result zone.
4. **TC-F3-04**: Verify the processed image can be downloaded locally.
5. **TC-F3-05**: Verify the tool prevents submission if an image is uploaded but no mask is drawn.

### Feature 4: Replace Background Tool
1. **TC-F4-01**: Verify user can upload an image and type a background description prompt in `/tools/replace-background`.
2. **TC-F4-02**: Verify the "Generate" button is disabled until both an image and a text prompt are provided.
3. **TC-F4-03**: Verify clicking "Generate" shows a loading state and submits the request to the server.
4. **TC-F4-04**: Verify the processed image with the newly generated background is displayed in the result zone.
5. **TC-F4-05**: Verify the resulting image can be downloaded locally.

### Feature 5: Reimagine Tool
1. **TC-F5-01**: Verify user can upload a valid image to `/tools/reimagine`.
2. **TC-F5-02**: Verify clicking "Generate" shows a loading state while processing the image.
3. **TC-F5-03**: Verify a visually similar but structurally reimagined image is displayed in the result zone.
4. **TC-F5-04**: Verify the resulting reimagined image can be downloaded locally.
5. **TC-F5-05**: Verify the user can clear the current result and upload a new image to generate another variation.

### Feature 6: Upscale Tool
1. **TC-F6-01**: Verify user can upload a low-resolution image to `/tools/upscale`.
2. **TC-F6-02**: Verify the UI provides options to select the target upscale multiplier (e.g., 2x).
3. **TC-F6-03**: Verify clicking "Generate" submits the image and multiplier to the server API.
4. **TC-F6-04**: Verify the upscaled, higher-resolution image is displayed in the result zone.
5. **TC-F6-05**: Verify the upscaled image can be downloaded locally.

### Feature 7: Uncrop Tool
1. **TC-F7-01**: Verify user can upload an image to `/tools/uncrop` and select a target aspect ratio (e.g., Landscape, Portrait).
2. **TC-F7-02**: Verify the UI allows panning or positioning the original image within the target crop bounds.
3. **TC-F7-03**: Verify clicking "Generate" submits the image and bounds parameters to the server API.
4. **TC-F7-04**: Verify the expanded/uncropped image is displayed in the result zone.
5. **TC-F7-05**: Verify the uncropped image can be downloaded locally.

### Feature 8: Text to Image Tool
1. **TC-F8-01**: Verify user can enter a descriptive text prompt into `/tools/text-to-image` without uploading an image.
2. **TC-F8-02**: Verify the "Generate" button is disabled when the text prompt is empty.
3. **TC-F8-03**: Verify clicking "Generate" displays a loading state and calls the server API.
4. **TC-F8-04**: Verify the AI-generated image matching the prompt is displayed in the result zone.
5. **TC-F8-05**: Verify the generated image can be downloaded locally.

### Feature 9: Usage Gate & Paywall
1. **TC-F9-01**: Verify the shared `<UsageGate>` component correctly displays the current remaining usage badge (e.g., "3/3 Free Uses").
2. **TC-F9-02**: Verify the usage badge decrements dynamically immediately after a successful tool generation.
3. **TC-F9-03**: Verify the paywall modal automatically appears when a user attempts to generate a 4th image.
4. **TC-F9-04**: Verify the paywall modal clearly displays the "Pay-Per-Use ($3)" and "Unlimited ($12/mo)" tier options.
5. **TC-F9-05**: Verify a server-side 403 Forbidden error is returned if a client attempts to bypass the UI gate with 0 uses left.

### Feature 10: Stripe Monetization & Webhook
1. **TC-F10-01**: Verify clicking a payment tier on the paywall successfully redirects the user to the Stripe Checkout session.
2. **TC-F10-02**: Verify the Stripe Checkout session is created with the user's fingerprint attached as metadata.
3. **TC-F10-03**: Verify simulating a successful Stripe payment (`checkout.session.completed`) updates `is_paid=true` in Supabase via webhook.
4. **TC-F10-04**: Verify a paid user (`is_paid=true`) no longer sees the usage badge or encounters the paywall.
5. **TC-F10-05**: Verify a paid user can successfully generate a 4th image (and beyond) without being blocked by the server-side gate.

### Feature 11: UI Theme & Layout
1. **TC-F11-01**: Verify the homepage renders a dark navy theme background (#080b14) globally.
2. **TC-F11-02**: Verify the homepage displays a responsive 2x4 grid containing navigation cards for all 7 tools.
3. **TC-F11-03**: Verify primary buttons and active UI elements use the electric blue (#4f8ef7) or purple (#a855f7) accent colors.
4. **TC-F11-04**: Verify tool pages maintain a consistent desktop layout with the upload zone occupying 40% width and the result zone 60%.
5. **TC-F11-05**: Verify tool pages respond to mobile viewport widths (e.g., 375px) by stacking the upload and result zones vertically.

## 3. Caveats
- These tests are strictly designed conceptually at a high level. No implementation or mock server setups (like mocking the Clipdrop API or Stripe Webhooks) are defined here.
- The tests focus entirely on Tier 1 (Happy Path and basic functionality), omitting negative cases or complex edge cases (Tier 2-4).

## 4. Conclusion
A total of 55 Playwright Tier 1 test cases have been fully designed, covering the 11 features required by the project specifications in `ORIGINAL_REQUEST.md` and `TEST_INFRA.md`.

## 5. Verification Method
- Ensure there are exactly 5 distinct test cases for each of the 11 feature categories.
- During implementation, use Playwright to code these 55 tests and run `npx playwright test e2e/tier1` to verify successful execution and coverage.
