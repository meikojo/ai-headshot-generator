# BRIEFING — 2026-06-25T19:28:00Z

## Mission
Investigate and plan refactoring of Local BG tools to run client-side using @imgly/background-removal without backend payload transmission.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Read-only investigation, analysis, structured reporting
- Working directory: d:/ai-headshot-generator/.agents/teamwork_preview_explorer_m2_3/
- Original parent: 9f23d142-ddd0-41d0-aa33-1abc5ac4c4ad
- Milestone: M2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Completely local processing using HTML5 Canvas
- No image payload to backend servers or external APIs
- Must still track usage and enforce paywall

## Current Parent
- Conversation ID: 9f23d142-ddd0-41d0-aa33-1abc5ac4c4ad
- Updated: not yet

## Investigation State
- **Explored paths**: `src/app/tools/remove-bg/page.tsx`, `src/app/tools/replace-bg/page.tsx`, `src/app/api/increment-usage/route.ts`, `<UsageGate>`, backend API routes.
- **Key findings**: Backend API routes are sending images to Clipdrop (violation). Replace BG API route doesn't compose backgrounds, just returns transparent PNG (bug).
- **Unexplored areas**: None.

## Key Decisions Made
- Replace backend API calls with `removeBackground` locally.
- Use HTML5 canvas to compose the images in `replace-bg`.
- Remove dead backend routes.

## Artifact Index
- `handoff.md` — Handoff report with local background refactor strategy.
