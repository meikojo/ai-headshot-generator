# Tier 4 E2E Test Implementation Strategy

## 1. Observation
- The frontend tracks free generation limits in `localStorage` (`headshot_count`). It does **not** rely on IP tracking or Canvas Fingerprinting in the frontend for limits.
- When `headshot_count >= 3`, a `PaywallModal` is shown.
- There is no frontend user authentication (no login/signup). Stripe checkout captures an email, and the webhook (`/api/webhook`) credits the email in `user_credits` table, but the frontend has no way to resume a session as a "paid user".
- The `/remove-bg` tool processes images entirely client-side without any paywall or usage limit check.

## 2. Logic Chain

### Proposed Test Implementation Strategy:
1. **Normal Free User exhausts quota**:
   - Navigate to `/generate`.
   - Upload an image (e.g., via a dummy base64 file).
   - Click the "Generate Now (1 Credit)" button 3 times. Verify `headshot_count` increments in `localStorage`.
   - On the 4th attempt, verify the `PaywallModal` appears with the text "Out of Free Generations".
2. **Free User upgrades to Paid and uses tools indefinitely**:
   - **BLOCKED**. The current frontend lacks an authentication mechanism to sign in as a paid user and bypass the `localStorage` check. We can simulate the Stripe Checkout redirect, but we cannot test post-upgrade indefinite usage.
3. **Incognito browser bypasses limit**:
   - Create a new Playwright `BrowserContext` (which acts as incognito).
   - Navigate to `/generate`.
   - Verify `localStorage` is empty and the user can generate 3 new headshots without the paywall.
4. **Existing Paid User accesses all tools**:
   - **BLOCKED**. Same reason as #2. No frontend mechanism to authenticate as a paid user.
5. **Failed payment keeps user on free tier**:
   - Can be simulated by interacting with the `PaywallModal`, clicking "Starter" or "Pro", intercepting the `/api/credits/checkout` request, and returning to the app without a successful webhook trigger. 

## 3. Caveats
- **Significant Implementation Gap**: The application frontend uses `localStorage` for the free tier limit and completely lacks user session management (authentication/login). Because of this, it is fundamentally impossible to test scenarios where a user pays and successfully returns to use paid tools indefinitely.
- **Database Mismatch**: The project requirements mention a `usage_tracking` table, but the actual implementation uses a `user_credits` table (tracked by `email`).
- **Missing Features**: Tools like Cleanup, Replace Background, Reimagine, Upscale, Uncrop, and Text to Image do not appear to have routes or implementations yet.
- **Note on Code Volatility**: During investigation, the `src/components` and tool routes appeared to be in a state of flux (potentially deleted or being rebuilt by the main agent). The selectors are based on the codebase at the time of initial read.

## 4. Conclusion
We can only write meaningful end-to-end tests for the "Normal Free User exhausts quota" and "Incognito browser bypasses limit" scenarios. The Worker agent should implement these using Playwright's `localStorage` tracking and `BrowserContext` isolation. For paid scenarios, the tests must be deferred or marked as `.skip` until the frontend implements proper session/auth management to link a browser session to the `user_credits` table.

## 5. Verification Method
- Run `npx playwright test e2e/tier4` to verify the implemented free-tier and incognito tests pass.
- Inspect `src/app/generate/page.tsx` to confirm `localStorage.getItem('headshot_count')` is the only limit check.
- Inspect `src/components/Header.tsx` to confirm no user login/session state exists.
