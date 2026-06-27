# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\uncrop.spec.ts >> Uncrop Tool >> The expanded/uncropped image is returned and rendered in the result zone
- Location: e2e\tier1\uncrop.spec.ts:30:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/uncrop
Call log:
  - navigating to "http://localhost:3000/tools/uncrop", waiting until "load"

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
  9  | test.describe('Uncrop Tool', () => {
  10 |   test('Navigating to /tools/uncrop displays the consistent UI layout', async ({ page }) => {
  11 |     await page.goto('/tools/uncrop');
  12 |     await expect(page.getByTestId('upload-zone')).toBeVisible();
  13 |     await expect(page.getByTestId('result-zone')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('Uploading an image and specifying a target expansion/aspect ratio starts the uncrop process', async ({ page }) => {
  17 |     await page.goto('/tools/uncrop');
  18 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  19 |     
  20 |     // Select an aspect ratio or expansion size
  21 |     await page.getByRole('button', { name: 'Landscape (16:9)' }).click();
  22 |     
  23 |     const apiRequestPromise = page.waitForRequest(request => 
  24 |       request.url().includes('/api/uncrop') && request.method() === 'POST'
  25 |     );
  26 |     await page.getByRole('button', { name: 'Uncrop' }).click();
  27 |     await apiRequestPromise;
  28 |   });
  29 | 
  30 |   test('The expanded/uncropped image is returned and rendered in the result zone', async ({ page }) => {
> 31 |     await page.goto('/tools/uncrop');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/uncrop
  32 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  33 |     await page.getByRole('button', { name: 'Landscape (16:9)' }).click();
  34 |     await page.getByRole('button', { name: 'Uncrop' }).click();
  35 |     
  36 |     await expect(page.getByTestId('result-image')).toBeVisible();
  37 |   });
  38 | 
  39 |   test('The server-side API endpoint correctly forwards the request to Clipdrop and returns the data', async ({ page }) => {
  40 |     await page.goto('/tools/uncrop');
  41 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  42 |     await page.getByRole('button', { name: 'Landscape (16:9)' }).click();
  43 |     
  44 |     const responsePromise = page.waitForResponse(response => 
  45 |       response.url().includes('/api/uncrop') && response.status() === 200
  46 |     );
  47 |     await page.getByRole('button', { name: 'Uncrop' }).click();
  48 |     
  49 |     const response = await responsePromise;
  50 |     // Assuming our API returns JSON with an image URL or base64 data directly
  51 |     const contentType = response.headers()['content-type'];
  52 |     expect(contentType).toBeTruthy();
  53 |   });
  54 | 
  55 |   test('A successful uncrop operation deducts 1 from the user\'s free usage quota', async ({ page }) => {
  56 |     await page.goto('/tools/uncrop');
  57 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  58 |     await page.getByRole('button', { name: 'Landscape (16:9)' }).click();
  59 |     
  60 |     const incrementRequestPromise = page.waitForRequest(request => 
  61 |       request.url().includes('/api/increment-usage') && request.method() === 'POST'
  62 |     );
  63 |     await page.getByRole('button', { name: 'Uncrop' }).click();
  64 |     await incrementRequestPromise;
  65 |     
  66 |     await page.goto('/');
  67 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  68 |   });
  69 | });
  70 | 
```