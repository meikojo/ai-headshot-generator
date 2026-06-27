import { test, expect } from '@playwright/test';

test.describe('Paywall Modal & UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Set user to 0 credits via localStorage or just mock
    await page.evaluate(() => localStorage.setItem('credits', '0'));
    await page.reload();
  });

  test('Generating with 0 credits triggers paywall modal', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
  });

  test('Modal is visible, traps focus (or role="dialog"), displays pricing', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/\$\d+/);
  });

  test('Modal has a prominent "Upgrade" or "Subscribe" button', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    const upgradeBtn = page.getByRole('dialog').getByRole('button', { name: /upgrade|subscribe/i });
    await expect(upgradeBtn).toBeVisible();
  });

  test('User can close modal using a visual "Close" button', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    const closeBtn = page.getByRole('dialog').getByRole('button', { name: /close/i });
    await closeBtn.click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('User can close modal using Escape key', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
