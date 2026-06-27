# AI Tools Refactoring Analysis

## 1. Observation
I reviewed the 5 API routes located at `d:/ai-headshot-generator/src/app/api/tools/{tool}/route.ts`. All tools currently call Clipdrop via `POST` requests using the `CLIPDROP_API_KEY`.
- **Text-to-Image**: POSTs `application/json` with `{ prompt }` to `https://clipdrop-api.co/text-to-image/v1`.
- **Reimagine**: POSTs `multipart/form-data` with `image_file` to `https://clipdrop-api.co/reimagine/v1`.
- **Cleanup**: POSTs `multipart/form-data` with `image_file` and `mask_file` to `https://clipdrop-api.co/cleanup/v1`.
- **Upscale**: POSTs `multipart/form-data` with `image_file`, `target_width`, and `target_height` to `https://clipdrop-api.co/image-upscaling/v1/upscale`.
- **Uncrop**: POSTs `multipart/form-data` with `image_file`, `extend_left`, `extend_right`, `extend_up`, and `extend_down` to `https://clipdrop-api.co/uncrop/v1`.

## 2. Logic Chain
1. **Model Selection**: To replace Clipdrop with free open-source models via the Hugging Face Free Inference API, we need equivalent models:
   - Text-to-Image -> `stabilityai/stable-diffusion-xl-base-1.0` (Top tier open source text-to-image).
   - Reimagine -> `lambdalabs/sd-image-variations-diffusers` (Provides variations without requiring a prompt).
   - Cleanup -> `runwayml/stable-diffusion-inpainting` (Standard inpainting model).
   - Upscale -> `stabilityai/stable-diffusion-x4-upscaler` (Standard 4x upscaler).
   - Uncrop -> `runwayml/stable-diffusion-inpainting` (Outpainting is just inpainting on an expanded canvas).

2. **Payload Restructuring**: The HF Free Inference API does not natively support the custom `multipart/form-data` fields Clipdrop uses (like `extend_left` or `target_width`).
   - Single-image tasks (Reimagine, Upscale) can take the raw binary image in the POST body.
   - Multi-image tasks (Cleanup, Uncrop) must use a JSON payload containing base64-encoded strings for the image and mask.
   - Text tasks use a simple JSON payload with the `inputs` key.

3. **Bridging the Feature Gap**: Clipdrop performs server-side image manipulation (padding for Uncrop, resizing for Upscale). Hugging Face models do not. Therefore, the Node.js backend must handle image manipulation using a library like `sharp` before/after calling the HF API.

## 3. Caveats
- **HF Free Tier Limitations**: The HF Free Inference API goes to sleep. When waking up a model, it returns a 503 error with `{"error": "Model is loading", "estimated_time": 20}`. The frontend or backend must implement a retry logic or notify the user to wait.
- **Inpainting Constraints**: Support for complex multi-input diffusers pipelines on the free tier can be spotty. An alternative is the `@huggingface/inference` Node SDK, which manages payload serialization automatically, but the base64 JSON approach is detailed below per the requirements.

## 4. Conclusion & Plan
**Recommended Hugging Face Models:**
- **Text-to-Image**: `stabilityai/stable-diffusion-xl-base-1.0`
- **Reimagine**: `lambdalabs/sd-image-variations-diffusers`
- **Cleanup**: `runwayml/stable-diffusion-inpainting`
- **Upscale**: `stabilityai/stable-diffusion-x4-upscaler`
- **Uncrop**: `runwayml/stable-diffusion-inpainting`

**Fetch API Payload Structures:**
All fetch calls use `https://api-inference.huggingface.co/models/<model_id>` and headers:
`{ "Authorization": "Bearer HUGGINGFACE_API_KEY", "Content-Type": "application/json" }` *(use `image/png` for binary bodies)*.

1. **Text-to-Image**:
   - `Content-Type`: `application/json`
   - `Body`: `JSON.stringify({ inputs: "your prompt" })`
2. **Reimagine**:
   - `Content-Type`: `image/png`
   - `Body`: Raw binary buffer (`imageBuffer`)
3. **Cleanup**:
   - `Content-Type`: `application/json`
   - `Body`: `JSON.stringify({ inputs: "background", parameters: { image: "base64_image", mask_image: "base64_mask" } })`
4. **Upscale**:
   - `Content-Type`: `image/png`
   - `Body`: Raw binary buffer (`imageBuffer`)
5. **Uncrop**:
   - Same as Cleanup, but the server must first pad the image.

**Refactoring Plan:**
1. Remove `CLIPDROP_API_KEY` and add `HUGGINGFACE_API_KEY`.
2. Install `sharp` (`npm install sharp`).
3. **Text-to-Image**: Swap URL and use the `{ inputs: prompt }` JSON payload.
4. **Reimagine**: Remove `buildMultipart`, send `imageBuffer` directly to the `lambdalabs` model.
5. **Cleanup**: Convert `image` and `mask` to base64, send JSON to `stable-diffusion-inpainting`.
6. **Upscale**: Send `imageBuffer` to `stable-diffusion-x4-upscaler`. Use `sharp` on the returned buffer to resize it down/up to the specific `target_width` and `target_height`.
7. **Uncrop**: Use `sharp` to pad the input image by `extend_left`, `extend_right`, `extend_up`, `extend_down`. Generate a corresponding mask image with `sharp`. Convert both to base64 and send to `stable-diffusion-inpainting`.

## 5. Verification Method
- Code Review: Ensure all 5 `route.ts` files no longer reference `clipdrop-api.co` and use `api-inference.huggingface.co/models/...`.
- Testing: Execute the UI or send cURL requests to the local Next.js API routes with a valid `HUGGINGFACE_API_KEY` to ensure images are successfully generated, upscaled, or inpainted.
