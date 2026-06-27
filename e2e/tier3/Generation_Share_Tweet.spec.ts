import { test, expect } from '@playwright/test';

test.describe('Generation and Share/Tweet', () => {
  test('should generate share link for the created image', async ({ page }) => {
    // Mock user state
    await page.route('**/api/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits: 5, premium: false })
      });
    });

    const mockImgUrl = 'https://mock-image.com/shareable-gen.jpg';
    await page.route('**/api/generate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: mockImgUrl })
      });
    });

    await page.goto('http://localhost:3000');

    // Upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /upload/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake')
    });

    // Generate
    await page.getByRole('button', { name: /generate/i }).click();

    // Wait for loading to finish and share button to appear
    const shareBtn = page.getByRole('button', { name: /share|tweet/i });
    await expect(shareBtn).toBeVisible({ timeout: 5000 });

    // Verify the share action
    const tagName = await shareBtn.evaluate(e => e.tagName);
    if (tagName === 'A') {
      const href = await shareBtn.getAttribute('href');
      expect(href).toMatch(/twitter\.com\/intent\/tweet/);
    } else {
      // If it triggers a popup
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        shareBtn.click()
      ]);
      expect(popup.url()).toMatch(/twitter\.com\/intent\/tweet/);
    }
  });
});
