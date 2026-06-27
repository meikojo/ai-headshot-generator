# Handoff Report: Local BG Refactor (M2) Strategy

## 1. Observation
- Currently, `src/app/tools/remove-bg/page.tsx` and `src/app/tools/replace-bg/page.tsx` send the user's uploaded image to the backend via `fetch('/api/tools/...')`.
- The backend routes (`src/app/api/tools/remove-bg/route.ts` and `src/app/api/tools/replace-bg/route.ts`) send the image payload to the Clipdrop API.
- `package.json` does not currently include the `@imgly/background-removal` package.
- In `replace-bg/page.tsx`, the client sends `bgColor` and `bgImage` to the API, but `replace-bg/route.ts` ignores them and just returns a transparent PNG. The client never composites the background, meaning the "Replace BG" tool is currently functionally broken and acts exactly like "Remove BG".
- Usage tracking is currently triggered by calling `incrementUsage(toolName)` on the client after receiving a successful response from the backend.

## 2. Logic Chain
- To achieve the "Local BG" milestone, we must process the image in the browser to ensure the image payload never leaves the user's machine.
- We must first install `@imgly/background-removal`.
- For **Remove BG**, we can pass the uploaded `File` directly to `imglyRemoveBackground`, which returns a transparent `Blob`. We convert this Blob to an object URL and display it.
- For **Replace BG**, after obtaining the transparent foreground `Blob` from `@imgly`, we must use an HTML5 `<canvas>` to implement the compositing that is currently missing:
  1. Load the foreground blob into an `Image` object.
  2. Size a canvas to match the foreground's dimensions.
  3. Draw the background: if `customBg` is present, draw the custom image to fill the canvas. If `selectedBg.color` is present, fill the canvas with that color.
  4. Draw the foreground `Image` on top.
  5. Export the canvas back to a `Blob` via `canvas.toBlob()` and display it.
- To maintain the paywall and usage limits, we must still invoke the `incrementUsage` helper function once the local processing successfully completes.
- The backend routes (`/api/tools/remove-bg` and `/api/tools/replace-bg`) will become obsolete and should be deleted to prevent dead code and close off the Clipdrop API dependency.

## 3. Caveats
- **WASM Loading**: By default, `@imgly/background-removal` will download its WASM models from the `unpkg` CDN at runtime. This adheres to the requirement of "no payload to backend servers for the image itself", but requires an internet connection to download the models. If strict offline support is desired later, the models will need to be copied to the Next.js `public/` directory and the library's `publicPath` option configured. For this implementation, the default CDN behavior is acceptable.
- **Performance**: Processing locally depends on the user's device. Low-end devices might take several seconds or run out of memory for very large images. The loading UI must remain robust during this time.
- **Canvas CORS**: If custom background images are used, they are from local files (`URL.createObjectURL(file)`), so Canvas tainting won't be an issue.

## 4. Conclusion
**Implementation Strategy for the Worker:**
1. **Dependency**: Run `npm install @imgly/background-removal`.
2. **Refactor `remove-bg/page.tsx`**: 
   - Replace the `fetch` to the backend with `import imglyRemoveBackground from '@imgly/background-removal'`.
   - Call `const blob = await imglyRemoveBackground(file)`.
   - Update state: `setResultUrl(URL.createObjectURL(blob))`.
   - Keep the `await incrementUsage('remove-bg')` call.
3. **Refactor `replace-bg/page.tsx`**:
   - Use `imglyRemoveBackground(file)` to get the foreground.
   - Create a hidden HTML5 canvas.
   - Load and draw the custom background image or fill with the selected background color.
   - Draw the transparent foreground image on top.
   - Call `canvas.toBlob()` to generate the final combined image.
   - Update state: `setResultUrl(URL.createObjectURL(finalBlob))`.
   - Keep the `await incrementUsage('replace-bg')` call.
4. **Clean up**: Delete `src/app/api/tools/remove-bg/route.ts` and `src/app/api/tools/replace-bg/route.ts` (and their parent directories).

## 5. Verification Method
- **Static Check**: The codebase should no longer contain references to `/api/tools/remove-bg` or `/api/tools/replace-bg`.
- **Network Check**: Run the app locally (`npm run dev`). Open the browser's Network tab and use both tools. Verify that no image data is sent in any POST requests (excluding the lightweight `/api/increment-usage` call).
- **Functional Check**: Verify that "Replace BG" correctly composites the foreground over the selected color or custom background image (resolving the previous bug).
