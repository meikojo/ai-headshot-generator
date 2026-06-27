# Observation
- The current implementation of `src/app/tools/remove-bg/page.tsx` and `src/app/tools/replace-bg/page.tsx` uploads images via `FormData` to Next.js API endpoints (`/api/tools/remove-bg` and `/api/tools/replace-bg`).
- Both tools track usage by calling `/api/increment-usage` from the client after a successful response.
- `package.json` does not currently include `@imgly/background-removal`.
- Both pages use Next.js Client Components (`'use client'`).
- `next.config.js` has no WebAssembly or external package configurations for the client.

# Logic Chain
1. **Dependency & WASM Loading**: 
   - `@imgly/background-removal` relies on `onnxruntime-web` to execute WASM and ONNX models. In Next.js 14, importing these libraries at the top level can trigger SSR execution and cause build errors (e.g., `Module not found: Can't resolve 'fs'`).
   - *Strategy*: Dynamically import `removeBackground` strictly inside the `handleProcess` event handler (e.g., `const removeBackground = (await import('@imgly/background-removal')).default;`). This avoids SSR issues and keeps the initial bundle small.
   - The library must download WASM/ONNX model files at runtime. To avoid complex Next.js public directory webpack copying, use their official static CDN for the models by setting the `publicPath` config:
     `{ publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.4.3/dist/" }`. This downloads the models locally into the browser without sending any image payloads externally.

2. **Remove BG Implementation**:
   - Replace the `fetch('/api/tools/remove-bg')` call with the dynamic import of `@imgly/background-removal`.
   - Pass the user's `File` object and the config.
   - Use the returned `Blob` to update `setResultUrl(URL.createObjectURL(blob))`.
   - Keep the existing `await incrementUsage('remove-bg')` call.

3. **Replace BG Implementation (Canvas Processing)**:
   - First, run the same `@imgly` local removal to get a transparent foreground `Blob`.
   - Create an HTML5 `<canvas>` element dynamically.
   - Load the transparent foreground `Blob` into an `HTMLImageElement` using an `onload` promise wrapper.
   - Set the canvas dimensions to match the foreground image.
   - Draw the background:
     - If `customBg` is selected, load the file into an `HTMLImageElement`, and use `ctx.drawImage(bgImage, ...)` (you may need to calculate 'object-fit: cover' logic to fill the canvas nicely).
     - If `selectedBg.color` is present, use `ctx.fillStyle = selectedBg.color` and `ctx.fillRect(0, 0, width, height)`.
   - Draw the foreground over it using `ctx.drawImage(fgImage, 0, 0)`.
   - Extract the final image using `canvas.toBlob()`, update `resultUrl`, and call `incrementUsage('replace-bg')`.

# Caveats
- **"Completely Locally" Interpretation**: Using the imgly CDN for `publicPath` requires an internet connection on the first run to fetch the ~40MB model weights. However, the image payload is **never** sent to any external server, which fulfills the privacy constraint. If strict offline support is required, the implementer will need to manually download the `@imgly` dist files into Next's `public/` folder, which adds repository bloat. CDN is recommended.
- **Performance**: The process is CPU/memory intensive. Ensure `isProcessing` state remains `true` to show the loader, and wrap the `@imgly` execution in a `try/catch` block.
- **Canvas Scaling**: For `customBg`, drawing the image onto the canvas should ideally cover the whole background without stretching. Using a calculation similar to `object-fit: cover` when defining the `dx, dy, dWidth, dHeight` in `ctx.drawImage` is highly recommended.

# Conclusion
The refactor can be achieved cleanly entirely on the client. 
1. Install `@imgly/background-removal`.
2. Refactor `handleProcess` in both pages to dynamically import the library and execute it locally using the `publicPath` CDN config. 
3. For `replace-bg`, use an offscreen HTML5 `<canvas>` to draw the chosen background (color or custom image) and then overlay the `@imgly` output blob. 
4. Trigger `/api/increment-usage` after the client-side processing succeeds, replacing the old API route fetch.

# Verification Method
1. Install the dependency and run the Next.js dev server.
2. Go to `/tools/remove-bg` and `/tools/replace-bg`, upload an image and click "Process".
3. Check the Browser's "Network" tab to confirm:
   - The image is NOT sent in a POST request.
   - Only WASM/model chunks are downloaded (from imgly CDN).
   - A POST request to `/api/increment-usage` is successfully fired.
4. Ensure the resulting UI displays the final image properly.
