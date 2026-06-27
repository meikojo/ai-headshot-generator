# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\cleanup.spec.ts >> Cleanup Tool >> Uploading an image and selecting an area to mask starts the cleanup process
- Location: e2e\tier1\cleanup.spec.ts:16:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/cleanup
Call log:
  - navigating to "http://localhost:3000/tools/cleanup", waiting until "load"

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
  9  | test.describe('Cleanup Tool', () => {
  10 |   test('User can navigate to /tools/cleanup and view the 40% upload zone / 60% result display layout', async ({ page }) => {
  11 |     await page.goto('/tools/cleanup');
  12 |     await expect(page.getByTestId('upload-zone')).toBeVisible();
  13 |     await expect(page.getByTestId('result-zone')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('Uploading an image and selecting an area to mask starts the cleanup process', async ({ page }) => {
> 17 |     await page.goto('/tools/cleanup');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/cleanup
  18 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  19 |     
  20 |     // Simulate masking (e.g., clicking on a canvas)
  21 |     await page.getByTestId('image-canvas').click({ position: { x: 50, y: 50 } });
  22 |     
  23 |     const apiRequestPromise = page.waitForRequest(request => 
  24 |       request.url().includes('/api/cleanup') && request.method() === 'POST'
  25 |     );
  26 |     await page.getByRole('button', { name: 'Clean up' }).click();
  27 |     await apiRequestPromise;
  28 |   });
  29 | 
  30 |   test('The tool gracefully handles the server response and displays the cleaned-up image', async ({ page }) => {
  31 |     await page.goto('/tools/cleanup');
  32 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  33 |     await page.getByTestId('image-canvas').click({ position: { x: 50, y: 50 } });
  34 |     await page.getByRole('button', { name: 'Clean up' }).click();
  35 |     
  36 |     await expect(page.getByTestId('result-image')).toBeVisible();
  37 |   });
  38 | 
  39 |   test('The user can download the resulting cleaned image to their local device', async ({ page }) => {
  40 |     await page.goto('/tools/cleanup');
  41 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  42 |     await page.getByTestId('image-canvas').click({ position: { x: 50, y: 50 } });
  43 |     await page.getByRole('button', { name: 'Clean up' }).click();
  44 |     
  45 |     await expect(page.getByTestId('result-image')).toBeVisible();
  46 |     
  47 |     const downloadPromise = page.waitForEvent('download');
  48 |     await page.getByRole('button', { name: 'Download' }).click();
  49 |     const download = await downloadPromise;
  50 |     expect(download.suggestedFilename()).toContain('.png');
  51 |   });
  52 | 
  53 |   test('A successful cleanup operation reduces the available free usage quota by 1', async ({ page }) => {
  54 |     await page.goto('/tools/cleanup');
  55 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  56 |     await page.getByTestId('image-canvas').click({ position: { x: 50, y: 50 } });
  57 |     
  58 |     const incrementRequestPromise = page.waitForRequest(request => 
  59 |       request.url().includes('/api/increment-usage') && request.method() === 'POST'
  60 |     );
  61 |     await page.getByRole('button', { name: 'Clean up' }).click();
  62 |     await incrementRequestPromise;
  63 |     
  64 |     await page.goto('/');
  65 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  66 |   });
  67 | });
  68 | 
```