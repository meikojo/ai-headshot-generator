## Consensus
Both Explorers found severe architectural deviations between requirements and the current implementation:
1. Only `/generate` and `/remove-bg` exist; the other 5 tools are missing.
2. Freemium tracking uses `localStorage` instead of Supabase IP & fingerprinting.
3. No frontend authentication exists to link Stripe payments (via webhook) back to a returning user session.
4. Selectors must rely on text (e.g., `"Out of Free Generations"`) and basic elements (`input[type="file"]`) as no `data-testid`s are present.

Despite these flaws, tests must be "opaque-box and requirement-driven". Tests will simulate expected behavior and will correctly fail where the app falls short.

## Implementation Plan for Worker
Create the Playwright tests inside `d:/ai-headshot-generator/e2e/tier4/real-world.spec.ts`.

### Setup & Tools
- **Mocking External APIs**: Intercept `**/api/generate` to return mock success data (`{ resultUrl: 'fake.jpg', id: '1' }`) so tests don't consume real Replicate API credits.
- **Stripe/Webhooks**: To simulate Stripe payments without flaky external UI navigation, intercept `**/api/credits/checkout` and then either trigger a mock Stripe webhook via Playwright `request.post` or mutate the `user_credits` table directly using `@supabase/supabase-js`.
- **Incognito/IP Simulation**: Use `browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': '<mock-ip>' } })` to test IP-based tracking.

### Scenarios
1. **Normal Free User exhausts quota**: Context 1. Upload mock image 3 times. On the 4th, assert the `"Out of Free Generations"` paywall appears.
2. **Free User upgrades to Paid**: At the paywall, click to upgrade. Intercept the checkout route. Simulate a successful payment webhook/DB update. Assert the 4th generation now succeeds.
3. **Incognito browser bypasses limit**: Create a second Playwright context with a different `x-forwarded-for` IP. Verify it gets 3 fresh free uses.
4. **Existing Paid User accesses all tools**: Seed DB with a paid user state. Loop over the 7 required tool routes. For each, assert that an image can be uploaded and generated without a paywall.
5. **Failed payment keeps user on free tier**: Exhaust quota, trigger upgrade flow, but do not simulate the webhook (abort). Assert the 4th attempt remains blocked.

### Caveats
Many of these tests will fail (e.g., Scenario 4 due to 404s, Scenario 2 due to missing auth). This is the CORRECT outcome for requirement-driven testing. Write the tests to verify the *required* behavior.
