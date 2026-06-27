# 🚀 AI Agent Handoff Document
**Project:** AI Image Studio (Zero-Cost Architecture)
**Target Agent:** OpenCode (powered by DeepSeek/Gemini/Groq)

## 📋 Context & Project Architecture
You are taking over the development of a Next.js Web Application. The core philosophy of this project is a **"Zero-Cost Architecture"**.
- **Frontend:** Next.js (React), Vanilla CSS (or Tailwind if configured).
- **Backend/APIs:** We completely removed expensive APIs. We are now exclusively using the **Hugging Face Inference API** for all generative AI image tools.
- **State/Database:** We implemented a "Mock Database" system in `src/lib/settings.ts` so the Admin Dashboard can function smoothly during development without requiring a live Supabase connection yet.
- **Admin Dashboard:** Located at `src/app/admin/page.tsx`. It controls advanced parameters like `inference_steps`, `cfg_scale`, and model IDs dynamically.

## ✅ What Has Been Completed (Phase 1 & 2)
1. **Zero-Cost Migration:** All generative tools have been migrated to the Hugging Face Inference API.
2. **Admin Dashboard:** Fully built and functional. It reads and writes settings via `settings.ts`.
3. **API Routes:** The routes in `src/app/api/tools/*/route.ts` have been refactored to support dynamic Supabase-driven settings and dynamic payloads for Hugging Face.
4. **MCP Tooling:** The workspace is equipped with `TestSprite` (for automated QA/Testing), `GitHub`, `Puppeteer` (for browser testing), `Memory`, and `Sequential Thinking`.

## 🛑 Where We Stopped (The Current Problem)
The user halted development due to API quota limits and a critical bug in the Background Removal tool.
**The Bug:** `removeBackground is not a function`. 
The frontend integration for `remove-background` and `replace-background` is currently broken.

## 🎯 Your Immediate Tasks (Phase 3)
As the new lead AI Developer, use your Sequential Thinking and File System tools to execute the following:

1. **Fix Background Removal:**
   - Locate the background removal logic.
   - Fully implement it using the Hugging Face API (`briaai/RMBG-1.4` model) server-side to fix the `removeBackground is not a function` error.
   - The fix must apply to ALL site features, not just remove-background.

2. **Run QA via TestSprite MCP:**
   - Since I have provided you with the `TestSprite` MCP tool, use it to automatically generate unit tests or perform QA on the new API routes you fix.

3. **End-to-End Verification:**
   - Verify the end-to-end functionality of all 7 image generation tools.
   - Address any `onnxruntime-web` WASM dependency build warnings in Next.js to ensure full Vercel deployment readiness.

## 🚨 Rules for the AI
- **No Placeholders:** Write complete, production-ready code.
- **Tools at your disposal:** Remember you have Memory, Puppeteer, TestSprite, and GitHub MCPs. Use them! For example, use Puppeteer to visually verify the dashboard if needed.
- **Aesthetics Matter:** Ensure the UI remains premium, dynamic, and modern. No generic designs.
