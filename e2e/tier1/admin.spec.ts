import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard UI Expansion', () => {
  test('allows admin login, displays new fields, and saves modifications successfully', async ({ page }) => {
    test.setTimeout(90000);

    // Listen to console and page errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // 1. Go to the Admin page
    await page.goto('/admin');

    try {
      // 2. Log in with the admin password
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();
      await passwordInput.fill('123456');

      const unlockButton = page.getByRole('button', { name: /unlock dashboard/i });
      await unlockButton.click();

      // 3. Verify we have entered the dashboard
      await expect(page.locator('h1', { hasText: 'System Control' })).toBeVisible();

      // 4. Verify all 6 new fields are rendered and visible
      const rateLimitInput = page.locator('input[placeholder="e.g. 10"]');
      const stepsInput = page.locator('input[placeholder="e.g. 20"]');
      const cfgInput = page.locator('input[placeholder="e.g. 7.5"]');
      const widthInput = page.locator('input[placeholder="e.g. 1024"]').first();
      const heightInput = page.locator('input[placeholder="e.g. 1024"]').nth(1);
      const negativePromptInput = page.locator('input[placeholder="e.g. blurry, low quality"]');

      await expect(rateLimitInput).toBeVisible();
      await expect(stepsInput).toBeVisible();
      await expect(cfgInput).toBeVisible();
      await expect(widthInput).toBeVisible();
      await expect(heightInput).toBeVisible();
      await expect(negativePromptInput).toBeVisible();

      // 5. Fill new values into the settings fields
      const testRateLimit = '15';
      const testSteps = '42';
      const testCfg = '8.5';
      const testWidth = '800';
      const testHeight = '600';
      const testNegativePrompt = 'ugly, distorted, low resolution';

      await rateLimitInput.fill(testRateLimit);
      await stepsInput.fill(testSteps);
      await cfgInput.fill(testCfg);
      await widthInput.fill(testWidth);
      await heightInput.fill(testHeight);
      await negativePromptInput.fill(testNegativePrompt);

      // 6. Deploy changes
      const deployButton = page.getByRole('button', { name: /deploy changes/i });
      await deployButton.click();

      // 7. Verify success banner
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible();

      // 8. Refresh the page to verify the data is retrieved correctly and persists
      await page.reload();

      // Re-login
      await page.locator('input[type="password"]').fill('123456');
      await page.getByRole('button', { name: /unlock dashboard/i }).click();

      // Verify fields contain the saved values
      await expect(rateLimitInput).toHaveValue(testRateLimit);
      await expect(stepsInput).toHaveValue(testSteps);
      await expect(cfgInput).toHaveValue(testCfg);
      await expect(widthInput).toHaveValue(testWidth);
      await expect(heightInput).toHaveValue(testHeight);
      await expect(negativePromptInput).toHaveValue(testNegativePrompt);
    } catch (err) {
      console.log('=== PAGE HTML ON ERROR ===');
      console.log(await page.content());
      console.log('==========================');
      throw err;
    }
  });
});
