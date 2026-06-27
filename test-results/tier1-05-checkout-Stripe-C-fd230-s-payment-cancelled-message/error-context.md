# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\05-checkout.spec.ts >> Stripe Checkout & Webhook Mock >> Mock cancel redirect displays payment cancelled message
- Location: e2e\tier1\05-checkout.spec.ts:44:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Stripe Checkout & Webhook Mock', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  6  |     await page.evaluate(() => localStorage.setItem('credits', '0'));
  7  |     await page.reload();
  8  |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  9  |     await page.getByRole('button', { name: /generate/i }).click();
  10 |   });
  11 | 
  12 |   test('Clicking "Upgrade" triggers mock checkout (intercepted)', async ({ page }) => {
  13 |     await page.route('**/api/checkout', async route => {
  14 |       await route.fulfill({ status: 200, json: { url: '/success' } });
  15 |     });
  16 |     const upgradeBtn = page.getByRole('dialog').getByRole('button', { name: /upgrade/i });
  17 |     await upgradeBtn.click();
  18 |     await expect(page).toHaveURL(/\/success/);
  19 |   });
  20 | 
  21 |   test('Mock success redirect displays payment success message', async ({ page }) => {
  22 |     await page.goto('/success');
  23 |     await expect(page.getByText(/payment successful/i)).toBeVisible();
  24 |   });
  25 | 
  26 |   test('Mock success updates user to "Premium" status', async ({ page }) => {
  27 |     await page.goto('/success');
  28 |     await page.goto('/');
  29 |     await expect(page.getByText(/premium user/i)).toBeVisible();
  30 |   });
  31 | 
  32 |   test('"Premium" user bypasses paywall on generation', async ({ page }) => {
  33 |     await page.evaluate(() => localStorage.setItem('isPremium', 'true'));
  34 |     await page.reload();
  35 |     await page.route('**/api/generate', async route => {
  36 |       await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'mock.png' } });
  37 |     });
  38 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  39 |     await page.getByRole('button', { name: /generate/i }).click();
  40 |     await expect(page.getByRole('dialog')).toBeHidden();
  41 |     await expect(page.getByRole('img', { name: /generated/i })).toBeVisible();
  42 |   });
  43 | 
  44 |   test('Mock cancel redirect displays payment cancelled message', async ({ page }) => {
  45 |     await page.goto('/cancel');
  46 |     await expect(page.getByText(/payment cancelled/i)).toBeVisible();
  47 |   });
  48 | });
  49 | 
```