# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\07-share.spec.ts >> Share/Copy Tweet Button >> Visual confirmation ("Copied!") appears temporarily
- Location: e2e\tier1\07-share.spec.ts:33:7

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
  3  | test.use({ permissions: ['clipboard-read', 'clipboard-write'] });
  4  | 
  5  | test.describe('Share/Copy Tweet Button', () => {
  6  |   test.beforeEach(async ({ page }) => {
> 7  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  8  |     await page.route('**/api/generate', async route => {
  9  |       await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'https://mock.com/img.png' } });
  10 |     });
  11 |   });
  12 | 
  13 |   test('"Share on X" opens correct Twitter intent URL', async ({ page, context }) => {
  14 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  15 |     await page.getByRole('button', { name: /generate/i }).click();
  16 |     
  17 |     const [newPage] = await Promise.all([
  18 |       context.waitForEvent('page'),
  19 |       page.getByRole('link', { name: /share on x/i }).click()
  20 |     ]);
  21 |     expect(newPage.url()).toContain('twitter.com/intent/tweet');
  22 |   });
  23 | 
  24 |   test('"Copy Link" copies shareable URL to clipboard', async ({ page }) => {
  25 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  26 |     await page.getByRole('button', { name: /generate/i }).click();
  27 |     
  28 |     await page.getByRole('button', { name: /copy link/i }).click();
  29 |     const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  30 |     expect(clipboardText).toContain(page.url());
  31 |   });
  32 | 
  33 |   test('Visual confirmation ("Copied!") appears temporarily', async ({ page }) => {
  34 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  35 |     await page.getByRole('button', { name: /generate/i }).click();
  36 |     
  37 |     await page.getByRole('button', { name: /copy link/i }).click();
  38 |     await expect(page.getByText('Copied!')).toBeVisible();
  39 |     await expect(page.getByText('Copied!')).toBeHidden({ timeout: 5000 });
  40 |   });
  41 | 
  42 |   test('Share/Copy buttons are hidden before generation', async ({ page }) => {
  43 |     await expect(page.getByRole('link', { name: /share on x/i })).toBeHidden();
  44 |     await expect(page.getByRole('button', { name: /copy link/i })).toBeHidden();
  45 |   });
  46 | 
  47 |   test('Share buttons have accessible labels', async ({ page }) => {
  48 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  49 |     await page.getByRole('button', { name: /generate/i }).click();
  50 |     
  51 |     await expect(page.getByRole('link', { name: /share on x/i })).toHaveAttribute('aria-label', /share/i);
  52 |   });
  53 | });
  54 | 
```