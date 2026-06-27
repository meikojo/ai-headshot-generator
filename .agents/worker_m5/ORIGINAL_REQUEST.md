## 2026-06-26T19:52:31Z

You are a teamwork_preview_worker. Your task is to implement Milestone 5: Frontend Page Refactoring & Triggers for the AI Image Studio SaaS.

Working directory: d:/ai-headshot-generator/
Working metadata directory: d:/ai-headshot-generator/.agents/worker_m5

### Task Specifications

1. **Rename Page Folders & Update Links**:
   - Rename directories (or move contents and delete the old directories):
     - `src/app/tools/remove-bg` -> `src/app/tools/remove-background`
     - `src/app/tools/replace-bg` -> `src/app/tools/replace-background`
   - Update navigation and reference links to use `/tools/remove-background` and `/tools/replace-background` in:
     - `src/app/page.tsx`
     - `src/components/Navbar.tsx`
     - `src/components/ToolLayout.tsx`

2. **Implement Auto-triggers on Upload**:
   - In these three pages, when the user uploads or drops a file (in `handleFile`), immediately trigger the background API request without waiting for the user to click a process button:
     - `src/app/tools/remove-background/page.tsx` (calls `/api/remove-background`)
     - `src/app/tools/upscale/page.tsx` (calls `/api/upscale`)
     - `src/app/tools/reimagine/page.tsx` (calls `/api/reimagine`)
   - Make sure that the file upload immediately sets the loading/processing state to true and fires the API request.

3. **Update `replace-background` UI and Logic**:
   - Refactor `src/app/tools/replace-background/page.tsx`:
     - Add a text input or textarea with an accessible label/name `Prompt` so users can enter a description of the new background.
     - Add a button with the exact text `Generate` to submit/start the process.
     - On submission, POST the image file and the prompt text as `formData` to the server-side API `/api/replace-background`.
     - Ensure the paywall usage check and increments trigger successfully.

4. **Update Endpoint Paths in All Tool Pages**:
   - Ensure all frontend tool pages call the direct API endpoints rather than the old `/api/tools/...` endpoints:
     - Cleanup page calls `/api/cleanup`
     - Reimagine page calls `/api/reimagine`
     - Upscale page calls `/api/upscale`
     - Uncrop page calls `/api/uncrop`
     - Text to Image page calls `/api/text-to-image`
     - Remove Background page calls `/api/remove-background`
     - Replace Background page calls `/api/replace-background`

5. **Verify build/compilation**:
   - Run `npm run build` or `npx tsc --noEmit` to verify there are no TypeScript compilation or routing issues.

### Verification Criteria
- All page files and references are updated to `/tools/remove-background` and `/tools/replace-background`.
- Auto-trigger on upload functions correctly on remove-background, upscale, and reimagine.
- Replace-background has the text field `Prompt`, button `Generate`, and targets `/api/replace-background`.
- All pages point to `/api/*` endpoints.
- Build compiles successfully.

### Coordination Requirements
- Write your progress updates to `d:/ai-headshot-generator/.agents/worker_m5/progress.md` containing a checklist of your steps and a `Last visited: [timestamp]` header. Update this frequently.
- Write your final report and handoff to `d:/ai-headshot-generator/.agents/worker_m5/handoff.md` detailing the changes made, build output, and verify compilation status.
