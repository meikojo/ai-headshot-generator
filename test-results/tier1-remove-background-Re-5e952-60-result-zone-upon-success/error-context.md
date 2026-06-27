# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\remove-background.spec.ts >> Remove Background Tool >> The image with the removed background is rendered in the 60% result zone upon success
- Location: e2e\tier1\remove-background.spec.ts:33:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/remove-background
Call log:
  - navigating to "http://localhost:3000/tools/remove-background", waiting until "load"

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
  9  | test.describe('Remove Background Tool', () => {
  10 |   test('User can successfully navigate to /tools/remove-background and view the upload/result layout', async ({ page }) => {
  11 |     await page.goto('/tools/remove-background');
  12 |     await expect(page.getByTestId('upload-zone')).toBeVisible();
  13 |     await expect(page.getByTestId('result-zone')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('Uploading a valid PNG image successfully triggers the background removal API call', async ({ page }) => {
  17 |     await page.goto('/tools/remove-background');
  18 |     
  19 |     const apiRequestPromise = page.waitForRequest(request => 
  20 |       request.url().includes('/api/remove-background') && request.method() === 'POST'
  21 |     );
  22 |     
  23 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  24 |     await apiRequestPromise;
  25 |   });
  26 | 
  27 |   test('The UI displays a clear loading indicator while waiting for the server-side response', async ({ page }) => {
  28 |     await page.goto('/tools/remove-background');
  29 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  30 |     await expect(page.getByTestId('loading-indicator')).toBeVisible();
  31 |   });
  32 | 
  33 |   test('The image with the removed background is rendered in the 60% result zone upon success', async ({ page }) => {
> 34 |     await page.goto('/tools/remove-background');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/remove-background
  35 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  36 |     const resultImage = page.getByTestId('result-image');
  37 |     await expect(resultImage).toBeVisible();
  38 |     
  39 |     // Check if it's within the result zone
  40 |     const resultZone = page.getByTestId('result-zone');
  41 |     await expect(resultZone).toContainText(''); // Result zone contains the image
  42 |   });
  43 | 
  44 |   test('Successfully processing an image calls /api/increment-usage and updates the remaining uses', async ({ page }) => {
  45 |     await page.goto('/tools/remove-background');
  46 |     
  47 |     const incrementRequestPromise = page.waitForRequest(request => 
  48 |       request.url().includes('/api/increment-usage') && request.method() === 'POST'
  49 |     );
  50 |     
  51 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  52 |     await incrementRequestPromise;
  53 |     
  54 |     await page.goto('/');
  55 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  56 |   });
  57 | });
  58 | 
```