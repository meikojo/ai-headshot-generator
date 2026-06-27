import { test, expect } from '@playwright/test';

test.describe('Upload and Freemium Gate', () => {
  test('should reject upload when freemium credits are 0', async ({ page }) => {
    // Mock user state to have 0 credits
    await page.route('**/api/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits: 0 })
      });
    });

    await page.goto('http://localhost:3000');

    // Attempt to upload an image
    const fileChooserPromise = page.waitForEvent('filechooser').catch(() => null);
    await page.getByRole('button', { name: /upload/i }).click();
    
    // Depending on implementation, fileChooser may not open if blocked,
    // or it opens but validation blocks generation.
    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      await fileChooser.setFiles({
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-content')
      });
    }

    // Verify the UI displays a credits exhausted warning or paywall
    const warning = page.locator('text=/credits exhausted|no credits left|out of credits|upgrade/i').first();
    await expect(warning).toBeVisible({ timeout: 5000 });

    // Verify generation is not possible
    const generateBtn = page.getByRole('button', { name: /generate/i });
    if (await generateBtn.isVisible()) {
      await expect(generateBtn).toBeDisabled();
    }
  });
});
