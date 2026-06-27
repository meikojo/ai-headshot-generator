# M2 (Local BG Refactor) Synthesis

## Consensus
All Explorers agree on the following refactor strategy to run the tools completely locally in the browser:

1. **Dependency**: Run `npm install @imgly/background-removal`.
2. **Dynamic Import**: `@imgly/background-removal` relies on `onnxruntime-web` which can cause Next.js SSR build errors (`fs` module not found) if imported statically. You MUST dynamically import the library strictly inside the `handleProcess` function (e.g., `const removeBackground = (await import('@imgly/background-removal')).default;`).
3. **Configuration**: Use the official static CDN for the models by setting the `publicPath` config to avoid Next.js public directory webpack copying issues: 
   `{ publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.4.3/dist/" }` or `https://unpkg.com/@imgly/background-removal-data@1.4.3/dist/` depending on the installed version.
4. **Remove BG Implementation (`src/app/tools/remove-bg/page.tsx`)**:
   - Replace the `fetch` to `/api/tools/remove-bg` with the dynamic import of `@imgly/background-removal`.
   - Process the user's `file` object.
   - Use the returned `Blob` to update `setResultUrl(URL.createObjectURL(blob))`.
   - Keep the existing `await incrementUsage('remove-bg')` call to enforce the paywall.
5. **Replace BG Implementation (`src/app/tools/replace-bg/page.tsx`)**:
   - Run the same `@imgly` process to get a transparent foreground `Blob`.
   - Create an HTML5 `<canvas>` element dynamically in memory (offscreen).
   - Load the transparent foreground `Blob` into an `HTMLImageElement` using `URL.createObjectURL(blob)` and an `onload` promise wrapper.
   - Set the canvas dimensions to match the foreground image.
   - Draw the background:
     - If `customBg` (a File) is selected, load it into an `HTMLImageElement` via `URL.createObjectURL(customBg)`. Draw it using `ctx.drawImage` with "object-fit: cover" logic (calculate scaling so it covers the whole canvas without stretching).
     - If `selectedBg.color` is present, use `ctx.fillStyle` and `ctx.fillRect`.
   - Draw the foreground `Image` over it using `ctx.drawImage(fgImage, 0, 0)`.
   - Extract the final image using `canvas.toBlob()`, update `setResultUrl(URL.createObjectURL(finalBlob))`, and call `await incrementUsage('replace-bg')`.
6. **Cleanup**: Delete the obsolete backend routes `src/app/api/tools/remove-bg/route.ts` and `src/app/api/tools/replace-bg/route.ts` and their parent folders `remove-bg` and `replace-bg`.

## Integrity Rules
- Do NOT hardcode test results.
- Implement genuine Canvas processing.
- Ensure the image data is never sent to the backend.

## Execution
Please implement the above synthesis. Your workspace is `d:/ai-headshot-generator/.agents/teamwork_preview_worker_m2/`. Ensure you run `npm run build` locally after your changes to verify no SSR/WASM build errors.
