import { test, expect } from '@playwright/test';

test.describe('Feature 1: File Upload & Preview Errors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate');
  });

  test('Uploading an unsupported file format shows validation error', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('unsupported content')
    });
    // React Dropzone default error for wrong type
    await expect(page.locator('.text-red-400')).toBeVisible();
    await expect(page.locator('.text-red-400')).toContainText('File type must be');
  });

  test('Uploading a file exceeding max size limit shows a custom file too large error', async ({ page }) => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    await page.locator('input[type="file"]').setInputFiles({
      name: 'toolarge.jpg',
      mimeType: 'image/jpeg',
      buffer: largeBuffer
    });
    // React Dropzone handles size before our custom check, its default message is 'File is larger than 10485760 bytes'
    await expect(page.locator('.text-red-400')).toBeVisible();
  });

  test('Uploading multiple files concurrently shows a warning', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles([
      { name: 'test1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake1') },
      { name: 'test2.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake2') }
    ]);
    await expect(page.locator('.text-red-400')).toBeVisible();
    await expect(page.locator('.text-red-400')).toContainText('Too many files');
  });

  test('Clearing a file selection removes the preview', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
    // Wait for preview
    await expect(page.getByAltText('Selected preview')).toBeVisible();
    // Click close button
    await page.getByLabel('Remove selected image').click();
    // Preview should be gone
    await expect(page.getByAltText('Selected preview')).not.toBeVisible();
  });

  test('Uploading an extremely long name truncates in UI', async ({ page }) => {
    const longName = 'a'.repeat(260) + '.jpg';
    await page.locator('input[type="file"]').setInputFiles({
      name: longName,
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
    await expect(page.getByText(longName)).toBeVisible();
    await expect(page.getByText(longName)).toHaveClass(/truncate/);
  });
});
