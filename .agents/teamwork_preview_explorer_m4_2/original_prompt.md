## 2026-06-23T01:30:58Z

Your working directory is d:/ai-headshot-generator/.agents/teamwork_preview_explorer_m4_2/.
Read d:/ai-headshot-generator/TEST_INFRA.md and d:/ai-headshot-generator/.agents/e2e_orch/SCOPE.md.
Your task is to design exactly 8 Tier 3 Playwright test cases that cover pairwise combinations of major features as per the E2E methodology.
Major features:
1. File Upload & Preview
2. AI Generation & Loading
3. Freemium Count Tracking
4. Paywall Modal & UI
5. Stripe Checkout & Webhook
6. Download & Watermark
7. Share/Copy Tweet Button
8. UI Layout (Hero, FAQ)

Select exactly 8 pairwise combinations that interact meaningfully (e.g. Upload + Freemium gate, Generation + Watermark, Stripe Checkout + Download without watermark).
For each test case:
- Define the test name
- State the 2 features being combined
- Provide a step-by-step opaque-box execution flow
- Define what external dependencies to mock using `page.route` (e.g., Stripe API, AI generation endpoints).

Do not implement the code. Write your final design report to `handoff.md` in your working directory and notify me when done.
