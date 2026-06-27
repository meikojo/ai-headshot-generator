import { test, expect } from '@playwright/test';

test.describe('File Upload & Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User can successfully upload a valid image file', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
    await expect(page.getByTestId('upload-success')).toBeVisible();
  });

  test('Uploading displays a visual preview', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
    await expect(page.getByRole('img', { name: /preview/i })).toBeVisible();
  });

  test('Valid upload enables the "Generate" button', async ({ page }) => {
    const generateBtn = page.getByRole('button', { name: /generate/i });
    await expect(generateBtn).toBeDisabled();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
    
    await expect(generateBtn).toBeEnabled();
  });

  test('User can replace an uploaded image', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test1.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image1')
    });
    await expect(page.getByText('test1.jpg')).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'test2.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image2')
    });
    await expect(page.getByText('test2.jpg')).toBeVisible();
    await expect(page.getByText('test1.jpg')).not.toBeVisible();
  });

  test('Upload control uses correct semantic labels (accessible)', async ({ page }) => {
    const uploadLabel = page.getByLabel(/upload/i);
    await expect(uploadLabel).toBeAttached();
  });
});
