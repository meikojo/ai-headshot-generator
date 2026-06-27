# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\replace-background.spec.ts >> Replace Background Tool >> Successful replacement increments the usage tracking count for the user
- Location: e2e\tier1\replace-background.spec.ts:47:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/replace-background
Call log:
  - navigating to "http://localhost:3000/tools/replace-background", waiting until "load"

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
  9  | test.describe('Replace Background Tool', () => {
  10 |   test('User can navigate to /tools/replace-background and see the standard tool layout', async ({ page }) => {
  11 |     await page.goto('/tools/replace-background');
  12 |     await expect(page.getByTestId('upload-zone')).toBeVisible();
  13 |     await expect(page.getByTestId('result-zone')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('User can upload a source image and provide a text prompt describing the new background', async ({ page }) => {
  17 |     await page.goto('/tools/replace-background');
  18 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  19 |     
  20 |     const promptInput = page.getByRole('textbox', { name: 'Prompt' });
  21 |     await expect(promptInput).toBeVisible();
  22 |     await promptInput.fill('A sunny beach');
  23 |     await expect(promptInput).toHaveValue('A sunny beach');
  24 |   });
  25 | 
  26 |   test('The submission successfully calls the Replace Background server-side API', async ({ page }) => {
  27 |     await page.goto('/tools/replace-background');
  28 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  29 |     await page.getByRole('textbox', { name: 'Prompt' }).fill('A sunny beach');
  30 |     
  31 |     const apiRequestPromise = page.waitForRequest(request => 
  32 |       request.url().includes('/api/replace-background') && request.method() === 'POST'
  33 |     );
  34 |     await page.getByRole('button', { name: 'Generate' }).click();
  35 |     await apiRequestPromise;
  36 |   });
  37 | 
  38 |   test('The new image with the requested background is displayed in the result area', async ({ page }) => {
  39 |     await page.goto('/tools/replace-background');
  40 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  41 |     await page.getByRole('textbox', { name: 'Prompt' }).fill('A sunny beach');
  42 |     await page.getByRole('button', { name: 'Generate' }).click();
  43 |     
  44 |     await expect(page.getByTestId('result-image')).toBeVisible();
  45 |   });
  46 | 
  47 |   test('Successful replacement increments the usage tracking count for the user', async ({ page }) => {
> 48 |     await page.goto('/tools/replace-background');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/replace-background
  49 |     await page.getByTestId('upload-zone').setInputFiles(dummyImage);
  50 |     await page.getByRole('textbox', { name: 'Prompt' }).fill('A sunny beach');
  51 |     
  52 |     const incrementRequestPromise = page.waitForRequest(request => 
  53 |       request.url().includes('/api/increment-usage') && request.method() === 'POST'
  54 |     );
  55 |     await page.getByRole('button', { name: 'Generate' }).click();
  56 |     await incrementRequestPromise;
  57 |     
  58 |     await page.goto('/');
  59 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  60 |   });
  61 | });
  62 | 
```