# Refactoring Plan - server-side Hugging Face API and Admin Dashboard

## Milestones

### Milestone 1: Settings Schema & API Refactor
- Update `src/lib/settings.ts` to support:
  - `inference_steps` (default: '20')
  - `cfg_scale` (default: '7.5')
  - `negative_prompt` (default: 'blurry, ugly, low quality')
  - `width` (default: '1024')
  - `height` (default: '1024')
  - `rate_limit_free` (default: '10')
- Ensure these new fields are properly saved to Supabase and cache-managed.
- Update `src/lib/ratelimit.ts` to query `getAppSettings()` dynamically and enforce `rate_limit_free` per minute (or request quota check as configured).

### Milestone 2: Admin Dashboard UI Expansion
- Update `src/app/admin/page.tsx` to include fields for:
  - Advanced AI parameters (Inference Steps, CFG scale, Negative Prompt)
  - Dimensions (Width, Height)
  - Rate Limits (attempts per IP/Fingerprint)
- Test saving all configuration settings and ensure they persist.

### Milestone 3: Server-side Background Removal & Replacement API Routes
- Implement `src/app/api/remove-background/route.ts`:
  - Receives multipart form-data image.
  - Sends it to Hugging Face Inference API using background removal model `briaai/RMBG-1.4`.
  - Returns raw png image with transparent background.
- Implement `src/app/api/replace-background/route.ts`:
  - Receives multipart form-data (image + prompt).
  - Removes background from the image using the RMBG-1.4 API or local logic.
  - Generates a background using the prompt via Text-to-Image (FLUX or Stable Diffusion).
  - Composites foreground onto generated background using `sharp`.
  - Returns combined image.

### Milestone 4: Connect Generative Endpoints to DB Settings
- Update standard generative API routes under `src/app/api/`:
  - `/api/text-to-image/route.ts`
  - `/api/cleanup/route.ts`
  - `/api/upscale/route.ts`
  - `/api/reimagine/route.ts`
  - `/api/uncrop/route.ts`
- Ensure all endpoints:
  - Read from DB via `getAppSettings()`.
  - Construct payload conforming to model API docs (injecting steps, cfg, prompt, negative prompt, dimensions).
  - Handle rate-limiting dynamically based on `rate_limit_free` from DB.

### Milestone 5: Frontend Page Refactoring & Triggers
- Rename directories:
  - `src/app/tools/remove-bg` -> `src/app/tools/remove-background`
  - `src/app/tools/replace-bg` -> `src/app/tools/replace-background`
- Update homepage `src/app/page.tsx`, Navbar `src/components/Navbar.tsx` and ToolLayout `src/components/ToolLayout.tsx` to use the updated links `/tools/remove-background` and `/tools/replace-background`.
- Make `remove-background`, `upscale`, and `reimagine` pages automatically trigger API processing upon file upload.
- Update `replace-background` page to have a prompt textbox (`Prompt`) and a `Generate` button, calling `/api/replace-background` on submit.
- Update other tool pages to hit the direct endpoints `/api/cleanup`, `/api/reimagine`, `/api/upscale`, `/api/uncrop`, `/api/text-to-image`.

### Milestone 6: Testing & E2E Validation
- Run Playwright E2E tests to verify layout, functionality, limits, and integrations.
- Run Forensic Auditor to guarantee benchmark integrity.
