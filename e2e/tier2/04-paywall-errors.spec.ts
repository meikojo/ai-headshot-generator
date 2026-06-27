import { test, expect } from '@playwright/test';

test.describe('Feature 4: Paywall Modal & UI Errors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'valid.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
    // Set count to 3 to trigger paywall
    await page.evaluate(() => localStorage.setItem('headshot_count', '3'));
    await page.getByRole('button', { name: /Generate Now/i }).click();
  });

  test('Paywall modal renders correctly with all elements', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /Out of Free Generations/i });
    await expect(heading).toBeVisible();
    await expect(page.getByText('Starter (10 Credits)')).toBeVisible();
    await expect(page.getByText('Pro (50 Credits)')).toBeVisible();
  });

  test('Cancel button closes the modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: /Out of Free Generations/i })).not.toBeVisible();
  });

  test('API 500 error on checkout fails silently and keeps modal open', async ({ page }) => {
    await page.route('/api/credits/checkout', route => route.fulfill({
      status: 500,
      body: 'Internal Server Error'
    }));
    
    // Ignore console errors from the unhandled promise rejection
    page.on('pageerror', () => {});
    
    await page.getByRole('button', { name: /Starter/i }).click();
    
    // Modal should still be open
    await expect(page.getByRole('heading', { name: /Out of Free Generations/i })).toBeVisible();
  });

  test('Malformed JSON response on checkout keeps modal open', async ({ page }) => {
    await page.route('/api/credits/checkout', route => route.fulfill({
      status: 200,
      body: '{"invalidJson"'
    }));
    
    page.on('pageerror', () => {});
    
    await page.getByRole('button', { name: /Pro/i }).click();
    await expect(page.getByRole('heading', { name: /Out of Free Generations/i })).toBeVisible();
  });

  test('Missing URL in checkout response does not navigate and keeps modal open', async ({ page }) => {
    await page.route('/api/credits/checkout', route => route.fulfill({
      status: 200,
      json: { success: true } // missing url
    }));
    
    await page.getByRole('button', { name: /Starter/i }).click();
    await expect(page.getByRole('heading', { name: /Out of Free Generations/i })).toBeVisible();
    // Ensure we are still on the same page
    expect(page.url()).toContain('/generate');
  });
});
