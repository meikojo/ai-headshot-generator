import { test, expect } from '@playwright/test';

test.describe('Stripe Checkout and Premium Download', () => {
  test('should not include watermark for premium users', async ({ page }) => {
    // Mock user state as premium
    await page.route('**/api/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits: 10, premium: true })
      });
    });

    // Mock generation endpoint returning an unwatermarked image
    await page.route('**/api/generate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://mock-image.com/generated-premium.jpg' })
      });
    });

    await page.goto('http://localhost:3000');

    // Upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /upload/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content')
    });

    // Generate
    await page.getByRole('button', { name: /generate/i }).click();

    const downloadBtn = page.getByRole('button', { name: /download/i });
    await expect(downloadBtn).toBeVisible({ timeout: 5000 });

    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();
    const download = await downloadPromise;

    // Verify it lacks watermark indicator
    const outputString = download.suggestedFilename() + download.url();
    expect(outputString).not.toMatch(/watermark/i);
  });
});
