import { test, expect } from '@playwright/test';

test.describe('Upload Hero Layout', () => {
  test('should update hero section without breaking FAQ layout', async ({ page }) => {
    // Provide a basic mock to prevent immediate errors
    await page.route('**/api/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits: 5, premium: false })
      });
    });

    await page.goto('http://localhost:3000');

    const faqSection = page.locator('section.faq, #faq, section:has-text("FAQ"), section:has-text("Frequently Asked Questions")').first();
    // Ensure FAQ is visible initially
    await expect(faqSection).toBeVisible();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /upload/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake')
    });

    // Preview should appear
    const previewImage = page.locator('img[alt*="preview" i], .preview-container img, .hero img').last();
    await expect(previewImage).toBeVisible({ timeout: 5000 });

    // Check FAQ is still visible and correctly positioned below
    await expect(faqSection).toBeVisible();
    const postUploadFaqBox = await faqSection.boundingBox();
    
    expect(postUploadFaqBox).not.toBeNull();

    // Verify FAQ is below the Hero
    const heroSection = page.locator('section.hero, #hero, header, main section').first();
    const heroBox = await heroSection.boundingBox();
    
    if (heroBox && postUploadFaqBox) {
      expect(postUploadFaqBox.y).toBeGreaterThanOrEqual(heroBox.y);
    }
  });
});
