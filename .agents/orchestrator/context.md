# Project Context & Decisions

## Key Discoveries
- The codebase uses `/tools/remove-bg` and `/tools/replace-bg` in the source code, but the Playwright E2E tests strictly expect `/tools/remove-background` and `/tools/replace-background`.
- The tests also expect endpoints `/api/remove-background` and `/api/replace-background`.
- To reconcile the mismatch, we will rename the folders in `src/app/tools` to match the exact paths expected by the tests, and update references in `Navbar.tsx`, `page.tsx`, and `ToolLayout.tsx`.
- We will consolidate all API routes directly under `src/app/api/` (i.e. `/api/cleanup`, `/api/reimagine`, `/api/upscale`, `/api/uncrop`, `/api/text-to-image`) and update the pages to call these directly.
- The `app_settings` table uses a simple key-value schema (`id text PRIMARY KEY, value text NOT NULL`), which doesn't require schema changes to store new parameters. We just insert/update them as strings.

## Critical Design Decisions
1. **Triggering automatically on upload**: The tests for `remove-background`, `upscale`, and `reimagine` upload a file and immediately verify the API request and loading states without clicking any process buttons. We will modify these three frontend pages to trigger their processing logic automatically in `handleFile`.
2. **Server-side Background Replacement**: To fully migrate `replace-background` to server-side, `/api/replace-background` will fetch the transparent foreground from the Hugging Face background removal API, generate a background image from the text prompt via a HF Text-to-Image API (using model parameters from DB), and overlay the foreground on the background using the `sharp` library.
3. **Database settings lookup**: Endpoints will look up settings (e.g. CFG scale, inference steps, width, height, negative prompt, rate limit) from Supabase. We will update `src/lib/settings.ts` and `src/lib/ratelimit.ts` to support this.
