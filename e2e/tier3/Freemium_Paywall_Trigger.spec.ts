import { test, expect } from '@playwright/test';

test.describe('Freemium Paywall Trigger', () => {
  test('should show paywall modal when credits drop to 0', async ({ page }) => {
    let credits = 1;
    await page.route('**/api/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits, premium: false })
      });
    });

    await page.route('**/api/generate', async route => {
      credits = 0; // Decrease credits after successful generation
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://mock-image.com/generated.jpg' })
      });
    });

    await page.goto('http://localhost:3000');

    // First attempt - should succeed
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /upload/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test1.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });

    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible({ timeout: 5000 });

    // Reset or navigate back to start
    const startOverBtn = page.getByRole('button', { name: /start over|new/i });
    if (await startOverBtn.isVisible()) {
      await startOverBtn.click();
    } else {
      await page.goto('http://localhost:3000');
    }

    // Second attempt - should hit paywall because credits are now 0
    const fileChooserPromise2 = page.waitForEvent('filechooser').catch(() => null);
    await page.getByRole('button', { name: /upload/i }).click();
    
    const fileChooser2 = await fileChooserPromise2;
    if (fileChooser2) {
      await fileChooser2.setFiles({
        name: 'test2.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image')
      });
    }

    const paywallModal = page.locator('[role="dialog"], .paywall-modal, .modal').filter({ hasText: /upgrade|premium|pro/i });
    await expect(paywallModal).toBeVisible({ timeout: 5000 });
  });
});
