# Scope: M2 (Local BG Tools)

## Architecture
- Refactor `Remove BG` and `Replace BG` pages and associated components to use `@imgly/background-removal`.
- Completely local processing using HTML5 Canvas.
- Must still track usage and enforce paywall.
- No payload to backend servers or external APIs for the image itself.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Local BG Refactor | `src/app/tools/remove-bg/page.tsx` and `replace-bg` | none | PLANNED |

## Interface Contracts
- Must trigger `/api/increment-usage` upon use.
- Do not use the old Clipdrop/HuggingFace API for these tools.
