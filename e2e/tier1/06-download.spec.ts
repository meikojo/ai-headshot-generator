import { test, expect } from '@playwright/test';

test.describe('Download & Watermark', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.route('**/api/generate', async route => {
      await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'https://mock.com/img.png' } });
    });
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
  });

  test('Free users see a watermark on preview', async ({ page }) => {
    const watermark = page.getByTestId('watermark-overlay');
    await expect(watermark).toBeVisible();
  });

  test('"Download" button triggers file download (wait for download event)', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });

  test('Downloaded filename matches expected format (e.g. *.png)', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  test('Premium users do not see a watermark', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('isPremium', 'true'));
    await page.reload();
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    
    const watermark = page.getByTestId('watermark-overlay');
    await expect(watermark).toBeHidden();
  });

  test('Premium users can download without watermark constraints', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('isPremium', 'true'));
    await page.reload();
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });
});
