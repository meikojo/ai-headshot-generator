import { test, expect } from '@playwright/test';

test.describe('Tier 3 E2E Tests: Cross-Feature Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Reset state before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('credits', '3');
      localStorage.setItem('is_paid', 'false');
    });
  });

  test('1. Freemium + Remove Background Tool: Tool usage decrements freemium count', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('credits', '3'));
    await page.goto('/tools/remove-background');
    await page.route('**/api/generate', async route => {
      await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'mock.png' } });
    });
    
    await expect(page.getByText(/3 credits remaining/i)).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate|remove|submit/i }).click();
    await expect(page.getByText(/2 credits remaining/i)).toBeVisible();
  });

  test('2. Freemium + Usage Gate: Exhausting freemium credits shows Usage Gate', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('credits', '0'));
    await page.goto('/tools/cleanup');
    
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate|cleanup|submit/i }).click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/upgrade|subscribe|limit/i);
  });

  test('3. Stripe Monetization + Usage Gate: Payment removes Usage Gate', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('credits', '0'));
    await page.goto('/tools/uncrop');
    
    // trigger paywall
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate|uncrop|submit/i }).click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // simulate successful payment via storage change
    await page.evaluate(() => {
      localStorage.setItem('is_paid', 'true');
      localStorage.setItem('credits', '999');
    });
    await page.reload();

    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('4. Stripe Monetization + Freemium: Paid users bypass freemium limits', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('is_paid', 'true');
      localStorage.setItem('credits', '0'); // even with 0 credits
    });
    await page.goto('/tools/upscale');
    await page.route('**/api/generate', async route => {
      await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'mock.png' } });
    });

    // should not show paywall
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate|upscale|submit/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText(/limit reached/i)).toBeHidden();
  });

  test('5. UI Theme & Layout + Text to Image Tool: Tool page respects layout elements', async ({ page }) => {
    await page.goto('/tools/text-to-image');
    
    // Check layout (40% upload, 60% result - just ensuring containers exist with appropriate classes)
    await expect(page.locator('.upload-zone, [data-testid="upload-zone"]').first()).toBeVisible();
    await expect(page.locator('.result-display, [data-testid="result-display"]').first()).toBeVisible();
  });

  test('6. UI Theme & Layout + Reimagine Tool: Layout maintains structure', async ({ page }) => {
    await page.goto('/tools/reimagine');
    
    const uploadZone = page.locator('.upload-zone, [data-testid="upload-zone"]').first();
    const resultDisplay = page.locator('.result-display, [data-testid="result-display"]').first();
    
    await expect(uploadZone).toBeVisible();
    await expect(resultDisplay).toBeVisible();
  });

  test('7. Remove Background Tool + Cleanup Tool: Cross-navigation maintains session state', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('credits', '3'));
    await page.goto('/tools/remove-background');
    await expect(page.getByText(/3 credits remaining/i)).toBeVisible();
    
    await page.goto('/tools/cleanup');
    await expect(page.getByText(/3 credits remaining/i)).toBeVisible();
  });

  test('8. Upscale Tool + Freemium: Tool execution consumes 1 credit', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('credits', '2'));
    await page.goto('/tools/upscale');
    await page.route('**/api/generate', async route => {
      await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'mock.png' } });
    });
    
    await expect(page.getByText(/2 credits remaining/i)).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate|upscale|submit/i }).click();
    await expect(page.getByText(/1 credits remaining/i)).toBeVisible();
  });

  test('9. Uncrop Tool + Usage Gate: Using uncrop with 0 credits triggers paywall', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('credits', '0'));
    await page.goto('/tools/uncrop');
    
    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate|uncrop|submit/i }).click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/upgrade|subscribe|limit/i);
  });

  test('10. Replace Background Tool + Stripe Monetization: Paid users can use tool without paywall', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('is_paid', 'true');
      localStorage.setItem('credits', '0');
    });
    await page.goto('/tools/replace-background');
    await page.route('**/api/generate', async route => {
      await route.fulfill({ status: 200, json: { status: 'succeeded', url: 'mock.png' } });
    });

    await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
    await page.getByRole('button', { name: /generate|replace|submit/i }).click();
    
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('11. Cleanup Tool + UI Theme & Layout: Semantic structure is present', async ({ page }) => {
    await page.goto('/tools/cleanup');
    
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    const uploadZone = page.locator('.upload-zone, [data-testid="upload-zone"]').first();
    await expect(uploadZone).toBeVisible();
  });
});
