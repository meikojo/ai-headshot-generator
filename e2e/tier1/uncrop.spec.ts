import { test, expect } from '@playwright/test';

const dummyImage = {
  name: 'test.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
};

test.describe('Uncrop Tool', () => {
  test('Navigating to /tools/uncrop displays the consistent UI layout', async ({ page }) => {
    await page.goto('/tools/uncrop');
    await expect(page.getByTestId('upload-zone')).toBeVisible();
    await expect(page.getByTestId('result-zone')).toBeVisible();
  });

  test('Uploading an image and specifying a target expansion/aspect ratio starts the uncrop process', async ({ page }) => {
    await page.goto('/tools/uncrop');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    
    // Select an aspect ratio or expansion size
    await page.getByRole('button', { name: 'Landscape (16:9)' }).click();
    
    const apiRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/uncrop') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Uncrop' }).click();
    await apiRequestPromise;
  });

  test('The expanded/uncropped image is returned and rendered in the result zone', async ({ page }) => {
    await page.goto('/tools/uncrop');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await page.getByRole('button', { name: 'Landscape (16:9)' }).click();
    await page.getByRole('button', { name: 'Uncrop' }).click();
    
    await expect(page.getByTestId('result-image')).toBeVisible();
  });

  test('The server-side API endpoint correctly forwards the request to Clipdrop and returns the data', async ({ page }) => {
    await page.goto('/tools/uncrop');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await page.getByRole('button', { name: 'Landscape (16:9)' }).click();
    
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/uncrop') && response.status() === 200
    );
    await page.getByRole('button', { name: 'Uncrop' }).click();
    
    const response = await responsePromise;
    // Assuming our API returns JSON with an image URL or base64 data directly
    const contentType = response.headers()['content-type'];
    expect(contentType).toBeTruthy();
  });

  test('A successful uncrop operation deducts 1 from the user\'s free usage quota', async ({ page }) => {
    await page.goto('/tools/uncrop');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await page.getByRole('button', { name: 'Landscape (16:9)' }).click();
    
    const incrementRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/increment-usage') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Uncrop' }).click();
    await incrementRequestPromise;
    
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  });
});
