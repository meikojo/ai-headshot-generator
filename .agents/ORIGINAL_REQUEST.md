# Original User Request

## Initial Request — 2026-06-25T18:59:00Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: The project has been delegated to the AI Image Studio Development Team.

An Image Studio SaaS that provides 7 professional image tools with **ZERO operational costs**. Paid APIs are replaced entirely by client-side browser processing (WASM) and free-tier third-party inference APIs.

Working directory: `d:/ai-headshot-generator`
Integrity mode: development

## Requirements

### R1. Zero-Cost Background Tools (Client-Side)
Refactor `Remove BG` and `Replace BG` to run completely locally in the user's browser using `@imgly/background-removal` (or similar WASM-based free libraries) and HTML5 Canvas. These tools must not send image payloads to any backend server or external API.

### R2. Free Generative Tools (Hugging Face API)
Refactor the remaining 5 tools (Text-to-Image, Reimagine, Cleanup, Upscale, Uncrop) to route requests through the **Hugging Face Free Inference API**. Use robust open-source models suitable for free tier usage (e.g., Stable Diffusion variants, Flux.1-schnell, etc.). Replace `CLIPDROP_API_KEY` logic with `HUGGINGFACE_API_KEY`.

### R3. Maintain Paywall & Tracking
Do not alter the existing Supabase IP/Fingerprint tracking or Stripe checkout components. The business model remains the same (charging users for access) while backend operational costs drop to zero.

## Verification Resources
The team must build a programmatic test script (`scripts/test_hf_api.js`) to verify that the Hugging Face API connection is working and correctly returning image buffers before modifying the Next.js routes.

## Acceptance Criteria

### Security & Privacy
- [ ] `Remove BG` and `Replace BG` process images entirely in the browser (verified via Network tab — no image files are uploaded).
- [ ] API Keys (`HUGGINGFACE_API_KEY`) are kept strictly server-side in the `/api/tools/` routes.

### Functionality
- [ ] `scripts/test_hf_api.js` executes successfully and returns a 200 OK status from Hugging Face.
- [ ] All 7 tools render correctly and the site compiles without errors (`npm run build` succeeds).
