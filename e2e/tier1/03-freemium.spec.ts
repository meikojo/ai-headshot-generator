import { test, expect } from '@playwright/test';

test.describe('Freemium Count Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.route('**/api/generate', async route => {
      await route.fulfill({
        status: 200,
        json: { status: 'succeeded', url: 'https://mock.replicate.com/image.png' }
      });
    });
  });

  test('New user sees initial freemium count (e.g. 3 remaining)', async ({ page }) => {
    await expect(page.getByText(/3 credits remaining/i)).toBeVisible();
  });

  test('Successful generation decrements count by exactly 1', async ({ page }) => {
    await expect(page.getByText(/3 credits remaining/i)).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake')
    });
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.getByText(/2 credits remaining/i)).toBeVisible();
  });

  test('Count persists after page reload', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.getByText(/2 credits remaining/i)).toBeVisible();
    
    await page.reload();
    await expect(page.getByText(/2 credits remaining/i)).toBeVisible();
  });

  test('Reaching 0 credits updates UI to indicate limit reached', async ({ page }) => {
    // We can simulate reaching 0 by looping 3 times
    for (let i = 0; i < 3; i++) {
      await page.locator('input[type="file"]').setInputFiles({ name: `test${i}.jpg`, mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
      await page.getByRole('button', { name: /generate/i }).click();
    }
    await expect(page.getByText(/0 credits remaining/i)).toBeVisible();
    await expect(page.getByText(/limit reached/i)).toBeVisible();
  });

  test('Freemium counter value is accessible to screen readers', async ({ page }) => {
    const counter = page.getByLabel(/credits remaining/i);
    await expect(counter).toBeVisible();
  });
});
