# Analysis of AI Tools: Clipdrop to Hugging Face Migration

## Observation
I investigated the 5 AI tools by inspecting their API routes in `d:/ai-headshot-generator/src/app/api/tools/` and their frontend implementations in `d:/ai-headshot-generator/src/app/tools/`. 
- **text-to-image**: Calls `https://clipdrop-api.co/text-to-image/v1` via POST with `application/json` containing `{ prompt }`.
- **reimagine**: Calls `https://clipdrop-api.co/reimagine/v1` via POST with `multipart/form-data` containing `image_file`.
- **cleanup**: Calls `https://clipdrop-api.co/cleanup/v1` via POST with `multipart/form-data` containing `image_file` and `mask_file`.
- **upscale**: Calls `https://clipdrop-api.co/image-upscaling/v1/upscale` via POST with `multipart/form-data` containing `image_file`, `target_width`, `target_height`.
- **uncrop**: Calls `https://clipdrop-api.co/uncrop/v1` via POST with `multipart/form-data` containing `image_file` and extension dimensions (`extend_left`, etc.).

All routes currently authenticate using the `x-api-key: process.env.CLIPDROP_API_KEY!` header.

## Logic Chain
1. **Model Selection**: To migrate to the Hugging Face Free Inference API, we need models that perform equivalent tasks and are actively hosted on the free tier.
   - *Text-to-Image*: `stabilityai/stable-diffusion-xl-base-1.0` is the state-of-the-art open-source text-to-image model.
   - *Reimagine (Image-to-Image/Variation)*: `lambdalabs/sd-image-variations-diffusers` generates variations of an input image without requiring a text prompt.
   - *Cleanup (Inpainting)*: `runwayml/stable-diffusion-inpainting` is the standard for image inpainting with a mask.
   - *Upscale*: `stabilityai/stable-diffusion-x4-upscaler` performs high-quality 4x upscaling.
   - *Uncrop (Outpainting)*: Outpainting is functionally equivalent to inpainting where the missing borders are masked. Thus, `runwayml/stable-diffusion-inpainting` can be reused.
2. **Payload Structure Adaptation**: The HF Free Inference API uses a different payload structure than Clipdrop. 
   - Single-image tasks often accept raw binary data.
   - Tasks requiring multiple inputs (like image + mask + prompt) usually expect a JSON payload with base64-encoded strings, or multipart data depending on the specific pipeline implementation on the Inference API.
3. **Refactoring Requirements**: 
   - Replace `CLIPDROP_API_KEY` with `HUGGINGFACE_API_KEY`.
   - Update `fetch` URLs to `https://api-inference.huggingface.co/models/<model_id>`.
   - Change `x-api-key` header to `Authorization: Bearer <key>`.
   - Map Clipdrop's `multipart/form-data` inputs to the specific JSON/base64 or binary formats required by each HF model.

## Caveats
- **Free Tier Limitations**: The HF Free Inference API has strict rate limits and may offload models, causing cold start delays (503 errors while loading). The implementation must handle retries for model loading.
- **Payload Nuances**: The exact API payload for multi-input diffusers pipelines (like inpainting) on the free tier can be finicky. While Diffusers typically accept JSON with base64 strings (`{ inputs: prompt, image: base64, mask_image: base64 }`), some models might require custom inference endpoints if the free tier doesn't support the full pipeline signature. 
- **Uncrop Pre-processing**: Clipdrop handles the outpainting expansion automatically. For Hugging Face, the Node.js API route will need to manually pad the original image using a library like `sharp` to create the extended canvas and corresponding mask, then pass both to the inpainting model.

## Conclusion

### Recommended Models & Payload Structures

1. **Text-to-Image**
   - **Model**: `stabilityai/stable-diffusion-xl-base-1.0`
   - **URL**: `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`
   - **Headers**: `Authorization: Bearer $HUGGINGFACE_API_KEY`, `Content-Type: application/json`
   - **Body**: `JSON.stringify({ inputs: prompt })`

2. **Reimagine**
   - **Model**: `lambdalabs/sd-image-variations-diffusers`
   - **URL**: `https://api-inference.huggingface.co/models/lambdalabs/sd-image-variations-diffusers`
   - **Headers**: `Authorization: Bearer $HUGGINGFACE_API_KEY`, `Content-Type: application/octet-stream` (or the specific image mime type)
   - **Body**: Raw image buffer (`imageBuffer`)

3. **Cleanup (Inpainting)**
   - **Model**: `runwayml/stable-diffusion-inpainting`
   - **URL**: `https://api-inference.huggingface.co/models/runwayml/stable-diffusion-inpainting`
   - **Headers**: `Authorization: Bearer $HUGGINGFACE_API_KEY`, `Content-Type: application/json`
   - **Body**: HF Diffusers typically expect: 
     `JSON.stringify({ inputs: "seamless background", image: base64Image, mask_image: base64Mask })`

4. **Upscale**
   - **Model**: `stabilityai/stable-diffusion-x4-upscaler`
   - **URL**: `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-x4-upscaler`
   - **Headers**: `Authorization: Bearer $HUGGINGFACE_API_KEY`, `Content-Type: application/json`
   - **Body**: `JSON.stringify({ inputs: "high resolution, clear, 4k", image: base64Image })`

5. **Uncrop (Outpainting)**
   - **Model**: `runwayml/stable-diffusion-inpainting`
   - **URL**: `https://api-inference.huggingface.co/models/runwayml/stable-diffusion-inpainting`
   - **Plan**: 
     1. Use a library (e.g., `sharp`) to create a padded canvas based on `extend_left`, etc.
     2. Generate a binary mask where the padded region is white (to be inpainted) and the original image is black.
     3. Convert both to base64.
     4. Send the same JSON payload as the Cleanup tool.

### Refactoring Plan
1. Update `.env.local` to replace `CLIPDROP_API_KEY` with `HUGGINGFACE_API_KEY`.
2. For each route in `src/app/api/tools/*/route.ts`:
   - Swap the destination URL to the corresponding HF model endpoint.
   - Update the authentication header to `Authorization: Bearer process.env.HUGGINGFACE_API_KEY!`.
3. Adjust payload building functions:
   - Remove `buildMultipart` from routes that will now use `application/json` (e.g., Cleanup, Upscale, Uncrop).
   - Convert `Buffer` data to base64 strings (`imageBuffer.toString('base64')`) where required by the JSON format.
4. Implement image padding and mask generation for the Uncrop tool using `sharp` or a similar Node.js image processing library.
5. Add error handling for `503 Service Unavailable` with `error.includes("is currently loading")` to implement retry logic or notify the frontend of model cold-starts.

## Verification Method
1. Ensure the new keys are set: `grep HUGGINGFACE_API_KEY .env.local`
2. Test each tool manually in the UI or via `curl` to the `/api/tools/*` endpoints. Check that responses return valid binary images (`image/jpeg` or `image/png`) rather than HF error JSONs.
