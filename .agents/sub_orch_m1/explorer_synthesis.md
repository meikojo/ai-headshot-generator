# Explorer Synthesis for Milestone M1

## Consensus
All three explorers agree on the strategy to implement M1:

**1. M1.1 (Cleanup)**
- Uninstall legacy dependencies: `npm uninstall @imgly/background-removal cloudinary replicate`
- Delete legacy files and directories:
  - `src/lib/cloudinary.ts`
  - `src/lib/replicate.ts`
  - `src/lib/credits.ts`
  - `src/app/api/` (all subdirectories like `credits`, `generate`, `webhook`)
  - `src/app/generate/`
  - `src/app/pricing/`
  - `src/app/remove-bg/`
  - `src/components/` (all files inside)
  - `supabase/migration.sql` (legacy, to be replaced)
- Rewrite `src/app/page.tsx` to a basic `export default function Home() { return <main></main>; }` so that it no longer imports the deleted components (like Hero, Header).

**2. M1.2 (Config & Styling)**
- Update `tailwind.config.ts` to include the specific dark theme colors:
  - `navy: '#080b14'`
  - `blue: '#4f8ef7'`
  - `purple: '#a855f7'`
- Update `src/app/globals.css` and `src/app/layout.tsx` to apply this base dark theme (navy background).

**3. M1.3 (Database Setup)**
- Create `supabase/migrations/0001_initial.sql` with the following schema:
  - Table `usage_tracking`
  - `id` (uuid, primary key)
  - `ip_address` (text)
  - `fingerprint` (text)
  - `uses_count` (int, default 0)
  - `is_paid` (boolean, default false)
  - `created_at` (timestamp, default now())
  - Unique constraint on `(ip_address, fingerprint)`

## Resolved Conflicts
No conflicts. All explorers proposed nearly identical steps.

## Verification
- `npm run build` must succeed.
- `npm run lint` must succeed without errors about missing files.
