# AI Headshot Generator

Transform your photos into professional AI-generated headshots in seconds. Powered by Next.js 14, Replicate AI, and modern web technologies.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with dark theme
- **AI Model**: [Replicate](https://replicate.com/) — tencentarc/photomaker
- **Image Storage**: [Cloudinary](https://cloudinary.com/) (free tier, auto-expire 1hr)
- **Auth & Database**: [Supabase](https://supabase.com/) (free tier)
- **Payments**: [Stripe](https://stripe.com/) Checkout (one-time credit packs)
- **Deployment**: [Vercel](https://vercel.com/)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-headshot-generator.git
cd ai-headshot-generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and provide all required values (see Environment Variables below).

### 4. Run Supabase migration

Execute the migration SQL in your Supabase project's SQL editor:

```bash
# Open supabase/migration.sql and run it in the Supabase Dashboard -> SQL Editor
```

This creates the `user_credits` table to manage user credits based on email.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `REPLICATE_API_TOKEN` | Replicate API token | [replicate.com/account](https://replicate.com/account) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary Dashboard → Settings |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary Dashboard → Settings |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard → Developers → Webhooks |

## Deployment

### Vercel (Recommended)

1. Push your code to a GitHub repository.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Add all environment variables in Vercel's project settings.
4. Deploy — Vercel will automatically detect the Next.js framework.

The project includes a `vercel.json` configuration file for optimal deployment settings.

## License

MIT
