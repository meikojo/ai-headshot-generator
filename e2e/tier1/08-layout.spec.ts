import { test, expect } from '@playwright/test';

test.describe('UI Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Hero section is visible with an h1', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });

  test('Hero CTA focuses/navigates to file upload', async ({ page }) => {
    const cta = page.getByRole('button', { name: /get started/i });
    await cta.click();
    const uploadInput = page.locator('input[type="file"]');
    await expect(uploadInput).toBeAttached();
  });

  test('FAQ section is visible with multiple questions', async ({ page }) => {
    const faqs = page.locator('.faq-item');
    expect(await faqs.count()).toBeGreaterThan(1);
  });

  test('Clicking FAQ item expands to reveal answer', async ({ page }) => {
    const faqButton = page.locator('.faq-item button').first();
    const faqAnswer = page.locator('.faq-item .answer').first();
    
    await expect(faqAnswer).toBeHidden();
    await faqButton.click();
    await expect(faqAnswer).toBeVisible();
  });

  test('Semantic HTML landmarks (<header>, <main>, <footer>) are present', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
