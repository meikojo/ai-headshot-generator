## 2026-06-26T12:34:38Z
You are a teamwork_preview_worker. Your task is to implement Milestone 1: Settings Schema & API Refactor for the AI Image Studio SaaS.

Working directory: d:/ai-headshot-generator/
Working metadata directory: d:/ai-headshot-generator/.agents/worker_m1

### Task Specifications

1. **Update settings schema and helpers in `src/lib/settings.ts`**:
   - Extend the `AppSettings` interface with:
     - `inference_steps: string;`
     - `cfg_scale: string;`
     - `negative_prompt: string;`
     - `width: string;`
     - `height: string;`
     - `rate_limit_free: string;`
   - Update `DEFAULT_SETTINGS` with default values:
     - `inference_steps: '20'`
     - `cfg_scale: '7.5'`
     - `negative_prompt: 'blurry, ugly, low quality'`
     - `width: '1024'`
     - `height: '1024'`
     - `rate_limit_free: '10'`

2. **Update settings API route in `src/app/api/admin/settings/route.ts`**:
   - Ensure it works with the new settings keys correctly.

3. **Update rate limiting helper in `src/lib/ratelimit.ts`**:
   - Convert `checkRateLimit` to be asynchronous: `export async function checkRateLimit(ip: string): Promise<boolean>`
   - Dynamically load the settings using `await getAppSettings()` and read the limit from `settings.rate_limit_free` (default to 10 if not parsable).
   - In-memory rate limiting map can stay as is, but it should enforce this dynamic limit.

4. **Verify TypeScript compilation**:
   - Run `npm run build` or `npx tsc --noEmit` to verify that there are no compilation errors introduced by changing `checkRateLimit` signature.
   - Note: Since changing `checkRateLimit` to return a `Promise<boolean>` will affect other API routes (like `text-to-image/route.ts`, `cleanup/route.ts`, etc.), make sure to temporarily update those calls in `src/app/api/tools/**/*.ts` (or direct `/api/*` files) to `await checkRateLimit(ip)` so the build doesn't break. You will refactor them fully in a later milestone, but they must compile now.

### Verification Criteria
- All modified files compile without TypeScript errors.
- Build compiles successfully.

### Coordination Requirements
- Write your progress updates to `d:/ai-headshot-generator/.agents/worker_m1/progress.md` containing a checklist of your steps and a `Last visited: [timestamp]` header. Update this frequently as a liveness heartbeat.
- Write your final report and handoff to `d:/ai-headshot-generator/.agents/worker_m1/handoff.md` detailing the changes made, build output, and verify compilation status.

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
