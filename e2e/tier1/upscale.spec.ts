import { test, expect } from '@playwright/test';

const dummyImage = {
  name: 'test.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
};

test.describe('Upscale Tool', () => {
  test('User accesses /tools/upscale and the upload zone is visible and functional', async ({ page }) => {
    await page.goto('/tools/upscale');
    await expect(page.getByTestId('upload-zone')).toBeVisible();
    await expect(page.getByTestId('upload-zone')).toBeEnabled();
  });

  test('Uploading a low-resolution image initiates the upscale process', async ({ page }) => {
    await page.goto('/tools/upscale');
    
    const apiRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/upscale') && request.method() === 'POST'
    );
    
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await apiRequestPromise;
  });

  test('The upscaled, high-resolution result is displayed correctly in the results pane', async ({ page }) => {
    await page.goto('/tools/upscale');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    
    await expect(page.getByTestId('result-image')).toBeVisible();
  });

  test('The user is able to trigger a download of the upscaled image', async ({ page }) => {
    await page.goto('/tools/upscale');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    
    await expect(page.getByTestId('result-image')).toBeVisible();
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.png');
  });

  test('Usage count is correctly decremented after a successful upscale operation', async ({ page }) => {
    await page.goto('/tools/upscale');
    
    const incrementRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/increment-usage') && request.method() === 'POST'
    );
    
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await incrementRequestPromise;
    
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  });
});
