# Original User Request

## Initial Request — 2026-06-23T04:54:59Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: The project has been delegated to the AI Image Studio Development Team.

An AI Image Studio SaaS powered by Clipdrop API, featuring 7 distinct image tools, a dark-themed UI, and a robust IP-based freemium paywall backed by Supabase and Stripe.

Working directory: `d:/ai-headshot-generator`
Integrity mode: development

## Requirements

### R1. Freemium Enforcement System
Implement a strict IP and canvas-fingerprinting tracking system using Supabase. Users get exactly 3 free uses total across all tools. Build `/api/check-limit` and `/api/increment-usage` with server-side validation.

### R2. Clipdrop Tool Integration
Build 7 distinct AI image tools (Remove Background, Cleanup, Replace Background, Reimagine, Upscale, Uncrop, Text to Image) under `/tools/[tool-name]`. All external API calls must be server-side to protect keys.

### R3. Usage Gate and Monetization
Implement a shared `<UsageGate>` component wrapping all tools. Integrate Stripe Checkout for a Pay-Per-Use ($3) and Unlimited ($12/mo) plan, updating the Supabase `usage_tracking` table via Webhook.

### R4. UI/UX Design System
Apply a dark navy theme (#080b14) with electric blue (#4f8ef7) and purple (#a855f7) accents. Build a single-page scrolling homepage with a 2x4 tool grid and a consistent layout for all tool pages (40% upload zone, 60% result display).

## Acceptance Criteria

### Security & Enforcement
- [ ] Fingerprint generation is consistent for the same browser session.
- [ ] `/api/check-limit` correctly calculates and returns remaining usage based on IP + Fingerprint.
- [ ] A 4th request from the same user is strictly blocked server-side.
- [ ] Incognito mode generates a new limit (intentional per specs).
- [ ] `CLIPDROP_API_KEY` and other sensitive keys are never exposed in client-side code.

### Tools & UI
- [ ] Each of the 7 tool pages successfully calls its respective Clipdrop API and `/api/increment-usage` on success.
- [ ] All 7 tool pages are responsive down to 375px width.

### Monetization
- [ ] Stripe webhook (`/api/webhook`) correctly sets `is_paid=true` in Supabase upon successful checkout.
- [ ] Paid users do not see the usage badge or paywall.

### Code Quality
- [ ] `npm run build` completes with zero errors or warnings.
