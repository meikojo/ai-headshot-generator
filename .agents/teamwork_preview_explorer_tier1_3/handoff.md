# Tier 1 Test Case Design Report

## Observation
- Read `ORIGINAL_REQUEST.md`, which defines the requirements (R1-R4) for an AI Image Studio.
- Read `TEST_INFRA.md`, which maps these requirements into 11 testable features and specifies that Tier 1 tests must include at least 5 "happy path/basic functionality" tests per feature.

## Logic Chain
- To achieve comprehensive Tier 1 coverage, I systematically broke down each of the 11 features into 5 distinct, positive-outcome test scenarios.
- For **Feature 1 (Freemium IP)**, tests verify the generation and persistence of the fingerprint and the core API endpoints.
- For **Features 2-8 (Clipdrop Tools)**, tests follow a standard happy-path flow for each tool: correct layout rendering, successful upload/input, API invocation, result rendering, usage decrement, and download capability.
- For **Feature 9 (Usage Gate)**, tests validate the gate's open state, the visual usage indicator, the strict block at 0 uses, and the paywall rendering with pricing options.
- For **Feature 10 (Stripe Monetization)**, tests cover the successful checkout return, webhook simulation for DB updates, and the unlocked experience for paid users.
- For **Feature 11 (UI Theme)**, tests verify the global styling (dark navy), the homepage 2x4 grid, navigation routing, the 40/60 desktop split, and mobile responsiveness down to 375px.

## Caveats
- Since there is no actual implementation yet, the test descriptions use opaque-box assertions.
- When these tests are eventually implemented in Playwright, the Clipdrop external API calls and Stripe Webhooks will likely need to be mocked or intercepted to maintain test stability and avoid costs.
- The actual element selectors (e.g., `.upload-zone`, `.paywall-modal`) are abstract and will depend on the final DOM structure.

## Conclusion
A total of 55 Tier 1 Playwright test cases have been designed. They cover the baseline functionality for all 11 defined features without detailing negative or edge-case scenarios (which belong to Tier 2). 

## Verification Method
- Review the list below to confirm 11 sections.
- Count the test descriptions in each section to ensure there are exactly 5 per feature.
- Verify that the tests strictly adhere to Tier 1 constraints (happy paths, normal usage).

---

## Designed Test Cases (Tier 1)

### 1. Freemium IP & Fingerprinting
1. **Initial Fingerprint Generation**: Verify that navigating to the site for the first time generates a unique fingerprint stored in the browser (localStorage/cookies).
2. **Check Limit API**: Verify that calling `/api/check-limit` with a fresh IP and fingerprint returns exactly 3 remaining uses.
3. **Increment Usage API**: Verify that calling `/api/increment-usage` successfully reduces the user's remaining uses count by 1 in the backend.
4. **Session Persistence**: Verify that the remaining usage count persists accurately across page reloads using the same browser fingerprint.
5. **Fingerprint Isolation**: Verify that simulating a new fingerprint on the same IP address initializes a fresh quota of 3 uses (validating the fingerprinting aspect).

### 2. Remove Background Tool
1. **Layout Rendering**: Verify the Remove Background tool page loads with the standard 40% upload zone and 60% result display layout on desktop.
2. **Upload State**: Verify that uploading a valid image file successfully triggers a loading/processing visual state.
3. **Result Rendering**: Verify that a mocked successful Clipdrop API response renders the subject image without its background in the 60% result panel.
4. **Usage Decrement**: Verify that successfully completing a background removal correctly decrements the global usage counter by 1.
5. **Download Action**: Verify that a functional download button appears and allows saving the processed image locally.

### 3. Cleanup Tool
1. **Layout Rendering**: Verify the Cleanup tool page loads properly, displaying the standard 40/60 layout.
2. **Interaction & Processing**: Verify that uploading an image and interacting with the UI to define a mask/cleanup area triggers the loading state.
3. **Result Rendering**: Verify that a successful Cleanup API response displays the artifact-free image in the result area.
4. **Usage Decrement**: Verify that the successful cleanup action reduces the available free usage quota by 1.
5. **Download Action**: Verify that the user can successfully download the cleaned-up image.

