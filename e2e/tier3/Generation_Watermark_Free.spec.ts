import { test, expect } from '@playwright/test';

test.describe('Generation and Watermark (Free User)', () => {
  test('should include watermark for free user generated images', async ({ page }) => {
    await page.route('**/api/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits: 1, premium: false })
      });
    });

    await page.route('**/api/generate', async route => {
      // Simulate delay for generation loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://mock-image.com/generated-watermark.jpg' })
      });
    });

    await page.goto('http://localhost:3000');

    // Upload an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /upload/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content')
    });

    // Start generation
    await page.getByRole('button', { name: /generate/i }).click();

    // Verify loading indicator appears then disappears
    const loadingIndicator = page.locator('[data-testid="loading-indicator"], .loader, [role="progressbar"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeHidden({ timeout: 5000 });
    }

    const downloadBtn = page.getByRole('button', { name: /download/i });
    await expect(downloadBtn).toBeVisible({ timeout: 5000 });

    // Download event
    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();
    const download = await downloadPromise;

    // Verify filename or URL indicates a watermark
    expect(download.suggestedFilename() + download.url()).toMatch(/watermark/i);
  });
});
