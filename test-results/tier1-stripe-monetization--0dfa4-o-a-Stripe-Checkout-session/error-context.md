# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\stripe-monetization.spec.ts >> Stripe Monetization & Webhook >> Clicking the "Pay-Per-Use" button redirects the user to a Stripe Checkout session
- Location: e2e\tier1\stripe-monetization.spec.ts:21:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/remove-background
Call log:
  - navigating to "http://localhost:3000/tools/remove-background", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect, Page } from '@playwright/test';
  2  | 
  3  | const dummyImage = {
  4  |   name: 'test.png',
  5  |   mimeType: 'image/png',
  6  |   buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
  7  | };
  8  | 
  9  | test.describe('Stripe Monetization & Webhook', () => {
  10 |   // Use a helper to exhaust free uses before some tests
  11 |   const exhaustFreeUses = async (page: Page) => {
> 12 |     await page.goto('/tools/remove-background');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/remove-background
  13 |     for (let i = 0; i < 3; i++) {
  14 |       await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  15 |       await expect(page.getByTestId('result-image')).toBeVisible();
  16 |     }
  17 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  18 |     await expect(page.getByTestId('paywall-modal')).toBeVisible();
  19 |   };
  20 | 
  21 |   test('Clicking the "Pay-Per-Use" button redirects the user to a Stripe Checkout session', async ({ page }) => {
  22 |     await exhaustFreeUses(page);
  23 |     
  24 |     // We can intercept the navigation to stripe to avoid actually leaving the test domain
  25 |     await page.route('**/*stripe.com/**', route => route.fulfill({ status: 200, body: 'Stripe Mock' }));
  26 |     
  27 |     const checkoutPromise = page.waitForNavigation({ url: /.*stripe\.com.*/ });
  28 |     await page.getByTestId('paywall-modal').getByRole('button', { name: 'Pay-Per-Use' }).click();
  29 |     await checkoutPromise;
  30 |   });
  31 | 
  32 |   test('Clicking the "Unlimited" button redirects the user to a Stripe Subscription session', async ({ page }) => {
  33 |     await exhaustFreeUses(page);
  34 |     
  35 |     await page.route('**/*stripe.com/**', route => route.fulfill({ status: 200, body: 'Stripe Mock' }));
  36 |     
  37 |     const subscriptionPromise = page.waitForNavigation({ url: /.*stripe\.com.*/ });
  38 |     await page.getByTestId('paywall-modal').getByRole('button', { name: 'Unlimited' }).click();
  39 |     await subscriptionPromise;
  40 |   });
  41 | 
  42 |   test('A successful payment webhook payload to /api/webhook updates the Supabase user record to is_paid=true', async ({ request }) => {
  43 |     // We send a direct mock webhook request
  44 |     const response = await request.post('/api/webhook', {
  45 |       data: {
  46 |         type: 'checkout.session.completed',
  47 |         data: {
  48 |           object: {
  49 |             client_reference_id: 'mock-user-id',
  50 |             payment_status: 'paid'
  51 |           }
  52 |         }
  53 |       },
  54 |       headers: {
  55 |         'Stripe-Signature': 'mock-signature'
  56 |       }
  57 |     });
  58 |     
  59 |     expect(response.ok()).toBeTruthy();
  60 |     // In a real test, we might verify via a database query or an admin API that the user record updated.
  61 |   });
  62 | 
  63 |   test('A paid user (with is_paid=true) returning to the app no longer sees the free usage badge', async ({ page }) => {
  64 |     // Assuming we can mock authentication as a paid user via a cookie or mock API
  65 |     await page.route('/api/user', route => route.fulfill({
  66 |       status: 200,
  67 |       json: { id: 'user-1', is_paid: true }
  68 |     }));
  69 |     
  70 |     await page.goto('/');
  71 |     await expect(page.getByTestId('free-uses-remaining')).toBeHidden();
  72 |   });
  73 | 
  74 |   test('A paid user is not shown the paywall and has continuous, uninterrupted access to all tools', async ({ page }) => {
  75 |     await page.route('/api/user', route => route.fulfill({
  76 |       status: 200,
  77 |       json: { id: 'user-1', is_paid: true }
  78 |     }));
  79 |     
  80 |     await page.goto('/tools/remove-background');
  81 |     for (let i = 0; i < 5; i++) {
  82 |       await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  83 |       await expect(page.getByTestId('result-image')).toBeVisible();
  84 |     }
  85 |     
  86 |     await expect(page.getByTestId('paywall-modal')).toBeHidden();
  87 |   });
  88 | });
  89 | 
```