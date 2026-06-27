import { test, expect } from '@playwright/test';

test.describe('Tier 4 Scenarios: Real-World Application Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept Cloudinary upload
    await page.route('https://api.cloudinary.com/v1_1/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ secure_url: 'https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg' })
      });
    });
  });

  test('should complete a full free user flow from upload to social share', async ({ page }) => {
    let freeUsed = 0;

    await page.route('**/api/credits', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits: 0, freeUsed })
      });
    });

    await page.route('**/api/generate', async (route) => {
      if (freeUsed >= 3) {
        return route.fulfill({ status: 403, body: JSON.stringify({ error: 'Limit exceeded', freeUsed }) });
      }
      freeUsed++;
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultUrl: 'https://mock-image-url.com/headshot.png', freeUsed })
      });
    });

    // 1. Navigate to the landing page
    await page.goto('/');

    // 2. Verify Hero and FAQ sections are present
    await expect(page.getByRole('heading', { name: /hero|generate/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /faq/i }).first()).toBeVisible();

    // 3. Upload a valid image
    const dummyImage = Buffer.from('fake-image-content');
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: dummyImage,
    });

    // 4. Wait for the image preview to render
    const preview = page.locator('img[alt*="preview" i]').first();
    await expect(preview).toBeVisible();

    // Assume freemium generation count starts at 3 (so 3 remaining)
    const counterText = page.getByText(/generations remaining: 3/i);
    await expect(counterText).toBeVisible();

    // 5. Click "Generate AI Headshot"
    await page.getByRole('button', { name: /generate/i }).click();

    // 6. Observe the loading state
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
    await expect(loader).toBeVisible();

    // 7. Wait for the mocked generation to complete
    await expect(loader).not.toBeVisible();
    const resultImage = page.locator('img[alt*="generated" i], img[src*="mock-image-url"]').last();
    await expect(resultImage).toBeVisible();

    // 8. Verify the freemium generation count has decreased by 1
    const newCounterText = page.getByText(/generations remaining: 2/i);
    await expect(newCounterText).toBeVisible();

    // Verify watermark element
    await expect(page.locator('.watermark, [data-testid="watermark"]').or(page.getByText(/watermark/i)).first()).toBeVisible();

    // 9. Click "Download"
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();

    // 10. Click the "Share to Twitter" or "Copy Link" button
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: /share to twitter/i }).click()
    ]);
    expect(popup.url()).toContain('twitter.com');
  });

  test('should upgrade a free user to paid upon hitting the generation limit', async ({ page }) => {
    let freeUsed = 0;
    let credits = 0;

    await page.route('**/api/credits', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits, freeUsed })
      });
    });

    await page.route('**/api/generate', async (route) => {
      if (credits <= 0 && freeUsed >= 3) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded', credits, freeUsed })
        });
      }
      
      if (credits > 0) {
        credits--;
      } else {
        freeUsed++;
      }
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultUrl: 'https://mock-image-url.com/headshot.png', credits, freeUsed })
      });
    });

    // Mock Stripe Checkout Backend
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/pay/cs_test_123' })
      });
    });

    // Mock Stripe Checkout Redirect
    await page.route(/.*checkout\.stripe\.com.*/, async (route) => {
      credits = 100; // Give credits upon successful payment
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<html><script>window.location.href = 'http://localhost:3000/?success=true';</script></html>`
      });
    });

    // 1. Navigate to the app
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]').first();
    const dummyImage = Buffer.from('fake-image');
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();

    const uploadAndGenerate = async () => {
      await fileInput.setInputFiles({
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: dummyImage,
      });
      await expect(page.locator('img[alt*="preview" i]').first()).toBeVisible();
      await page.getByRole('button', { name: /generate/i }).click();
    };

    // 2. Exhaust the free tier limit
    for (let i = 0; i < 3; i++) {
      await uploadAndGenerate();
      await expect(loader).toBeVisible();
      await expect(loader).not.toBeVisible();
      await expect(page.locator('img[src*="mock-image-url"]').last()).toBeVisible();
      await page.getByRole('button', { name: /generate another/i }).click();
    }

    // 3. Upload a 4th image and click "Generate AI Headshot"
    await uploadAndGenerate();

    // explicitly wait for the loading spinner to appear then disappear
    await expect(loader).toBeVisible();
    await expect(loader).not.toBeVisible();

    // 4. Observe the Paywall Modal appearing
    const paywallModal = page.getByRole('dialog', { name: /upgrade/i }).or(page.getByText(/upgrade to pro/i)).first();
    await expect(paywallModal).toBeVisible();

    // 5. Click "Upgrade to Pro" within the modal
    await page.getByRole('button', { name: /upgrade to pro/i }).click();

    // 6. Simulate successful Stripe Checkout redirect
    await page.waitForURL('**/?success=true*');

    // 7. Return to the app and verify state
    await expect(page.getByText(/unlimited/i).or(page.getByText(/pro user/i).or(page.getByText(/credits:/i)))).toBeVisible();

    // 8. Attempt the 4th generation again
    await uploadAndGenerate();

    // 9. Wait for the completed generation
    await expect(loader).toBeVisible();
    await expect(loader).not.toBeVisible();
    await expect(page.locator('img[src*="mock-image-url"]').last()).toBeVisible();

    // 10. Download the image (should lack watermark)
    await expect(page.locator('.watermark, [data-testid="watermark"]').or(page.getByText(/watermark/i)).first()).not.toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('should allow an existing paid user to generate unwatermarked headshots without limits', async ({ page }) => {
    let credits = 100;
    
    // 1. Initialize session as an existing "Paid" user
    await page.route('**/api/credits', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits, freeUsed: 3 })
      });
    });

    await page.route('**/api/generate', async (route) => {
      if (credits <= 0) {
        return route.fulfill({ status: 403, body: JSON.stringify({ error: 'Limit exceeded', credits, freeUsed: 3 }) });
      }
      credits--;
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultUrl: 'https://mock-image-url.com/headshot.png', credits, freeUsed: 3 })
      });
    });

    // 2. Navigate to the app
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]').first();
    const dummyImage = Buffer.from('fake-image');

    // Assert user is Pro or has credits
    await expect(page.getByText(/unlimited/i).or(page.getByText(/pro user/i).or(page.getByText(/credits:/i)))).toBeVisible();

    // 6. Repeat upload and generate 5 times
    for (let i = 0; i < 5; i++) {
      // 3. Upload image
      await fileInput.setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: dummyImage });
      await expect(page.locator('img[alt*="preview" i]').first()).toBeVisible();
      
      // 4. Click Generate
      await page.getByRole('button', { name: /generate/i }).click();
      
      // 9. Wait for the completed generation
      const loaderFinal = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
      await expect(loaderFinal).toBeVisible();
      await expect(loaderFinal).not.toBeVisible();
      await expect(page.locator('img[src*="mock-image-url"]').last()).toBeVisible();
      
      // Verify no paywall
      await expect(page.getByRole('dialog', { name: /upgrade/i }).first()).not.toBeVisible();
      
      // Verify no watermark
      await expect(page.locator('.watermark, [data-testid="watermark"]').or(page.getByText(/watermark/i)).first()).not.toBeVisible();

      if (i < 4) {
        await page.getByRole('button', { name: /generate another/i }).click();
      }
    }

    // 7. Download the final image
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('should handle subscription cancellation and reflect downgraded access', async ({ page }) => {
    let credits = 100;
    let freeUsed = 3;

    // 1. Initialize session as a "Paid" user
    await page.route('**/api/credits', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ credits, freeUsed })
      });
    });

    await page.route('**/api/generate', async (route) => {
      if (credits <= 0 && freeUsed >= 3) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded', credits, freeUsed })
        });
      }
      
      if (credits > 0) {
        credits--;
      } else {
        freeUsed++;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultUrl: 'https://mock-image-url.com/headshot.png', credits, freeUsed })
      });
    });

    await page.goto('/');

    // 2. Navigate to "Billing" or "Account" section
    await page.getByRole('button', { name: /account/i }).click();

    // 3. Click "Manage Subscription"
    await page.route('**/api/portal', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://billing.stripe.com/p/session/test' })
      });
    });

    await page.route(/.*billing\.stripe\.com.*/, async (route) => {
      // 4. Simulate returning from portal with Cancelled status
      credits = 0;
      freeUsed = 0; // Reset free tier equivalent
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<html><script>window.location.href = 'http://localhost:3000/?cancelled=true';</script></html>`
      });
    });

    await page.getByRole('button', { name: /manage subscription/i }).click();
    await page.waitForURL('**/?cancelled=true*');

    // Verify UI reflects transition
    await expect(page.getByText(/generations remaining: 3/i)).toBeVisible();

    const fileInput = page.locator('input[type="file"]').first();
    const dummyImage = Buffer.from('fake-image');
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();

    // 5. Upload and generate until hitting the limit again
    for (let i = 0; i < 3; i++) {
      await fileInput.setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: dummyImage });
      await expect(page.locator('img[alt*="preview" i]').first()).toBeVisible();
      await page.getByRole('button', { name: /generate/i }).click();
      
      await expect(loader).toBeVisible();
      await expect(loader).not.toBeVisible();
      await expect(page.locator('img[src*="mock-image-url"]').last()).toBeVisible();
      await page.getByRole('button', { name: /generate another/i }).click();
    }

    // Attempt 4th generation
    await fileInput.setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: dummyImage });
    await expect(page.locator('img[alt*="preview" i]').first()).toBeVisible();
    await page.getByRole('button', { name: /generate/i }).click();

    // explicitly wait for the loading spinner to appear then disappear
    await expect(loader).toBeVisible();
    await expect(loader).not.toBeVisible();

    // 6. Verify Paywall modal appears
    await expect(page.getByRole('dialog', { name: /upgrade/i }).or(page.getByText(/upgrade to pro/i)).first()).toBeVisible();
  });

});
