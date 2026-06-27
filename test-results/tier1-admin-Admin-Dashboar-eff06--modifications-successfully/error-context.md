# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\admin.spec.ts >> Admin Dashboard UI Expansion >> allows admin login, displays new fields, and saves modifications successfully
- Location: e2e\tier1\admin.spec.ts:4:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin
Call log:
  - navigating to "http://localhost:3000/admin", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Dashboard UI Expansion', () => {
  4  |   test('allows admin login, displays new fields, and saves modifications successfully', async ({ page }) => {
  5  |     test.setTimeout(90000);
  6  | 
  7  |     // Listen to console and page errors
  8  |     page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  9  |     page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  10 | 
  11 |     // 1. Go to the Admin page
> 12 |     await page.goto('/admin');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin
  13 | 
  14 |     try {
  15 |       // 2. Log in with the admin password
  16 |       const passwordInput = page.locator('input[type="password"]');
  17 |       await expect(passwordInput).toBeVisible();
  18 |       await passwordInput.fill('123456');
  19 | 
  20 |       const unlockButton = page.getByRole('button', { name: /unlock dashboard/i });
  21 |       await unlockButton.click();
  22 | 
  23 |       // 3. Verify we have entered the dashboard
  24 |       await expect(page.locator('h1', { hasText: 'System Control' })).toBeVisible();
  25 | 
  26 |       // 4. Verify all 6 new fields are rendered and visible
  27 |       const rateLimitInput = page.locator('input[placeholder="e.g. 10"]');
  28 |       const stepsInput = page.locator('input[placeholder="e.g. 20"]');
  29 |       const cfgInput = page.locator('input[placeholder="e.g. 7.5"]');
  30 |       const widthInput = page.locator('input[placeholder="e.g. 1024"]').first();
  31 |       const heightInput = page.locator('input[placeholder="e.g. 1024"]').nth(1);
  32 |       const negativePromptInput = page.locator('input[placeholder="e.g. blurry, low quality"]');
  33 | 
  34 |       await expect(rateLimitInput).toBeVisible();
  35 |       await expect(stepsInput).toBeVisible();
  36 |       await expect(cfgInput).toBeVisible();
  37 |       await expect(widthInput).toBeVisible();
  38 |       await expect(heightInput).toBeVisible();
  39 |       await expect(negativePromptInput).toBeVisible();
  40 | 
  41 |       // 5. Fill new values into the settings fields
  42 |       const testRateLimit = '15';
  43 |       const testSteps = '42';
  44 |       const testCfg = '8.5';
  45 |       const testWidth = '800';
  46 |       const testHeight = '600';
  47 |       const testNegativePrompt = 'ugly, distorted, low resolution';
  48 | 
  49 |       await rateLimitInput.fill(testRateLimit);
  50 |       await stepsInput.fill(testSteps);
  51 |       await cfgInput.fill(testCfg);
  52 |       await widthInput.fill(testWidth);
  53 |       await heightInput.fill(testHeight);
  54 |       await negativePromptInput.fill(testNegativePrompt);
  55 | 
  56 |       // 6. Deploy changes
  57 |       const deployButton = page.getByRole('button', { name: /deploy changes/i });
  58 |       await deployButton.click();
  59 | 
  60 |       // 7. Verify success banner
  61 |       await expect(page.locator('text=Settings saved successfully!')).toBeVisible();
  62 | 
  63 |       // 8. Refresh the page to verify the data is retrieved correctly and persists
  64 |       await page.reload();
  65 | 
  66 |       // Re-login
  67 |       await page.locator('input[type="password"]').fill('123456');
  68 |       await page.getByRole('button', { name: /unlock dashboard/i }).click();
  69 | 
  70 |       // Verify fields contain the saved values
  71 |       await expect(rateLimitInput).toHaveValue(testRateLimit);
  72 |       await expect(stepsInput).toHaveValue(testSteps);
  73 |       await expect(cfgInput).toHaveValue(testCfg);
  74 |       await expect(widthInput).toHaveValue(testWidth);
  75 |       await expect(heightInput).toHaveValue(testHeight);
  76 |       await expect(negativePromptInput).toHaveValue(testNegativePrompt);
  77 |     } catch (err) {
  78 |       console.log('=== PAGE HTML ON ERROR ===');
  79 |       console.log(await page.content());
  80 |       console.log('==========================');
  81 |       throw err;
  82 |     }
  83 |   });
  84 | });
  85 | 
```