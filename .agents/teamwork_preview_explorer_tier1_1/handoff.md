# Handoff Report: Tier 1 Test Case Design

## 1. Observation
- The test infrastructure guidelines in `d:/ai-headshot-generator/TEST_INFRA.md` identify 11 features that require Tier 1 (happy path, basic functionality) test coverage.
- The requirements state that each of the 11 features must have a minimum of 5 test cases designed, for a total of ≥ 55 test cases.
- The original user request (`d:/ai-headshot-generator/ORIGINAL_REQUEST.md`) details the requirements for each feature, including UI layouts, tools (Remove Background, Cleanup, Replace Background, Reimagine, Upscale, Uncrop, Text to Image), freemium limits, and Stripe monetization.
- No implementation is required at this stage; only the design of these tests.

## 2. Logic Chain
- Based on the features outlined in `TEST_INFRA.md`, I formulated 5 distinct happy-path/basic-functionality test cases per feature.
- **Feature 1 (Freemium IP & Fingerprinting):** Focused on initial limits, consistency, limit decrementing, and the strict block after 3 uses.
- **Features 2-8 (Clipdrop Tools):** Focused on page navigation, file upload/prompt input, successful API call, result rendering, and usage decrementing for each specific tool.
- **Feature 9 (Usage Gate & Paywall):** Focused on access allowance when quota > 0, paywall triggering when quota = 0, and correct display of pricing options.
- **Feature 10 (Stripe Monetization & Webhook):** Focused on correct Stripe redirection, webhook payload processing to set `is_paid=true`, and subsequent paywall/badge removal for paid users.
- **Feature 11 (UI Theme & Layout):** Focused on the dark theme colors, the 2x4 tool grid on the homepage, the 40/60 layout on tool pages, and mobile responsiveness.

## 3. Caveats
- These test cases are designed for black-box/opaque-box testing. They assume appropriate test harnesses (e.g., mocking the Stripe webhook or Clipdrop API) will be configured in Playwright during the implementation phase.
- The design focuses strictly on Tier 1 (happy path). Edge cases, pairwise testing, or negative testing (like network failures or invalid file types) are left for Tiers 2-4.

## 4. Conclusion
The following 55 Tier 1 test cases have been designed to cover the basic functionality of the AI Image Studio:

### 1. Freemium IP & Fingerprinting
1. A new user with a fresh IP and fingerprint is granted exactly 3 free uses.
2. A user's fingerprint remains consistent across multiple browser page reloads in the same session.
3. Submitting 1 successful tool usage reduces the remaining quota to 2 via `/api/check-limit`.
4. Submitting 2 successful tool usages reduces the remaining quota to 1 via `/api/check-limit`.
5. Upon the 3rd usage, the quota reaches 0, and a 4th request is strictly blocked server-side.

### 2. Remove Background Tool
1. User can successfully navigate to `/tools/remove-background` and view the upload/result layout.
2. Uploading a valid PNG image successfully triggers the background removal API call.
3. The UI displays a clear loading indicator while waiting for the server-side response.
4. The image with the removed background is rendered in the 60% result zone upon success.
5. Successfully processing an image calls `/api/increment-usage` and updates the remaining uses.

### 3. Cleanup Tool
1. User can navigate to `/tools/cleanup` and view the 40% upload zone / 60% result display layout.
2. Uploading an image and selecting an area to mask starts the cleanup process.
3. The tool gracefully handles the server response and displays the cleaned-up image.
4. The user can download the resulting cleaned image to their local device.
5. A successful cleanup operation reduces the available free usage quota by 1.

### 4. Replace Background Tool
1. User can navigate to `/tools/replace-background` and see the standard tool layout.
2. User can upload a source image and provide a text prompt describing the new background.
3. The submission successfully calls the Replace Background server-side API.
4. The new image with the requested background is displayed in the result area.
5. Successful replacement increments the usage tracking count for the user.

### 5. Reimagine Tool
1. User navigates to `/tools/reimagine` and sees the standard tool layout.
2. Uploading a base image successfully triggers the reimagine process.
3. The server-side API is called without exposing the Clipdrop API key to the client.
4. The reimagined image variant is successfully displayed in the results area.
5. The API request correctly deducts 1 from the user's free usage quota upon success.

### 6. Upscale Tool
1. User accesses `/tools/upscale` and the upload zone is visible and functional.
2. Uploading a low-resolution image initiates the upscale process.
3. The upscaled, high-resolution result is displayed correctly in the results pane.
4. The user is able to trigger a download of the upscaled image.
5. Usage count is correctly decremented after a successful upscale operation.

### 7. Uncrop Tool
1. Navigating to `/tools/uncrop` displays the consistent UI layout.
2. Uploading an image and specifying a target expansion/aspect ratio starts the uncrop process.
3. The expanded/uncropped image is returned and rendered in the result zone.
4. The server-side API endpoint correctly forwards the request to Clipdrop and returns the data.
5. A successful uncrop operation deducts 1 from the user's free usage quota.

### 8. Text to Image Tool
1. The `/tools/text-to-image` page loads with a text input prompt area instead of an image upload area.
2. Submitting a text prompt (e.g., "A futuristic city skyline") initiates image generation.
3. Loading indicators are shown during the generation process.
4. The generated image is displayed in the result area.
5. Free usage limit is properly updated via `/api/increment-usage` after generation.

### 9. Usage Gate & Paywall
1. The `<UsageGate>` component allows free users with >0 remaining uses to freely access and run any tool.
2. A free user with 0 remaining uses is immediately shown the paywall modal when attempting to use a tool.
3. The paywall modal correctly displays the "Pay-Per-Use ($3)" pricing option.
4. The paywall modal correctly displays the "Unlimited ($12/mo)" subscription option.
5. The paywall restricts any further image processing until a payment is made or confirmed.

### 10. Stripe Monetization & Webhook
1. Clicking the "Pay-Per-Use" button redirects the user to a Stripe Checkout session.
2. Clicking the "Unlimited" button redirects the user to a Stripe Subscription session.
3. A successful payment webhook payload to `/api/webhook` updates the Supabase user record to `is_paid=true`.
4. A paid user (with `is_paid=true`) returning to the app no longer sees the free usage badge.
5. A paid user is not shown the paywall and has continuous, uninterrupted access to all tools.

### 11. UI Theme & Layout
1. The homepage displays the dark navy theme (#080b14) background.
2. Electric blue (#4f8ef7) and purple (#a855f7) accents are applied to buttons and active states.
3. The homepage renders a 2x4 grid correctly listing all 7 tools and a placeholder/info tile.
4. All tool pages strictly follow a 40% interaction/upload zone and 60% result display layout on desktop screens.
5. The UI layout correctly responds and stacks vertically on mobile viewports down to 375px width.

## 5. Verification Method
- **Review:** Manually review this handoff report to verify that 11 features are present and each contains exactly 5 test cases.
- **Coverage Check:** Confirm that all test cases describe happy-path scenarios that correspond to the acceptance criteria defined in `ORIGINAL_REQUEST.md`.
- **Implementation Prep:** An implementer can read this list and directly translate each numbered item into a Playwright `test('...', async ({ page }) => { ... })` block.
