# BRIEFING — 2026-06-25T23:07:00+03:00

## Mission
Refactor `Remove BG` and `Replace BG` pages to use local WASM-based `@imgly/background-removal` entirely in the browser instead of the Clipdrop API, while still properly checking limits and tracking usage via `api/increment-usage`.

## 🔒 My Identity
- Archetype: sub_orch
- Roles: orchestrator, user_liaison, successor
- Working directory: d:/ai-headshot-generator/.agents/sub_orch_m2/
- Original parent: main agent
- Original parent conversation ID: 124e6618-d5d6-4321-8537-4f8764b8c769

## 🔒 My Workflow
- **Pattern**: Project (Sub-orchestrator loop)
- **Scope document**: d:/ai-headshot-generator/SCOPE_M2.md
1. **Decompose**: We only have one milestone: Local BG Refactor
2. **Dispatch & Execute**:
   - **Direct (iteration loop)**: 3 Explorers -> 1 Worker -> 2 Reviewers + 1 Auditor -> gate.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: at 16 spawns, write handoff.md, spawn successor
- **Work items**:
  1. M2 Local BG Refactor [in-progress]
- **Current phase**: 2 (Iteration Loop)
- **Current focus**: Iteration 3 Worker Execution

## 🔒 Key Constraints
- Use `@imgly/background-removal` or similar local in-browser processing via Canvas.
- No payload to backend servers/external APIs for images.
- MUST trigger `/api/increment-usage` upon use to enforce paywall.
- Never reuse a subagent after it has delivered its handoff.

## Current Parent
- Conversation ID: 124e6618-d5d6-4321-8537-4f8764b8c769
- Updated: 2026-06-25T23:07:00+03:00

## Key Decisions Made
- Iteration 2 code was perfectly correct, but Gate failed because concurrent Reviewer/Auditor `npm run build` corrupted `.next`.
- Iteration 3 will ensure sequential builds.

## Succession Status
- Succession required: no
- Spawn count: 4 / 16
- Pending subagents: 7fa30c4a-b4bc-4f90-8415-51191e145ac1
- Predecessor: 9f23d142-ddd0-41d0-aa33-1abc5ac4c4ad
- Successor: [not yet spawned]

## Active Timers
- Heartbeat cron: 1b883213-4a20-4b75-94f2-25ed9e18119e/task-8
- Safety timer: 1b883213-4a20-4b75-94f2-25ed9e18119e/task-44

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| Worker | teamwork_preview_worker | Iteration 3 Code Update / Build | completed | 1bd35b82-60f4-4328-9ebc-6048598ac6c3 |
| Reviewer 1 | teamwork_preview_reviewer | Iteration 3 Review | completed | f662c6b2-e9e9-4578-8b3e-42ba29d10227 |
| Reviewer 2 | teamwork_preview_reviewer | Iteration 3 Review | completed | afb5eda3-2999-49e8-92b7-9d062028ff4f |
| Auditor | teamwork_preview_auditor | Iteration 3 Audit | in-progress | 7fa30c4a-b4bc-4f90-8415-51191e145ac1 |

## Artifact Index
- d:/ai-headshot-generator/SCOPE_M2.md — M2 Scope definition
