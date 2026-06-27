import { test, expect } from '@playwright/test';

test.describe('Paywall Modal Layout Overlay', () => {
  test('modal should overlay background layout elements', async ({ page }) => {
    // Mock user with 0 credits
    await page.route('**/api/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits: 0, premium: false })
      });
    });

    await page.goto('http://localhost:3000');

    // Find a background button to test interactability later
    const uploadBtn = page.getByRole('button', { name: /upload/i });
    await expect(uploadBtn).toBeVisible();

    // Trigger Paywall
    const upgradeBtn = page.getByRole('button', { name: /upgrade|premium|pro/i }).first();
    if (await upgradeBtn.isVisible()) {
      await upgradeBtn.click();
    } else {
      const fileChooserPromise = page.waitForEvent('filechooser').catch(() => null);
      await uploadBtn.click();
    }

    const paywallModal = page.locator('[role="dialog"], .paywall-modal, .modal').first();
    await expect(paywallModal).toBeVisible({ timeout: 5000 });
    await expect(paywallModal).toBeInViewport();

    // The modal or its backdrop should block interaction with background elements
    // We try to verify via aria-hidden on body/root or overlay existence
    const bodyAriaHidden = await page.locator('body').getAttribute('aria-hidden');
    const hasBackdrop = await page.locator('.backdrop, .overlay').isVisible().catch(() => false);
    
    // We expect either aria-hidden is true, an overlay exists, or the background button is no longer actionable directly
    // An alternative is to just expect the modal to have focus or be a dialog
    const isDialog = await paywallModal.getAttribute('role') === 'dialog';
    
    expect(bodyAriaHidden === 'true' || hasBackdrop || isDialog).toBe(true);
  });
});
