import { test, expect } from '@playwright/test';

test.describe('UI Theme & Layout', () => {
  test('The homepage displays the dark navy theme (#080b14) background', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    // Check computed background color
    await expect(body).toHaveCSS('background-color', 'rgb(8, 11, 20)'); // equivalent to #080b14
  });

  test('Electric blue (#4f8ef7) and purple (#a855f7) accents are applied to buttons and active states', async ({ page }) => {
    await page.goto('/');
    const primaryButton = page.locator('button.primary').first();
    // Usually, the accent color might be on a specific class or background
    // We check that the primary button has the electric blue background or similar.
    // 'rgb(79, 142, 247)' is #4f8ef7
    await expect(primaryButton).toHaveCSS('background-color', /rgb\(79, 142, 247\)|rgb\(168, 85, 247\)/);
  });

  test('The homepage renders a 2x4 grid correctly listing all 7 tools and a placeholder/info tile', async ({ page }) => {
    await page.goto('/');
    const toolGrid = page.getByTestId('tool-grid');
    await expect(toolGrid).toBeVisible();
    
    const tiles = toolGrid.locator('> div'); // Assuming direct children are the tiles
    await expect(tiles).toHaveCount(8); // 7 tools + 1 placeholder
    
    // Check grid CSS
    await expect(toolGrid).toHaveCSS('display', 'grid');
  });

  test('All tool pages strictly follow a 40% interaction/upload zone and 60% result display layout on desktop screens', async ({ page }) => {
    // Set a desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const tools = [
      '/tools/remove-background',
      '/tools/cleanup',
      '/tools/replace-background',
      '/tools/reimagine',
      '/tools/upscale',
      '/tools/uncrop'
    ];
    
    for (const toolUrl of tools) {
      await page.goto(toolUrl);
      const container = page.getByTestId('tool-layout-container');
      await expect(container).toHaveCSS('display', 'flex'); // or grid
      
      const uploadZone = page.getByTestId('upload-zone');
      const resultZone = page.getByTestId('result-zone');
      
      // In CSS flex/grid, we can verify flex-basis or width percentages roughly,
      // or evaluate bounding boxes.
      const uploadBox = await uploadZone.boundingBox();
      const resultBox = await resultZone.boundingBox();
      const containerBox = await container.boundingBox();
      
      if (uploadBox && resultBox && containerBox) {
        const uploadPercentage = Math.round((uploadBox.width / containerBox.width) * 100);
        const resultPercentage = Math.round((resultBox.width / containerBox.width) * 100);
        
        // Tolerance for margin/padding
        expect(uploadPercentage).toBeGreaterThanOrEqual(35);
        expect(uploadPercentage).toBeLessThanOrEqual(45);
        
        expect(resultPercentage).toBeGreaterThanOrEqual(55);
        expect(resultPercentage).toBeLessThanOrEqual(65);
      }
    }
  });

  test('The UI layout correctly responds and stacks vertically on mobile viewports down to 375px width', async ({ page }) => {
    // Set a mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/tools/remove-background');
    const container = page.getByTestId('tool-layout-container');
    
    // Verify vertical stacking, e.g., flex-direction: column or layout heights
    await expect(container).toHaveCSS('flex-direction', 'column');
    
    const uploadZone = page.getByTestId('upload-zone');
    const resultZone = page.getByTestId('result-zone');
    
    const uploadBox = await uploadZone.boundingBox();
    const resultBox = await resultZone.boundingBox();
    
    if (uploadBox && resultBox) {
      // In column layout, the upload zone is typically above the result zone
      expect(uploadBox.y).toBeLessThan(resultBox.y);
      // Widths should be full or near full
      expect(uploadBox.width).toBeGreaterThan(300);
      expect(resultBox.width).toBeGreaterThan(300);
    }
  });
});
