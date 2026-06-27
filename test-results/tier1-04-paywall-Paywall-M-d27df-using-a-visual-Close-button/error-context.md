# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\04-paywall.spec.ts >> Paywall Modal & UI >> User can close modal using a visual "Close" button
- Location: e2e\tier1\04-paywall.spec.ts:33:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: net::ERR_CONNECTION_RESET at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Paywall Modal & UI', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_RESET at http://localhost:3000/
  6  |     // Set user to 0 credits via localStorage or just mock
  7  |     await page.evaluate(() => localStorage.setItem('credits', '0'));
  8  |     await page.reload();
  9  |   });
  10 | 
  11 |   test('Generating with 0 credits triggers paywall modal', async ({ page }) => {
  12 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  13 |     await page.getByRole('button', { name: /generate/i }).click();
  14 |     const modal = page.getByRole('dialog');
  15 |     await expect(modal).toBeVisible();
  16 |   });
  17 | 
  18 |   test('Modal is visible, traps focus (or role="dialog"), displays pricing', async ({ page }) => {
  19 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  20 |     await page.getByRole('button', { name: /generate/i }).click();
  21 |     const modal = page.getByRole('dialog');
  22 |     await expect(modal).toBeVisible();
  23 |     await expect(modal).toContainText(/\$\d+/);
  24 |   });
  25 | 
  26 |   test('Modal has a prominent "Upgrade" or "Subscribe" button', async ({ page }) => {
  27 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  28 |     await page.getByRole('button', { name: /generate/i }).click();
  29 |     const upgradeBtn = page.getByRole('dialog').getByRole('button', { name: /upgrade|subscribe/i });
  30 |     await expect(upgradeBtn).toBeVisible();
  31 |   });
  32 | 
  33 |   test('User can close modal using a visual "Close" button', async ({ page }) => {
  34 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  35 |     await page.getByRole('button', { name: /generate/i }).click();
  36 |     const closeBtn = page.getByRole('dialog').getByRole('button', { name: /close/i });
  37 |     await closeBtn.click();
  38 |     await expect(page.getByRole('dialog')).toBeHidden();
  39 |   });
  40 | 
  41 |   test('User can close modal using Escape key', async ({ page }) => {
  42 |     await page.locator('input[type="file"]').setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
  43 |     await page.getByRole('button', { name: /generate/i }).click();
  44 |     await expect(page.getByRole('dialog')).toBeVisible();
  45 |     await page.keyboard.press('Escape');
  46 |     await expect(page.getByRole('dialog')).toBeHidden();
  47 |   });
  48 | });
  49 | 
```