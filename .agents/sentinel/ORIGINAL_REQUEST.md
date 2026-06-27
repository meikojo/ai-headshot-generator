# Original User Request

## Initial Request — 2026-06-23T00:41:30Z

Build a complete, production-ready AI Headshot Generator web application (Zero-Cost MVP). Users upload a selfie, an AI model generates a professional headshot, and a freemium paywall gates usage after 3 free generations.

Working directory: d:/ai-headshot-generator
Integrity mode: development

## Tech Stack (mandatory — do not deviate)
- Frontend: Next.js 14 (App Router) + Tailwind CSS
- Backend: Next.js API Routes (no separate backend needed)
- AI Model: Replicate API → `tencentarc/photomaker` model
- Storage: Cloudinary (free tier)
- Database & Auth: Supabase (free tier)
- Payments: Stripe Checkout (pay-per-pack)
- Deployment: Vercel-ready (vercel.json included)

## Requirements

### R1. Upload & AI Generation
Full-page drag-and-drop upload zone (JPG/PNG, max 10MB) with client-side preview. A `POST /api/generate` endpoint receives the image as base64, calls Replicate API with `tencentarc/photomaker` using a professional headshot prompt, and returns the generated image URL. Include a loading state with an animated progress bar (fake 0→95%) and a side-by-side before/after result display.

### R2. Freemium Gate & Payments
Track usage in localStorage (`headshot_count`, 0–3). First 3 generations are free with no login required. On the 4th attempt, show a modal with two Stripe Checkout options: "Get 10 more for $4" (one-time) and "Subscribe $12/month unlimited". After successful Stripe payment, store credits in a Supabase `user_credits` table keyed by email from the Stripe session.

### R3. Download & Viral Loop
Download button saves the image as `headshot-[timestamp].jpg`. Free downloads get a subtle bottom-right watermark "✨ HeadshotAI.app" (removed for paid users). A share button copies a pre-written tweet: "Just upgraded my profile photo with AI 🤯 Try it free → [URL]".

### R4. UI/UX & Design
Dark theme (bg `#0a0a0a`, accent `#6366f1` indigo), Inter font from Google Fonts, mobile-first responsive (min 375px width). Hero section with headline "Turn Any Selfie Into a Professional Headshot", subheadline "No photographer. No studio. 30 seconds." Social proof bar: "10,000+ professionals upgraded their photo". FAQ section (5 questions about privacy, quality, refunds).

### R5. Security & Constraints
- All API keys via environment variables only — never hardcoded.
- Every API route must have try/catch with proper error responses.
- Image data must never be stored permanently — delete from Cloudinary after 1 hour using auto-expire tag.
- Zero external paid dependencies at build time.

## ENV Variables (create .env.example)
```
REPLICATE_API_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Supabase Schema (create migration SQL file)
```sql
CREATE TABLE user_credits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  credits integer DEFAULT 0,
  is_subscribed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

## Acceptance Criteria

### Build & Structure
- [ ] Project initializes successfully with `npx create-next-app`
- [ ] `npm run build` completes without errors
- [ ] `.env.example` contains all 10 required environment variables
- [ ] Supabase migration SQL file is present and syntactically valid
- [ ] `vercel.json` is present for deployment readiness
- [ ] `README.md` includes setup instructions (5 steps max)

### Upload & Generation (R1)
- [ ] Drag-and-drop upload zone accepts JPG/PNG files up to 10MB
- [ ] Client-side image preview displays before submission
- [ ] `/api/generate` endpoint calls Replicate API with the correct model and prompt
- [ ] Loading animation displays while waiting for AI response
- [ ] Before/after images display side-by-side after generation

### Freemium & Payments (R2)
- [ ] `localStorage` counter increments on each generation
- [ ] Paywall modal appears on the 4th generation attempt
- [ ] Stripe Checkout redirects work for both one-time and subscription options
- [ ] `/api/webhook` endpoint processes Stripe events and updates Supabase credits

### Download & Sharing (R3)
- [ ] Download button saves image with correct filename format
- [ ] Watermark appears on free-tier downloads
- [ ] Share button copies tweet text to clipboard

### UI/UX (R4)
- [ ] Dark theme with specified colors is applied globally
- [ ] Layout is responsive at 375px minimum width
- [ ] Hero section, social proof bar, and FAQ section are all present

### Security (R5)
- [ ] No API keys are hardcoded in source files
- [ ] All API routes include try/catch error handling
- [ ] Cloudinary uploads use auto-expire tags

## Deliverables
1. Complete Next.js project folder structure (no placeholders, no TODOs)
2. All source files fully implemented
3. README.md with setup instructions
4. .env.example
5. Supabase migration SQL file

## Follow-up — 2026-06-26T12:30:00Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval.
> Goal: Delegate to teamwork_preview to execute the robust fixes and advanced dashboard.

Fix Hugging Face API generative endpoints, replace the failing client-side background removal tool with a robust Hugging Face API alternative, and build an advanced Admin Dashboard to deeply control all AI parameters and site limits for professional use.

Working directory: `d:/ai-headshot-generator`
Integrity mode: benchmark

## Requirements

### R1. Robust Background Removal via API
Replace the failing `@imgly/background-removal` client-side implementation with a robust server-side connection to a free Hugging Face Inference API model dedicated to background removal (e.g., `briaai/RMBG-1.4` or similar). Ensure it handles image uploads and returns the transparent result without console errors.

### R2. Advanced Admin Dashboard Expansion
Expand the `/admin` dashboard and `app_settings` Supabase table to manage:
- **Advanced AI Parameters**: Inference Steps, CFG Scale (Guidance Scale), and Negative Prompts.
- **Image Parameters**: Output Width and Height.
- **Site Controls**: Rate Limiting (number of free attempts allowed per IP/Fingerprint).

### R3. API Payload Integration & Stability
Ensure all 5 generative tools (Text-to-Image, Cleanup, Upscale, Reimagine, Uncrop) successfully connect to the Hugging Face Inference API. Update the API routes to read the new advanced parameters (Steps, CFG, Dimensions, etc.) from the DB and inject them correctly into the Hugging Face API payloads according to their specific model documentation. Research the exact payload structures using the web browser if necessary.

## Acceptance Criteria

### Verification
- [ ] The `remove-bg` tool processes an image via Hugging Face API and successfully returns a transparent image without `removeBackground is not a function` errors.
- [ ] All 5 generative tools successfully return images, proving their API payloads are correctly formatted.
- [ ] The Admin Dashboard UI allows editing all the new advanced parameters (Steps, CFG, Negative Prompt, Dimensions, Rate Limit) and saves them to the Supabase DB.
- [ ] The API routes successfully read these parameters from the DB and apply them to the generation requests.
