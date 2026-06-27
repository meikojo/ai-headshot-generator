import { test, expect } from '@playwright/test';

const dummyImage = {
  name: 'test.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
};

test.describe('Cleanup Tool', () => {
  test('User can navigate to /tools/cleanup and view the 40% upload zone / 60% result display layout', async ({ page }) => {
    await page.goto('/tools/cleanup');
    await expect(page.getByTestId('upload-zone')).toBeVisible();
    await expect(page.getByTestId('result-zone')).toBeVisible();
  });

  test('Uploading an image and selecting an area to mask starts the cleanup process', async ({ page }) => {
    await page.goto('/tools/cleanup');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    
    // Simulate masking (e.g., clicking on a canvas)
    await page.getByTestId('image-canvas').click({ position: { x: 50, y: 50 } });
    
    const apiRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/cleanup') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Clean up' }).click();
    await apiRequestPromise;
  });

  test('The tool gracefully handles the server response and displays the cleaned-up image', async ({ page }) => {
    await page.goto('/tools/cleanup');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await page.getByTestId('image-canvas').click({ position: { x: 50, y: 50 } });
    await page.getByRole('button', { name: 'Clean up' }).click();
    
    await expect(page.getByTestId('result-image')).toBeVisible();
  });

  test('The user can download the resulting cleaned image to their local device', async ({ page }) => {
    await page.goto('/tools/cleanup');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await page.getByTestId('image-canvas').click({ position: { x: 50, y: 50 } });
    await page.getByRole('button', { name: 'Clean up' }).click();
    
    await expect(page.getByTestId('result-image')).toBeVisible();
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.png');
  });

  test('A successful cleanup operation reduces the available free usage quota by 1', async ({ page }) => {
    await page.goto('/tools/cleanup');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await page.getByTestId('image-canvas').click({ position: { x: 50, y: 50 } });
    
    const incrementRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/increment-usage') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Clean up' }).click();
    await incrementRequestPromise;
    
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  });
});