### 4. Replace Background Tool
1. **Input Interface**: Verify the tool page allows uploading a base image and provides a text input for the new background prompt.
2. **Submission**: Verify that submitting both the image and the prompt triggers the Replace Background API.
3. **Result Rendering**: Verify the API returns an image with the substituted background in the result panel.
4. **Usage Decrement**: Verify that the user's free usage counter updates correctly after a successful background replacement.
5. **Download Action**: Verify the resulting replaced-background image is downloadable via the UI.

### 5. Reimagine Tool
1. **Upload & Interface**: Verify the tool page layout allows the user to easily upload a source image for reimagining.
2. **Submission**: Verify that confirming the upload sends a request to the Reimagine API and shows a loading state.
3. **Result Rendering**: Verify the UI displays the structurally similar but reimagined result in the 60% display area.
4. **Usage Decrement**: Verify the user's remaining usage count is correctly reduced by 1 upon success.
5. **Download Action**: Verify the newly generated reimagined image is available for download.

### 6. Upscale Tool
1. **Upload & Interface**: Verify the tool page accepts a low-resolution image upload within the 40% upload zone.
2. **Submission**: Verify that executing the tool calls the Upscale API successfully.
3. **Result Rendering**: Verify the upscaled, higher-resolution image is rendered in the result panel.
4. **Usage Decrement**: Verify that the upscale action correctly deducts 1 from the free usage limit.
5. **Download Action**: Verify the user can successfully download the enhanced upscaled image.

### 7. Uncrop Tool
1. **Input Interface**: Verify the tool page allows user to upload an image and provides inputs for expanded dimensions or aspect ratio.
2. **Submission**: Verify that submitting the image and parameters correctly invokes the Uncrop API.
3. **Result Rendering**: Verify the result panel correctly displays the expanded/outpainted uncropped image.
4. **Usage Decrement**: Verify the free usage counter is decremented by 1 after a successful uncrop operation.
5. **Download Action**: Verify the uncropped result can be downloaded by the user.

### 8. Text to Image Tool
1. **Input Interface**: Verify the tool page provides a clear text input area for the generation prompt within the 40% zone.
2. **Submission**: Verify that submitting a valid text prompt invokes the Text to Image API.
3. **Result Rendering**: Verify the newly generated image appears in the 60% result display area.
4. **Usage Decrement**: Verify that a successful image generation consumes 1 credit from the free usage allowance.
5. **Download Action**: Verify the generated image can be saved/downloaded.

### 9. Usage Gate & Paywall
1. **Access Allowed**: Verify the `<UsageGate>` component allows full access to tool generation actions when the user's usage count is > 0.
2. **Usage Badge**: Verify the UI clearly displays the remaining usage count badge for users on the free tier.
3. **Paywall Trigger**: Verify that when the usage count is 0, attempting to use a tool triggers a Paywall overlay/modal that blocks the action.
4. **Plan Display**: Verify the Paywall modal accurately displays both the Pay-Per-Use ($3) and Unlimited ($12/mo) options.
5. **Checkout Redirection**: Verify that clicking a purchase option on the paywall successfully redirects the user to the Stripe Checkout URL.

### 10. Stripe Monetization & Webhook
1. **Checkout Success**: Verify that a successful return from Stripe Checkout lands the user on a confirmation/success page.
2. **Webhook DB Update**: Verify that sending a mock successful Stripe `checkout.session.completed` webhook updates the specific user's `is_paid` status to true in Supabase.
3. **Unlimited Access**: Verify that a user flagged as `is_paid=true` can execute a tool action without their usage count decreasing (or being checked).
4. **Badge Removal**: Verify the usage counter badge is completely hidden for users marked as paid.
5. **Paywall Bypass**: Verify that a paid user never encounters the Usage Gate/Paywall, even if they execute more than 3 tool actions.

### 11. UI Theme & Layout
1. **Global Theme**: Verify the homepage and tool pages display the correct dark navy background theme (`#080b14`) on initial load.
2. **Homepage Grid**: Verify the homepage contains a responsive 2x4 grid correctly listing cards for all 7 AI image tools.
3. **Navigation**: Verify that clicking any tool card on the homepage successfully routes the user to the correct `/tools/[tool-name]` page.
4. **Desktop Layout**: Verify that all 7 tool pages adhere strictly to the 40% upload zone / 60% result display split when viewed on a desktop viewport.
5. **Mobile Responsiveness**: Verify that the 40/60 split correctly stacks vertically (e.g., upload above result) when the window width is resized down to 375px.
