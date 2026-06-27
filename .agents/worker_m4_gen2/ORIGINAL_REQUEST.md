## 2026-06-26T22:13:48Z

You are a teamwork_preview_worker. Your task is to implement Milestone 4: Connect Generative Endpoints to DB Settings for the AI Image Studio SaaS.

Working directory: d:/ai-headshot-generator/
Working metadata directory: d:/ai-headshot-generator/.agents/worker_m4_gen2

### Task Specifications

1. **Implement/Move the 5 generative API routes directly under `src/app/api/`**:
   - Create/Update these files:
     - `src/app/api/text-to-image/route.ts`
     - `src/app/api/cleanup/route.ts`
     - `src/app/api/upscale/route.ts`
     - `src/app/api/reimagine/route.ts`
     - `src/app/api/uncrop/route.ts`
   - Delete or replace the old endpoints in `src/app/api/tools/*` to avoid duplicate route definitions if Next.js throws build warnings, or ensure they do not conflict. (It is safer to rename/remove the old folders or redirect them, but moving them to the top level `/api/[tool-name]` is preferred).

2. **Incorporate dynamic settings and parameter payloads**:
   - Each endpoint must retrieve settings via `const settings = await getAppSettings()`.
   - Extract and format:
     - `num_inference_steps: parseInt(settings.inference_steps, 10) || 20`
     - `guidance_scale: parseFloat(settings.cfg_scale) || 7.5`
     - `negative_prompt: settings.negative_prompt || ''`
     - `width: parseInt(settings.width, 10) || 1024`
     - `height: parseInt(settings.height, 10) || 1024`
   - Inject these parameters into the Hugging Face API request payload.
     - For `text-to-image`, `cleanup`, `upscale`, `uncrop`: pass them inside a `parameters` key of the JSON request body.
     - For `reimagine` (which takes binary body): keep using binary upload, but ensure it reads model and auth headers from the DB settings.
   - Enforce rate-limiting using `await checkRateLimit(ip)` at the beginning of each route.

3. **Incorporate Offline try-catch Fallbacks**:
   - To pass E2E tests in local/offline `CODE_ONLY` environments without actual remote connections, include a try-catch fallback in each endpoint that returns a valid image placeholder (e.g. solid color background, original image buffer, or similar) when the Hugging Face fetch fails. This guarantees test stability.

4. **Verify build/compilation**:
   - Run `npm run build` or `npx tsc --noEmit` to verify there are no TypeScript compilation or routing conflicts.

### Verification Criteria
- All 5 top-level API routes compile cleanly.
- Fetch payloads correctly read and pass DB settings.
- Build compiles successfully.

### Coordination Requirements
- Write your progress updates to `d:/ai-headshot-generator/.agents/worker_m4_gen2/progress.md` containing a checklist of your steps and a `Last visited: [timestamp]` header. Update this frequently.
- Write your final report and handoff to `d:/ai-headshot-generator/.agents/worker_m4_gen2/handoff.md` detailing the changes made, build output, and verify compilation status.

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
