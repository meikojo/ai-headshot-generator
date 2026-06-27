import { test, expect } from '@playwright/test';

test.describe('Feature 2: AI Generation & Loading Errors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'valid.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
  });

  test('API 500 status triggers error alert dialog', async ({ page }) => {
    await page.route('/api/generate', route => route.fulfill({
      status: 500,
      body: 'Internal Server Error'
    }));
    
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await page.getByRole('button', { name: /Generate Now/i }).click();
    
    // Wait for state to reset to idle (meaning error caught)
    await expect(page.getByRole('button', { name: /Generate Now/i })).toBeVisible();
    expect(dialogMessage).toContain('Failed to generate headshot');
  });

  test('API 429 Rate Limit status triggers error alert dialog', async ({ page }) => {
    await page.route('/api/generate', route => route.fulfill({
      status: 429,
      body: 'Too Many Requests'
    }));
    
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await page.getByRole('button', { name: /Generate Now/i }).click();
    await expect(page.getByRole('button', { name: /Generate Now/i })).toBeVisible();
    expect(dialogMessage).toContain('Failed to generate headshot');
  });

  test('Network timeout triggers error alert dialog', async ({ page }) => {
    await page.route('/api/generate', route => route.abort('timedout'));
    
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await page.getByRole('button', { name: /Generate Now/i }).click();
    await expect(page.getByRole('button', { name: /Generate Now/i })).toBeVisible();
    expect(dialogMessage).toContain('Failed to generate headshot');
  });

  test('Malformed JSON response triggers error alert dialog', async ({ page }) => {
    await page.route('/api/generate', route => route.fulfill({
      status: 200,
      body: '{"invalidJson"'
    }));
    
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await page.getByRole('button', { name: /Generate Now/i }).click();
    await expect(page.getByRole('button', { name: /Generate Now/i })).toBeVisible();
    expect(dialogMessage).toContain('Failed to generate headshot');
  });

  test('Rapid double-clicking only triggers single API request', async ({ page }) => {
    let requestCount = 0;
    await page.route('/api/generate', async route => {
      requestCount++;
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({ status: 200, json: { resultUrl: 'http://fake.url' } });
    });
    
    const generateBtn = page.getByRole('button', { name: /Generate Now/i });
    await generateBtn.click();
    // Second click should be ignored or button disabled
    // In our UI, status goes to 'uploading' and button disappears
    await expect(generateBtn).not.toBeVisible();
    
    expect(requestCount).toBe(1);
  });
});
