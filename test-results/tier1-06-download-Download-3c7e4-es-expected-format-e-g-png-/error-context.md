# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\06-download.spec.ts >> Download & Watermark >> Downloaded filename matches expected format (e.g. *.png)
- Location: e2e\tier1\06-download.spec.ts:25:7

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
  3  | test.describe('Download & Watermark', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  6  |     await page.route('**/api/generate', async route => {
  7  |       await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'https://mock.com/img.png' } });
  8  |     });
  9  |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  10 |     await page.getByRole('button', { name: /generate/i }).click();
  11 |   });
  12 | 
  13 |   test('Free users see a watermark on preview', async ({ page }) => {
  14 |     const watermark = page.getByTestId('watermark-overlay');
  15 |     await expect(watermark).toBeVisible();
  16 |   });
  17 | 
  18 |   test('"Download" button triggers file download (wait for download event)', async ({ page }) => {
  19 |     const downloadPromise = page.waitForEvent('download');
  20 |     await page.getByRole('button', { name: /download/i }).click();
  21 |     const download = await downloadPromise;
  22 |     expect(download).toBeTruthy();
  23 |   });
  24 | 
  25 |   test('Downloaded filename matches expected format (e.g. *.png)', async ({ page }) => {
  26 |     const downloadPromise = page.waitForEvent('download');
  27 |     await page.getByRole('button', { name: /download/i }).click();
  28 |     const download = await downloadPromise;
  29 |     expect(download.suggestedFilename()).toMatch(/\.png$/);
  30 |   });
  31 | 
  32 |   test('Premium users do not see a watermark', async ({ page }) => {
  33 |     await page.evaluate(() => localStorage.setItem('isPremium', 'true'));
  34 |     await page.reload();
  35 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  36 |     await page.getByRole('button', { name: /generate/i }).click();
  37 |     
  38 |     const watermark = page.getByTestId('watermark-overlay');
  39 |     await expect(watermark).toBeHidden();
  40 |   });
  41 | 
  42 |   test('Premium users can download without watermark constraints', async ({ page }) => {
  43 |     await page.evaluate(() => localStorage.setItem('isPremium', 'true'));
  44 |     await page.reload();
  45 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  46 |     await page.getByRole('button', { name: /generate/i }).click();
  47 |     
  48 |     const downloadPromise = page.waitForEvent('download');
  49 |     await page.getByRole('button', { name: /download/i }).click();
  50 |     const download = await downloadPromise;
  51 |     expect(download).toBeTruthy();
  52 |   });
  53 | });
  54 | 
```