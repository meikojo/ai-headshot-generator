import { test, expect } from '@playwright/test';

test.describe('Feature 7: Share/Copy Tweet Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'valid.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
    
    await page.route('/api/generate', route => route.fulfill({
      status: 200,
      json: { resultUrl: 'http://fake.url/image.jpg' }
    }));
  });

  test('Share and Copy buttons are not present before generation', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Share on X/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Copy Link/i })).not.toBeVisible();
  });

  test('Clicking Copy Link updates button text to Copied!', async ({ page, context }) => {
    // Grant clipboard permission for modern API
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.getByRole('button', { name: /Generate Now/i }).click();
    
    const copyBtn = page.getByRole('button', { name: /Copy Link/i });
    await expect(copyBtn).toBeVisible();
    
    await copyBtn.click();
    await expect(page.getByRole('button', { name: /Copied!/i })).toBeVisible();
  });

  test('Clipboard API denial falls back to execCommand without crashing', async ({ page, context }) => {
    // Deny clipboard to force catch block fallback
    await context.grantPermissions([]);
    
    await page.getByRole('button', { name: /Generate Now/i }).click();
    
    const copyBtn = page.getByRole('button', { name: /Copy Link/i });
    await expect(copyBtn).toBeVisible();
    
    await copyBtn.click();
    // It should still change to Copied! because the catch block sets state
    await expect(page.getByRole('button', { name: /Copied!/i })).toBeVisible();
  });

  test('Share on X constructs valid tweet intent URL', async ({ page }) => {
    await page.getByRole('button', { name: /Generate Now/i }).click();
    
    const shareLink = page.getByRole('link', { name: /Share on X/i });
    await expect(shareLink).toBeVisible();
    
    const href = await shareLink.getAttribute('href');
    expect(href).toContain('https://twitter.com/intent/tweet');
    expect(href).toContain('text=');
    expect(href).toContain('url=http%3A%2F%2Ffake.url%2Fimage.jpg');
  });

  test('Rapidly clicking copy link does not break state toggling', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.getByRole('button', { name: /Generate Now/i }).click();
    
    const copyBtn = page.getByRole('button', { name: /Copy Link/i });
    await expect(copyBtn).toBeVisible();
    
    await copyBtn.click();
    await expect(page.getByRole('button', { name: /Copied!/i })).toBeVisible();
    
    await copyBtn.click();
    await expect(page.getByRole('button', { name: /Copied!/i })).toBeVisible();
  });
});
