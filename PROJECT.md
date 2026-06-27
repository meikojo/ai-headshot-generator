# Project: AI Image Studio SaaS Refactor

## Architecture
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **AI Local**: `@imgly/background-removal` (WASM) in browser
- **AI Remote**: Hugging Face Free Inference API
- **Auth/DB**: Supabase
- **Payments**: Stripe Checkout

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | HF API Test | `scripts/test_hf_api.js` | none | DONE |
| 2 | Local BG Tools | `Remove BG` & `Replace BG` client-side | none | PLANNED |
| 3 | HF API Tools | remaining 5 tools using HF API | M1 | DONE |

## Interface Contracts
- `/api/tools/` endpoints for HF tools must still return a `resultUrl` or base64 image data.
- Client side tools shouldn't hit `/api/tools/` but still trigger `increment-usage`.
