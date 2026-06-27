# Exploration Report: Local BG Refactor (M2)

## Observation
- `package.json` does not currently include `@imgly/background-removal` as a dependency.
- Both `src/app/tools/remove-bg/page.tsx` and `src/app/tools/replace-bg/page.tsx` send the user's uploaded `file` via a `POST` fetch to `/api/tools/remove-bg` and `/api/tools/replace-bg`, respectively.
- The endpoints (`src/app/api/tools/remove-bg/route.ts` and `src/app/api/tools/replace-bg/route.ts`) use the `clipdrop-api.co` external API, which violates the requirement for local execution without backend payloads.
- The existing `/api/tools/replace-bg/route.ts` ignores `bgColor` and `customBg` form fields and just returns a transparent PNG, leaving the replace-bg tool fundamentally broken (it doesn't actually compose the new background).
- Both tools invoke an asynchronous `incrementUsage('tool-name')` function after a successful API call. This posts a fingerprint to `/api/increment-usage` which updates the database. The `<UsageGate>` restricts access using the `useUsageLimit` hook properly.

## Logic Chain
1. **Remove backend reliance**: Delete `src/app/api/tools/remove-bg/route.ts` and `src/app/api/tools/replace-bg/route.ts` as they will become dead code and violate the local execution constraints.
2. **Setup**: Install the required library (`npm install @imgly/background-removal`).
3. **Local Remove BG Refactor**: 
   - In `remove-bg/page.tsx`, swap the `fetch('/api/tools/remove-bg')` logic in `handleProcess` with `@imgly/background-removal`.
   - Call `removeBackground(file)` directly on the client side, retrieve the `Blob`, generate an object URL via `URL.createObjectURL()`, and set it as `resultUrl`.
   - Maintain the `await incrementUsage('remove-bg')` call immediately after to track usage.
4. **Local Replace BG Refactor (and bug fix)**:
   - In `replace-bg/page.tsx`, first get the transparent foreground by running `removeBackground(file)`.
   - Use an HTML5 `<canvas>` to properly compose the chosen background and the transparent foreground.
   - For `selectedBg` (solid color), fill the canvas context.
   - For `customBg` (image file), load it into an `Image` object and draw it onto the canvas, calculating scaling so it covers the canvas bounds (similar to `object-fit: cover`).
   - Draw the foreground `Image` on top.
   - Extract the final composite image as a `Blob` using `canvas.toBlob()`, set as `resultUrl`, and call `await incrementUsage('replace-bg')`.
5. **No UX changes**: The existing `ToolLayout`, `UsageGate`, and dark theme components do not require changes, keeping the standard 40/60 split and usage enforcement intact.

## Caveats
- `@imgly/background-removal` will download WebAssembly and ML model assets from an external CDN at runtime by default. This is permitted as it's static asset fetching and does not involve sending the *image payload* externally.
- When compositing `customBg` in `replace-bg`, ensure cross-origin/CORS issues don't occur when loading the file into an `Image` object. Since `customBg` is an uploaded `File`, using `URL.createObjectURL(customBg)` will be safe and fully local.

## Conclusion
Refactoring to `@imgly/background-removal` fully enables local execution. The `remove-bg` implementation is a straightforward substitution of the fetch call with the local function. The `replace-bg` implementation requires the additional step of HTML5 Canvas composition, which resolves a currently broken feature where background replacement is entirely ignored. The `incrementUsage` function safely tracks the event without violating the local processing rule. The backend routes for these tools should be deleted.

## Verification Method
1. Run `npm install @imgly/background-removal` and then `npm run dev`.
2. Open `/tools/remove-bg`. Upload an image, click Process, and verify the network tab does not send the image to any external/internal API while returning a transparent background result.
3. Open `/tools/replace-bg`. Upload an image, select a solid color, and process. Repeat by uploading a custom background image. Ensure the output is a properly composited single image containing both layers.
4. Verify `/api/increment-usage` is still called successfully on process completion.
5. Ensure `src/app/api/tools/remove-bg/route.ts` and `src/app/api/tools/replace-bg/route.ts` no longer exist.
