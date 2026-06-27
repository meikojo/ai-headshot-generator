const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
