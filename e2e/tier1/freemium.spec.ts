import { test, expect } from '@playwright/test';

const dummyImage = {
  name: 'test.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
};

test.describe('Freemium IP & Fingerprinting', () => {
  test('A new user with a fresh IP and fingerprint is granted exactly 3 free uses', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('3');
  });

  test('A user\'s fingerprint remains consistent across multiple browser page reloads in the same session', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('3');
    await page.reload();
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('3');
  });

  test('Submitting 1 successful tool usage reduces the remaining quota to 2 via /api/check-limit', async ({ page }) => {
    await page.goto('/tools/remove-background');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await expect(page.getByTestId('result-image')).toBeVisible();
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  });

  test('Submitting 2 successful tool usages reduces the remaining quota to 1 via /api/check-limit', async ({ page }) => {
    await page.goto('/tools/remove-background');
    
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await expect(page.getByTestId('result-image')).toBeVisible();
    
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await expect(page.getByTestId('result-image')).toBeVisible();

    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('1');
  });

  test('Upon the 3rd usage, the quota reaches 0, and a 4th request is strictly blocked server-side', async ({ page }) => {
    await page.goto('/tools/remove-background');
    
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('upload-zone').setInputFiles(dummyImage);
      await expect(page.getByTestId('result-image')).toBeVisible();
    }
    
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('0');
    
    await page.goto('/tools/remove-background');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await expect(page.getByTestId('paywall-modal')).toBeVisible();
  });
});
