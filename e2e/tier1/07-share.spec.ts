import { test, expect } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.describe('Share/Copy Tweet Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.route('**/api/generate', async route => {
      await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'https://mock.com/img.png' } });
    });
  });

  test('"Share on X" opens correct Twitter intent URL', async ({ page, context }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: /share on x/i }).click()
    ]);
    expect(newPage.url()).toContain('twitter.com/intent/tweet');
  });

  test('"Copy Link" copies shareable URL to clipboard', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    
    await page.getByRole('button', { name: /copy link/i }).click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain(page.url());
  });

  test('Visual confirmation ("Copied!") appears temporarily', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    
    await page.getByRole('button', { name: /copy link/i }).click();
    await expect(page.getByText('Copied!')).toBeVisible();
    await expect(page.getByText('Copied!')).toBeHidden({ timeout: 5000 });
  });

  test('Share/Copy buttons are hidden before generation', async ({ page }) => {
    await expect(page.getByRole('link', { name: /share on x/i })).toBeHidden();
    await expect(page.getByRole('button', { name: /copy link/i })).toBeHidden();
  });

  test('Share buttons have accessible labels', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    
    await expect(page.getByRole('link', { name: /share on x/i })).toHaveAttribute('aria-label', /share/i);
  });
});
