import { test, expect } from '@playwright/test';

test.describe('Feature 5: Stripe Checkout & Webhook Errors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('500 error on checkout fails silently and remains on pricing page', async ({ page }) => {
    await page.route('/api/credits/checkout', route => route.fulfill({ status: 500 }));
    
    // Ignore console error
    page.on('pageerror', () => {});
    
    await page.locator('button:has-text("Get Started")').first().click();
    
    // Ensure we did not navigate away
    expect(page.url()).toContain('/pricing');
  });

  test('Network abort on checkout fails silently and remains on pricing page', async ({ page }) => {
    await page.route('/api/credits/checkout', route => route.abort('failed'));
    
    page.on('pageerror', () => {});
    
    await page.locator('button:has-text("Get Started")').first().click();
    
    expect(page.url()).toContain('/pricing');
  });

  test('Malformed JSON response on checkout fails silently', async ({ page }) => {
    await page.route('/api/credits/checkout', route => route.fulfill({
      status: 200,
      body: '{"url": "http'
    }));
    
    page.on('pageerror', () => {});
    
    await page.locator('button:has-text("Get Started")').first().click();
    
    expect(page.url()).toContain('/pricing');
  });

  test('Missing URL in checkout response does not trigger navigation', async ({ page }) => {
    await page.route('/api/credits/checkout', route => route.fulfill({
      status: 200,
      json: { success: true }
    }));
    
    await page.locator('button:has-text("Get Started")').first().click();
    
    expect(page.url()).toContain('/pricing');
  });

  test('403 Forbidden on checkout fails silently', async ({ page }) => {
    await page.route('/api/credits/checkout', route => route.fulfill({ status: 403 }));
    
    page.on('pageerror', () => {});
    
    await page.locator('button:has-text("Get Started")').first().click();
    
    expect(page.url()).toContain('/pricing');
  });
});
