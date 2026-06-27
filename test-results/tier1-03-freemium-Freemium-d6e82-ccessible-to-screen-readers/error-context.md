# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\03-freemium.spec.ts >> Freemium Count Tracking >> Freemium counter value is accessible to screen readers
- Location: e2e\tier1\03-freemium.spec.ts:48:7

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
  3  | test.describe('Freemium Count Tracking', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  6  |     await page.route('**/api/generate', async route => {
  7  |       await route.fulfill({
  8  |         status: 200,
  9  |         json: { status: 'succeeded', url: 'https://mock.replicate.com/image.png' }
  10 |       });
  11 |     });
  12 |   });
  13 | 
  14 |   test('New user sees initial freemium count (e.g. 3 remaining)', async ({ page }) => {
  15 |     await expect(page.getByText(/3 credits remaining/i)).toBeVisible();
  16 |   });
  17 | 
  18 |   test('Successful generation decrements count by exactly 1', async ({ page }) => {
  19 |     await expect(page.getByText(/3 credits remaining/i)).toBeVisible();
  20 |     await page.locator('input[type="file"]').setInputFiles({
  21 |       name: 'test.jpg',
  22 |       mimeType: 'image/jpeg',
  23 |       buffer: Buffer.from('fake')
  24 |     });
  25 |     await page.getByRole('button', { name: /generate/i }).click();
  26 |     await expect(page.getByText(/2 credits remaining/i)).toBeVisible();
  27 |   });
  28 | 
  29 |   test('Count persists after page reload', async ({ page }) => {
  30 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  31 |     await page.getByRole('button', { name: /generate/i }).click();
  32 |     await expect(page.getByText(/2 credits remaining/i)).toBeVisible();
  33 |     
  34 |     await page.reload();
  35 |     await expect(page.getByText(/2 credits remaining/i)).toBeVisible();
  36 |   });
  37 | 
  38 |   test('Reaching 0 credits updates UI to indicate limit reached', async ({ page }) => {
  39 |     // We can simulate reaching 0 by looping 3 times
  40 |     for (let i = 0; i < 3; i++) {
  41 |       await page.locator('input[type="file"]').setInputFiles({ name: `test${i}.jpg`, mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  42 |       await page.getByRole('button', { name: /generate/i }).click();
  43 |     }
  44 |     await expect(page.getByText(/0 credits remaining/i)).toBeVisible();
  45 |     await expect(page.getByText(/limit reached/i)).toBeVisible();
  46 |   });
  47 | 
  48 |   test('Freemium counter value is accessible to screen readers', async ({ page }) => {
  49 |     const counter = page.getByLabel(/credits remaining/i);
  50 |     await expect(counter).toBeVisible();
  51 |   });
  52 | });
  53 | 
```