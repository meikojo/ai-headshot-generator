import { test, expect } from '@playwright/test';

test.describe('AI Generation & Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Mock the API response
    await page.route('**/api/generate', async route => {
      // Small artificial delay to test loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'succeeded',
          url: 'https://mock.replicate.com/image.png'
        })
      });
    });

    // Upload an image to enable generate button
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });
  });

  test('"Generate" click triggers loading state (spinner/aria-busy)', async ({ page }) => {
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.locator('[aria-busy="true"]')).toBeVisible();
  });

  test('Loading state persists during mock API delay', async ({ page }) => {
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.getByTestId('spinner')).toBeVisible();
  });

  test('Mock API success removes loading state', async ({ page }) => {
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.locator('[aria-busy="true"]')).toBeHidden({ timeout: 5000 });
  });

  test('Mock API success displays the AI generated image', async ({ page }) => {
    await page.getByRole('button', { name: /generate/i }).click();
    const resultImage = page.locator('img[src="https://mock.replicate.com/image.png"]');
    await expect(resultImage).toBeVisible();
  });

  test('Generated image contains appropriate alt text', async ({ page }) => {
    await page.getByRole('button', { name: /generate/i }).click();
    const resultImage = page.getByRole('img', { name: /generated headshot/i });
    await expect(resultImage).toBeVisible();
  });
});
