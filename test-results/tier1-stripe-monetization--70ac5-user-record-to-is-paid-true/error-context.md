# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\stripe-monetization.spec.ts >> Stripe Monetization & Webhook >> A successful payment webhook payload to /api/webhook updates the Supabase user record to is_paid=true
- Location: e2e\tier1\stripe-monetization.spec.ts:42:7

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/api/webhook
    - user-agent: Playwright/1.61.0 (x64; windows 10.0) node/24.15
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Stripe-Signature: mock-signature
    - content-type: application/json
    - content-length: 118

```