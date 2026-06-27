import { test, expect } from '@playwright/test';

test.describe('Stripe Checkout & Webhook Mock', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('credits', '0'));
    await page.reload();
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
  });

  test('Clicking "Upgrade" triggers mock checkout (intercepted)', async ({ page }) => {
    await page.route('**/api/checkout', async route => {
      await route.fulfill({ status: 200, json: { url: '/success' } });
    });
    const upgradeBtn = page.getByRole('dialog').getByRole('button', { name: /upgrade/i });
    await upgradeBtn.click();
    await expect(page).toHaveURL(/\/success/);
  });

  test('Mock success redirect displays payment success message', async ({ page }) => {
    await page.goto('/success');
    await expect(page.getByText(/payment successful/i)).toBeVisible();
  });

  test('Mock success updates user to "Premium" status', async ({ page }) => {
    await page.goto('/success');
    await page.goto('/');
    await expect(page.getByText(/premium user/i)).toBeVisible();
  });

  test('"Premium" user bypasses paywall on generation', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('isPremium', 'true'));
    await page.reload();
    await page.route('**/api/generate', async route => {
      await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'mock.png' } });
    });
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('img', { name: /generated/i })).toBeVisible();
  });

  test('Mock cancel redirect displays payment cancelled message', async ({ page }) => {
    await page.goto('/cancel');
    await expect(page.getByText(/payment cancelled/i)).toBeVisible();
  });
});
