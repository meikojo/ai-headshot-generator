# Hand-off Report: Local BG Tools Fixes

## 1. Observation
1. In `src/app/tools/replace-bg/page.tsx`, `Image` was imported from `lucide-react` (line 6) but later in the file (lines 58, 72) `new Image()` was called. This resulted in a shadowing conflict where the React component `Image` shadowed the native `HTMLImageElement` constructor.
2. The `npm run build` fails with `import.meta cannot be used outside of module code` in `static/media/ort.node.min.mjs` from Terser.
3. `ort.node.min.mjs` is a Node.js specific file from `onnxruntime-web`. It is being copied as an asset and minified by Terser because `@imgly/background-removal` is currently listed in `serverComponentsExternalPackages` in `next.config.js`.

## 2. Logic Chain
1. **Fixing Shadowing**: By aliasing `Image` to `ImageIcon` on import (`import { Loader2, Image as ImageIcon } from 'lucide-react';`), the global `Image` constructor remains available for `new Image()`, solving the instantiation error.
2. **Fixing Webpack Error**: Since `@imgly/background-removal` is purely a client-side dependency in M2, it DOES NOT need to be in `serverComponentsExternalPackages`. Next.js copies external packages verbatim, which causes the Node files inside `onnxruntime-web` (like `ort.node.min.mjs`) to be processed by asset loaders and minified by Terser, causing a syntax error because Terser cannot parse `import.meta` in script mode. By removing `@imgly/background-removal` from `serverComponentsExternalPackages` and aliasing `"onnxruntime-node": false`, we prevent Webpack from parsing the Node distribution for the client.

## 3. Caveats
- Removing `@imgly/background-removal` from `serverComponentsExternalPackages` means it cannot be used in Server Components. However, M2 explicitly states "completely local processing using HTML5 Canvas" and "No payload to backend", which means this package is exclusively for the client-side. This aligns perfectly with the architectural constraints.

## 4. Conclusion
We must implement the following fixes:
1. Alias the `lucide-react` `Image` in `src/app/tools/replace-bg/page.tsx` to `ImageIcon`.
2. Update `next.config.js` to remove `@imgly/background-removal` from `serverComponentsExternalPackages`.
3. Add a Webpack alias for `"onnxruntime-node": false`.

**Diff for `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'clipdrop-api.co' }],
  },
  experimental: {
    // REMOVED '@imgly/background-removal'
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
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

**Diff for `src/app/tools/replace-bg/page.tsx`:**
```typescript
- import { Loader2, Image } from 'lucide-react';
+ import { Loader2, Image as ImageIcon } from 'lucide-react';

-          <Image size={16} /> Replace Background
+          <ImageIcon size={16} /> Replace Background

-          <Image size={48} className="mx-auto mb-4 opacity-30" />
+          <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
```

## 5. Verification Method
1. Apply the `next.config.js` and `replace-bg/page.tsx` changes.
2. Clear the Next cache: `Remove-Item -Recurse -Force .next` or `rm -rf .next`
3. Run `npm run build` to verify the production build succeeds without Terser throwing module errors.
4. Verify the `lucide-react` import change correctly resolves the `Image` shadowing issue.
