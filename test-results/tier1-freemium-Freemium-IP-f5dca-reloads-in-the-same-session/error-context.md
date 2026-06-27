# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\freemium.spec.ts >> Freemium IP & Fingerprinting >> A user's fingerprint remains consistent across multiple browser page reloads in the same session
- Location: e2e\tier1\freemium.spec.ts:15:7

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
  3  | const dummyImage = {
  4  |   name: 'test.png',
  5  |   mimeType: 'image/png',
  6  |   buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
  7  | };
  8  | 
  9  | test.describe('Freemium IP & Fingerprinting', () => {
  10 |   test('A new user with a fresh IP and fingerprint is granted exactly 3 free uses', async ({ page }) => {
  11 |     await page.goto('/');
  12 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('3');
  13 |   });
  14 | 
  15 |   test('A user\'s fingerprint remains consistent across multiple browser page reloads in the same session', async ({ page }) => {
> 16 |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  17 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('3');
  18 |     await page.reload();
  19 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('3');
  20 |   });
  21 | 
  22 |   test('Submitting 1 successful tool usage reduces the remaining quota to 2 via /api/check-limit', async ({ page }) => {
  23 |     await page.goto('/tools/remove-background');
  24 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  25 |     await expect(page.getByTestId('result-image')).toBeVisible();
  26 |     await page.goto('/');
  27 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  28 |   });
  29 | 
  30 |   test('Submitting 2 successful tool usages reduces the remaining quota to 1 via /api/check-limit', async ({ page }) => {
  31 |     await page.goto('/tools/remove-background');
  32 |     
  33 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  34 |     await expect(page.getByTestId('result-image')).toBeVisible();
  35 |     
  36 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  37 |     await expect(page.getByTestId('result-image')).toBeVisible();
  38 | 
  39 |     await page.goto('/');
  40 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('1');
  41 |   });
  42 | 
  43 |   test('Upon the 3rd usage, the quota reaches 0, and a 4th request is strictly blocked server-side', async ({ page }) => {
  44 |     await page.goto('/tools/remove-background');
  45 |     
  46 |     for (let i = 0; i < 3; i++) {
  47 |       await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  48 |       await expect(page.getByTestId('result-image')).toBeVisible();
  49 |     }
  50 |     
  51 |     await page.goto('/');
  52 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('0');
  53 |     
  54 |     await page.goto('/tools/remove-background');
  55 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  56 |     await expect(page.getByTestId('paywall-modal')).toBeVisible();
  57 |   });
  58 | });
  59 | 
```