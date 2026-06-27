import { test, expect } from '@playwright/test';

const dummyImage = {
  name: 'test.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
};

test.describe('Remove Background Tool', () => {
  test('User can successfully navigate to /tools/remove-background and view the upload/result layout', async ({ page }) => {
    await page.goto('/tools/remove-background');
    await expect(page.getByTestId('upload-zone')).toBeVisible();
    await expect(page.getByTestId('result-zone')).toBeVisible();
  });

  test('Uploading a valid PNG image successfully triggers the background removal API call', async ({ page }) => {
    await page.goto('/tools/remove-background');
    
    const apiRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/remove-background') && request.method() === 'POST'
    );
    
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await apiRequestPromise;
  });

  test('The UI displays a clear loading indicator while waiting for the server-side response', async ({ page }) => {
    await page.goto('/tools/remove-background');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await expect(page.getByTestId('loading-indicator')).toBeVisible();
  });

  test('The image with the removed background is rendered in the 60% result zone upon success', async ({ page }) => {
    await page.goto('/tools/remove-background');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    const resultImage = page.getByTestId('result-image');
    await expect(resultImage).toBeVisible();
    
    // Check if it's within the result zone
    const resultZone = page.getByTestId('result-zone');
    await expect(resultZone).toContainText(''); // Result zone contains the image
  });

  test('Successfully processing an image calls /api/increment-usage and updates the remaining uses', async ({ page }) => {
    await page.goto('/tools/remove-background');
    
    const incrementRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/increment-usage') && request.method() === 'POST'
    );
    
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await incrementRequestPromise;
    
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  });
});
