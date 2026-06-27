import { test, expect } from '@playwright/test';

const dummyImage = {
  name: 'test.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
};

test.describe('Reimagine Tool', () => {
  test('User navigates to /tools/reimagine and sees the standard tool layout', async ({ page }) => {
    await page.goto('/tools/reimagine');
    await expect(page.getByTestId('upload-zone')).toBeVisible();
    await expect(page.getByTestId('result-zone')).toBeVisible();
  });

  test('Uploading a base image successfully triggers the reimagine process', async ({ page }) => {
    await page.goto('/tools/reimagine');
    
    const apiRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/reimagine') && request.method() === 'POST'
    );
    
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await apiRequestPromise;
  });

  test('The server-side API is called without exposing the Clipdrop API key to the client', async ({ page }) => {
    await page.goto('/tools/reimagine');
    
    const apiRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/reimagine') && request.method() === 'POST'
    );
    
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    const request = await apiRequestPromise;
    
    // Check that the request is going to our server, not directly to Clipdrop
    expect(request.url()).not.toContain('clipdrop.co');
    
    // Check that headers don't contain the API key (usually "x-api-key")
    const headers = request.headers();
    expect(headers['x-api-key']).toBeUndefined();
  });

  test('The reimagined image variant is successfully displayed in the results area', async ({ page }) => {
    await page.goto('/tools/reimagine');
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    
    await expect(page.getByTestId('result-image')).toBeVisible();
  });

  test('The API request correctly deducts 1 from the user\'s free usage quota upon success', async ({ page }) => {
    await page.goto('/tools/reimagine');
    
    const incrementRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/increment-usage') && request.method() === 'POST'
    );
    
    await page.getByTestId('upload-zone').setInputFiles(dummyImage);
    await incrementRequestPromise;
    
    await page.goto('/');
    await expect(page.getByTestId('free-uses-remaining')).toHaveText('2');
  });
});
