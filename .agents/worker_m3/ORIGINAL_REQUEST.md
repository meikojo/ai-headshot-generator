## 2026-06-26T13:09:37Z
Implement Milestone 3: Server-side Background Removal & Replacement API Routes for the AI Image Studio SaaS.

Working directory: d:/ai-headshot-generator/
Working metadata directory: d:/ai-headshot-generator/.agents/worker_m3

### Task Specifications

1. **Implement `src/app/api/remove-background/route.ts`**:
   - Enforce rate limiting by extracting the client IP and calling `if (!(await checkRateLimit(ip))) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });`
   - Retrieve the image file from the request `formData` (parameter name: `image`). If missing, return a 400 error.
   - Fetch settings from database via `getAppSettings()`.
   - Call the Hugging Face Inference API model `briaai/RMBG-1.4` by passing the image binary buffer as the body. Include authorization headers `Bearer ${settings.huggingface_api_key}`.
   - Return the returned transparent image buffer as a png response with appropriate headers (`Content-Type: image/png`).
   - Include proper try/catch blocks and handle API error responses.

2. **Implement `src/app/api/replace-background/route.ts`**:
   - Enforce rate limiting using `await checkRateLimit(ip)`.
   - Retrieve `image` (File) and `prompt` (string) from request `formData`. If either is missing, return a 400 error.
   - Fetch settings via `getAppSettings()`.
   - Perform background removal on the input image to get the transparent foreground image buffer (you can make an API request to `briaai/RMBG-1.4` just like in the remove-background route).
   - Generate a background image by calling the Hugging Face Inference API with `settings.model_text_to_image` (or fallback). Construct the body with `inputs: prompt` and insert `parameters` containing `num_inference_steps`, `guidance_scale` (CFG), `negative_prompt`, `width`, and `height` from the retrieved database settings.
   - Using the `sharp` library:
     - Load the generated background image buffer.
     - Resize the background image to match the foreground image dimensions or settings dimensions.
     - Composite the transparent foreground image buffer over the background buffer.
     - Convert the composite result to png or jpeg buffer.
   - Return the combined image buffer with headers (`Content-Type: image/png` or `image/jpeg`).

3. **Verify build/compilation**:
   - Run `npm run build` or `npx tsc --noEmit` to verify there are no TypeScript compilation errors.

### Verification Criteria
- Both `/api/remove-background` and `/api/replace-background` endpoints compile and run cleanly.
- Build compiles successfully.

## 2026-06-26T13:30:32Z
Checking on Milestone 3 progress: Hi, I see that you have implemented the endpoints, pages, and test-ids, and were verifying the build. Are you stuck on any compilation or test issues? Please reply with your status or finish writing handoff.md and report.

