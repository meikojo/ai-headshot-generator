# BRIEFING — 2026-06-25T22:41:14+03:00

## Mission
Investigate and provide a fix for `next.config.js` Webpack/Terser parsing error caused by `onnxruntime-web` and fix `lucide-react` `Image` shadowing bug in `replace-bg`.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Teamwork explorer
- Working directory: d:/ai-headshot-generator/.agents/teamwork_preview_explorer_m2_4/
- Original parent: 9f23d142-ddd0-41d0-aa33-1abc5ac4c4ad
- Milestone: Local BG Refactor milestone (M2)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement

## Current Parent
- Conversation ID: 9f23d142-ddd0-41d0-aa33-1abc5ac4c4ad
- Updated: not yet

## Investigation State
- **Explored paths**: `failure_report_iter1.md`, `SCOPE_M2.md`, `replace-bg/page.tsx`, `next.config.js`, `remove-bg/page.tsx`
- **Key findings**: Webpack build fails due to `'import.meta' cannot be used outside of module code` in `ort.node.min.mjs` from Terser because `@imgly/background-removal` is in `serverComponentsExternalPackages`, causing Next.js to copy its Node dependencies and run them through Terser. `replace-bg/page.tsx` has shadowing bug on `Image` import from `lucide-react`.
- **Unexplored areas**: None.

## Key Decisions Made
- Proposed aliasing `Image` to `ImageIcon` in `lucide-react` import.
- Proposed updating `next.config.js` to remove `@imgly/background-removal` from `serverComponentsExternalPackages` and set `onnxruntime-node: false` in webpack config to bypass the parsing error.

## Artifact Index
- [TBD]
