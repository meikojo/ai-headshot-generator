import { test, expect } from '@playwright/test';

test.describe('Text to Image Tool', () => {
  test('The /tools/text-to-image page loads with a text input prompt area instead of an image upload area', async ({ page }) => {
    await page.goto('/tools/text-to-image');
    await expect(page.getByTestId('upload-zone')).toBeHidden();
    const promptInput = page.getByRole('textbox', { name: 'Prompt' });
    await expect(promptInput).toBeVisible();
  });

  test('Submitting a text prompt (e.g., "A futuristic city skyline") initiates image generation', async ({ page }) => {
    await page.goto('/tools/text-to-image');
    await page.getByRole('textbox', { name: 'Prompt' }).fill('A futuristic city skyline');
    
    const apiRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/text-to-image') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Generate' }).click();
    await apiRequestPromise;
  });

  test('Loading indicators are shown during the generation process', async ({ page }) => {
    await page.goto('/tools/text-to-image');
    await page.getByRole('textbox', { name: 'Prompt' }).fill('A futuristic city skyline');
    await page.getByRole('button', { name: 'Generate' }).click();
    
    await expect(page.getByTestId('loading-indicator')).toBeVisible();
  });

  test('The generated image is displayed in the result area', async ({ page }) => {
    await page.goto('/tools/text-to-image');
    await page.getByRole('textbox', { name: 'Prompt' }).fill('A futuristic city skyline');
    await page.getByRole('button', { name: 'Generate' }).click();
    
    await expect(page.getByTestId('result-image')).toBeVisible();
  });

  test('Free usage limit is properly updated via /api/increment-usage after generation', async ({ page }) => {
    await page.goto('/tools/text-to-image');
    await page.getByRole('textbox', { name: 'Prompt' }).fill('A futuristic city skyline');
    
    const incrementRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/increment-usage') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Generate' }).click();
    await incrementRequestPromise;
    
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  });
});
