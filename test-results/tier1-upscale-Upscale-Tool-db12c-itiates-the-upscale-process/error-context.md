# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\upscale.spec.ts >> Upscale Tool >> Uploading a low-resolution image initiates the upscale process
- Location: e2e\tier1\upscale.spec.ts:16:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/upscale
Call log:
  - navigating to "http://localhost:3000/tools/upscale", waiting until "load"

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
  9  | test.describe('Upscale Tool', () => {
  10 |   test('User accesses /tools/upscale and the upload zone is visible and functional', async ({ page }) => {
  11 |     await page.goto('/tools/upscale');
  12 |     await expect(page.getByTestId('upload-zone')).toBeVisible();
  13 |     await expect(page.getByTestId('upload-zone')).toBeEnabled();
  14 |   });
  15 | 
  16 |   test('Uploading a low-resolution image initiates the upscale process', async ({ page }) => {
> 17 |     await page.goto('/tools/upscale');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/upscale
  18 |     
  19 |     const apiRequestPromise = page.waitForRequest(request => 
  20 |       request.url().includes('/api/upscale') && request.method() === 'POST'
  21 |     );
  22 |     
  23 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  24 |     await apiRequestPromise;
  25 |   });
  26 | 
  27 |   test('The upscaled, high-resolution result is displayed correctly in the results pane', async ({ page }) => {
  28 |     await page.goto('/tools/upscale');
  29 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  30 |     
  31 |     await expect(page.getByTestId('result-image')).toBeVisible();
  32 |   });
  33 | 
  34 |   test('The user is able to trigger a download of the upscaled image', async ({ page }) => {
  35 |     await page.goto('/tools/upscale');
  36 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  37 |     
  38 |     await expect(page.getByTestId('result-image')).toBeVisible();
  39 |     
  40 |     const downloadPromise = page.waitForEvent('download');
  41 |     await page.getByRole('button', { name: 'Download' }).click();
  42 |     const download = await downloadPromise;
  43 |     expect(download.suggestedFilename()).toContain('.png');
  44 |   });
  45 | 
  46 |   test('Usage count is correctly decremented after a successful upscale operation', async ({ page }) => {
  47 |     await page.goto('/tools/upscale');
  48 |     
  49 |     const incrementRequestPromise = page.waitForRequest(request => 
  50 |       request.url().includes('/api/increment-usage') && request.method() === 'POST'
  51 |     );
  52 |     
  53 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  54 |     await incrementRequestPromise;
  55 |     
  56 |     await page.goto('/');
  57 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  58 |   });
  59 | });
  60 | 
```