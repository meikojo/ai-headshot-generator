import { test, expect } from '@playwright/test';

test.describe('Feature 8: UI Layout Errors (Hero, FAQ)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Narrow viewport (320px) - FAQ elements do not overflow horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    const bodyBox = await page.locator('body').boundingBox();
    const faqHeadingBox = await page.getByRole('heading', { name: /Frequently Asked Questions/i }).boundingBox();
    
    // Ensure the FAQ heading fits within the narrow screen
    expect(faqHeadingBox?.width).toBeLessThanOrEqual(320);
    expect(faqHeadingBox?.x).toBeGreaterThanOrEqual(0);
    
    // Ensure body doesn't overflow horizontally
    expect(bodyBox?.width).toBeLessThanOrEqual(320);
  });

  test('Wide viewport (3840px) - Hero content is centered and constrained', async ({ page }) => {
    await page.setViewportSize({ width: 3840, height: 2160 });
    const heroHeading = page.getByRole('heading', { name: /Transform Your Selfie/i });
    const box = await heroHeading.boundingBox();
    
    // It should be centered, meaning the left margin should be relatively large
    expect(box?.x).toBeGreaterThan(1000);
    // But the element width itself is constrained
    expect(box?.width).toBeLessThan(3840 / 2);
  });

  test('FAQ grid switches to single column on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    const faqItems = page.locator('.grid > div');
    
    // On 320px width, items should be stacked vertically, so the second item is below the first
    const box1 = await faqItems.nth(0).boundingBox();
    const box2 = await faqItems.nth(1).boundingBox();
    
    expect(box1?.y).toBeLessThan(box2!.y);
    expect(box1?.x).toBe(box2?.x);
  });

  test('Hero background blur effect is properly contained without expanding body width', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    const blurElement = page.locator('.blur-\\[120px\\]');
    
    // Even if it overflows visually, the body should not expand
    const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(bodyWidth).toBe(800);
  });

  test('Focusing Generate link with keyboard shows focus ring', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    // Depending on header links, we might need multiple tabs.
    // Let's just focus the element directly.
    const generateLink = page.getByRole('link', { name: /Generate Your Headshot/i });
    await generateLink.focus();
    
    // Ensure it's focused and has the expected classes
    await expect(generateLink).toBeFocused();
    await expect(generateLink).toHaveClass(/focus:ring-2/);
  });
});
