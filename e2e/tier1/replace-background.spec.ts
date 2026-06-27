import { test, expect } from '@playwright/test';

const dummyImage = {
  name: 'test.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
};

test.describe('Replace Background Tool', () => {
  test('User can navigate to /tools/replace-background and see the standard tool layout', async ({ page }) => {
    await page.goto('/tools/replace-background');
    await expect(page.getByTestId('upload-zone')).toBeVisible();
    await expect(page.getByTestId('result-zone')).toBeVisible();
  });

  test('User can upload a source image and provide a text prompt describing the new background', async ({ page }) => {
    await page.goto('/tools/replace-background');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    
    const promptInput = page.getByRole('textbox', { name: 'Prompt' });
    await expect(promptInput).toBeVisible();
    await promptInput.fill('A sunny beach');
    await expect(promptInput).toHaveValue('A sunny beach');
  });

  test('The submission successfully calls the Replace Background server-side API', async ({ page }) => {
    await page.goto('/tools/replace-background');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await page.getByRole('textbox', { name: 'Prompt' }).fill('A sunny beach');
    
    const apiRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/replace-background') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Generate' }).click();
    await apiRequestPromise;
  });

  test('The new image with the requested background is displayed in the result area', async ({ page }) => {
    await page.goto('/tools/replace-background');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await page.getByRole('textbox', { name: 'Prompt' }).fill('A sunny beach');
    await page.getByRole('button', { name: 'Generate' }).click();
    
    await expect(page.getByTestId('result-image')).toBeVisible();
  });

  test('Successful replacement increments the usage tracking count for the user', async ({ page }) => {
    await page.goto('/tools/replace-background');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await page.getByRole('textbox', { name: 'Prompt' }).fill('A sunny beach');
    
    const incrementRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/increment-usage') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Generate' }).click();
    await incrementRequestPromise;
    
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  });
});
