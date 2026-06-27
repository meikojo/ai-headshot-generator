# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\text-to-image.spec.ts >> Text to Image Tool >> The generated image is displayed in the result area
- Location: e2e\tier1\text-to-image.spec.ts:30:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/text-to-image
Call log:
  - navigating to "http://localhost:3000/tools/text-to-image", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Text to Image Tool', () => {
  4  |   test('The /tools/text-to-image page loads with a text input prompt area instead of an image upload area', async ({ page }) => {
  5  |     await page.goto('/tools/text-to-image');
  6  |     await expect(page.getByTestId('upload-zone')).toBeHidden();
  7  |     const promptInput = page.getByRole('textbox', { name: 'Prompt' });
  8  |     await expect(promptInput).toBeVisible();
  9  |   });
  10 | 
  11 |   test('Submitting a text prompt (e.g., "A futuristic city skyline") initiates image generation', async ({ page }) => {
  12 |     await page.goto('/tools/text-to-image');
  13 |     await page.getByRole('textbox', { name: 'Prompt' }).fill('A futuristic city skyline');
  14 |     
  15 |     const apiRequestPromise = page.waitForRequest(request => 
  16 |       request.url().includes('/api/text-to-image') && request.method() === 'POST'
  17 |     );
  18 |     await page.getByRole('button', { name: 'Generate' }).click();
  19 |     await apiRequestPromise;
  20 |   });
  21 | 
  22 |   test('Loading indicators are shown during the generation process', async ({ page }) => {
  23 |     await page.goto('/tools/text-to-image');
  24 |     await page.getByRole('textbox', { name: 'Prompt' }).fill('A futuristic city skyline');
  25 |     await page.getByRole('button', { name: 'Generate' }).click();
  26 |     
  27 |     await expect(page.getByTestId('loading-indicator')).toBeVisible();
  28 |   });
  29 | 
  30 |   test('The generated image is displayed in the result area', async ({ page }) => {
> 31 |     await page.goto('/tools/text-to-image');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tools/text-to-image
  32 |     await page.getByRole('textbox', { name: 'Prompt' }).fill('A futuristic city skyline');
  33 |     await page.getByRole('button', { name: 'Generate' }).click();
  34 |     
  35 |     await expect(page.getByTestId('result-image')).toBeVisible();
  36 |   });
  37 | 
  38 |   test('Free usage limit is properly updated via /api/increment-usage after generation', async ({ page }) => {
  39 |     await page.goto('/tools/text-to-image');
  40 |     await page.getByRole('textbox', { name: 'Prompt' }).fill('A futuristic city skyline');
  41 |     
  42 |     const incrementRequestPromise = page.waitForRequest(request => 
  43 |       request.url().includes('/api/increment-usage') && request.method() === 'POST'
  44 |     );
  45 |     await page.getByRole('button', { name: 'Generate' }).click();
  46 |     await incrementRequestPromise;
  47 |     
  48 |     await page.goto('/');
  49 |     await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  50 |   });
  51 | });
  52 | 
```