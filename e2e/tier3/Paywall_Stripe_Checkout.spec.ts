import { test, expect } from '@playwright/test';

test.describe('Paywall to Stripe Checkout', () => {
  test('should navigate to Stripe checkout from paywall modal', async ({ page }) => {
    // Mock user with 0 credits to trigger paywall
    await page.route('**/api/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits: 0, premium: false })
      });
    });

    // Mock checkout session API
    await page.route('**/api/create-checkout-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/fake-session' })
      });
    });

    await page.goto('http://localhost:3000');

    // Trigger Paywall (either explicitly via Upgrade button or by uploading with 0 credits)
    const upgradeBtn = page.getByRole('button', { name: /upgrade|premium|pro/i }).first();
    if (await upgradeBtn.isVisible()) {
      await upgradeBtn.click();
    } else {
      const fileChooserPromise = page.waitForEvent('filechooser').catch(() => null);
      await page.getByRole('button', { name: /upload/i }).click();
      const fileChooser = await fileChooserPromise;
      if (fileChooser) {
        await fileChooser.setFiles({
          name: 'test.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake')
        });
      }
    }

    // Wait for paywall to appear
    const paywallModal = page.locator('[role="dialog"], .paywall-modal, .modal');
    await expect(paywallModal).toBeVisible({ timeout: 5000 });

    const subscribeBtn = paywallModal.getByRole('button', { name: /subscribe|buy|checkout|continue/i }).first();
    await expect(subscribeBtn).toBeVisible();

    // Click to start checkout
    await subscribeBtn.click();

    // Verify navigation to mock Stripe Checkout URL
    await page.waitForURL('https://checkout.stripe.com/fake-session', { timeout: 5000 });
    expect(page.url()).toBe('https://checkout.stripe.com/fake-session');
  });
});
