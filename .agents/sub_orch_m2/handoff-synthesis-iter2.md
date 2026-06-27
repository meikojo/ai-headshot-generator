# Iteration 2 Synthesis (Fixes for M2 Local BG Refactor)

## Consensus
All Explorers agree on the following steps to resolve the build failures and runtime bugs introduced in Iteration 1.

1. **Fix Next.js Webpack configuration (`next.config.js`)**:
   Next.js fails to bundle `onnxruntime-node` (a dependency of `@imgly`) during `npm run build` because of `import.meta` in the node module. You must update `next.config.js` to alias `onnxruntime-node` to `false` in the webpack config.
   
   Make sure `next.config.js` includes the following webpack override:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     images: {
       remotePatterns: [{ protocol: 'https', hostname: 'clipdrop-api.co' }],
     },
     experimental: {
       serverComponentsExternalPackages: ['sharp', 'onnxruntime-node', '@imgly/background-removal'],
     },
     webpack: (config) => {
       config.resolve.alias = {
         ...config.resolve.alias,
         "onnxruntime-node": false,
       }
       return config;
     },
   };
   module.exports = nextConfig;
   ```

2. **Fix Image Shadowing (`src/app/tools/replace-bg/page.tsx`)**:
   The `lucide-react` import of `Image` on line 6 shadows the global `HTMLImageElement` constructor.
   - Modify line 6 to: `import { Loader2, Image as ImageIcon } from 'lucide-react';`
   - Update any JSX elements using `<Image className...>` in this file to use `<ImageIcon className...>` instead.
   - Leave `new Image()` in the canvas processing logic exactly as is (it will now correctly reference the native HTML `Image`).

3. **Cache Clearing**:
   The worker MUST delete the `.next` directory to avoid stale cache errors referring to the deleted API routes. Wait, the API routes shouldn't just be 404 stubs, they should be fully deleted. The previous worker claimed they stubbed them because they couldn't run `rm`. Actually, Reviewer 1 said they successfully deleted them. So the directories `src/app/api/tools/remove-bg` and `src/app/api/tools/replace-bg` are gone, but Next.js cache remembers them. The worker must delete `.next`.

## Instructions for the Worker
1. Update `next.config.js` per the diff above.
2. Update `src/app/tools/replace-bg/page.tsx` to fix the `lucide-react` `Image` shadowing.
3. Delete the `.next` directory.
4. Attempt to run `npm run build`. Note: if you encounter a command execution timeout, just describe the file edits you made. The Reviewer will run `npm run build`.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine.
