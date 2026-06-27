import { test, expect } from '@playwright/test';

test.describe('Feature 6: Download & Watermark Errors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'valid.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
    
    await page.route('/api/generate', route => route.fulfill({
      status: 200,
      json: { resultUrl: 'http://fake.url/image.jpg' }
    }));
    
    await page.getByRole('button', { name: /Generate Now/i }).click();
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
  });

  test('Network abort on image fetch triggers window.open fallback', async ({ page, context }) => {
    await page.route('http://fake.url/image.jpg', route => route.abort('failed'));
    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Download/i }).click()
    ]);
    
    expect(newPage.url()).toBe('http://fake.url/image.jpg');
  });

  test('CORS failure on image fetch triggers window.open fallback', async ({ page, context }) => {
    // Playwright route without CORS headers might trigger CORS if it were a real browser, 
    // but in playwright we can simulate it by aborting or returning a specific error.
    await page.route('http://fake.url/image.jpg', route => route.abort('internetdisconnected'));
    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Download/i }).click()
    ]);
    
    expect(newPage.url()).toBe('http://fake.url/image.jpg');
  });

  test('Successful fetch downloads the file without triggering fallback', async ({ page }) => {
    await page.route('http://fake.url/image.jpg', route => route.fulfill({
      status: 200,
      contentType: 'image/jpeg',
      body: Buffer.from('fake-image-data')
    }));
    
    // Listen for download event instead of new page
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Download/i }).click()
    ]);
    
    expect(download.suggestedFilename()).toMatch(/ai-headshot-\d+\.png/);
  });

  test('404 response does not throw and instead downloads error content', async ({ page }) => {
    await page.route('http://fake.url/image.jpg', route => route.fulfill({
      status: 404,
      body: 'Not Found'
    }));
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Download/i }).click()
    ]);
    
    expect(download.suggestedFilename()).toMatch(/ai-headshot-\d+\.png/);
  });

  test('500 response does not throw and instead downloads error content', async ({ page }) => {
    await page.route('http://fake.url/image.jpg', route => route.fulfill({
      status: 500,
      body: 'Internal Server Error'
    }));
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Download/i }).click()
    ]);
    
    expect(download.suggestedFilename()).toMatch(/ai-headshot-\d+\.png/);
  });
});
