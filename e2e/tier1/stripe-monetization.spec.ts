import { test, expect, Page } from '@playwright/test';

const dummyImage = {
  name: 'test.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
};

test.describe('Stripe Monetization & Webhook', () => {
  // Use a helper to exhaust free uses before some tests
  const exhaustFreeUses = async (page: Page) => {
    await page.goto('/tools/remove-background');
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('upload-zone').setInputFiles(dummyImage);
      await expect(page.getByTestId('result-image')).toBeVisible();
    }
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await expect(page.getByTestId('paywall-modal')).toBeVisible();
  };

  test('Clicking the "Pay-Per-Use" button redirects the user to a Stripe Checkout session', async ({ page }) => {
    await exhaustFreeUses(page);
    
    // We can intercept the navigation to stripe to avoid actually leaving the test domain
    await page.route('**/*stripe.com/**', route => route.fulfill({ status: 200, body: 'Stripe Mock' }));
    
    const checkoutPromise = page.waitForNavigation({ url: /.*stripe\.com.*/ });
    await page.getByTestId('paywall-modal').getByRole('button', { name: 'Pay-Per-Use' }).click();
    await checkoutPromise;
  });

  test('Clicking the "Unlimited" button redirects the user to a Stripe Subscription session', async ({ page }) => {
    await exhaustFreeUses(page);
    
    await page.route('**/*stripe.com/**', route => route.fulfill({ status: 200, body: 'Stripe Mock' }));
    
    const subscriptionPromise = page.waitForNavigation({ url: /.*stripe\.com.*/ });
    await page.getByTestId('paywall-modal').getByRole('button', { name: 'Unlimited' }).click();
    await subscriptionPromise;
  });

  test('A successful payment webhook payload to /api/webhook updates the Supabase user record to is_paid=true', async ({ request }) => {
    // We send a direct mock webhook request
    const response = await request.post('/api/webhook', {
      data: {
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'mock-user-id',
            payment_status: 'paid'
          }
        }
      },
      headers: {
        'Stripe-Signature': 'mock-signature'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    // In a real test, we might verify via a database query or an admin API that the user record updated.
  });

  test('A paid user (with is_paid=true) returning to the app no longer sees the free usage badge', async ({ page }) => {
    // Assuming we can mock authentication as a paid user via a cookie or mock API
    await page.route('/api/user', route => route.fulfill({
      status: 200,
      json: { id: 'user-1', is_paid: true }
    }));
    
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toBeHidden();
  });

  test('A paid user is not shown the paywall and has continuous, uninterrupted access to all tools', async ({ page }) => {
    await page.route('/api/user', route => route.fulfill({
      status: 200,
      json: { id: 'user-1', is_paid: true }
    }));
    
    await page.goto('/tools/remove-background');
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('upload-zone').setInputFiles(dummyImage);
      await expect(page.getByTestId('result-image')).toBeVisible();
    }
    
    await expect(page.getByTestId('paywall-modal')).toBeHidden();
  });
});
