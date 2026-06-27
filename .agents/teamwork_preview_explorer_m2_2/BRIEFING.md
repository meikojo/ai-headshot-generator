# BRIEFING — 2026-06-25T19:28:00Z

## Mission
Investigate and plan how to refactor src/app/tools/remove-bg/page.tsx and replace-bg/page.tsx to run completely locally in the user's browser using @imgly/background-removal (and HTML5 Canvas). Provide strategy on handling WASM loading and canvas processing in Next.js client components.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Read-only investigator, Architecture Planner
- Working directory: d:/ai-headshot-generator/.agents/teamwork_preview_explorer_m2_2/
- Original parent: 9f23d142-ddd0-41d0-aa33-1abc5ac4c4ad
- Milestone: Local BG Refactor (M2)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- They must not send image payloads to any backend server or external API
- They must still trigger /api/increment-usage

## Current Parent
- Conversation ID: 9f23d142-ddd0-41d0-aa33-1abc5ac4c4ad
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `SCOPE_M2.md`, `PROJECT.md`
  - `src/app/tools/remove-bg/page.tsx`, `src/app/tools/replace-bg/page.tsx`
  - `package.json`, `next.config.js`
- **Key findings**:
  - `@imgly/background-removal` is not yet in package.json.
  - The current implementations send the image file via `FormData` to Next.js API routes (`/api/tools/remove-bg` and `/api/tools/replace-bg`).
  - Next.js config doesn't have WASM configuration right now.
- **Unexplored areas**:
  - Exact HTML5 Canvas implementation logic for `replace-bg`.

## Key Decisions Made
- [none yet]

## Artifact Index
- [handoff.md] — [Detailed strategy for M2 refactoring]
