# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1\08-layout.spec.ts >> UI Layout >> Semantic HTML landmarks (<header>, <main>, <footer>) are present
- Location: e2e\tier1\08-layout.spec.ts:35:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('UI Layout', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  6  |   });
  7  | 
  8  |   test('Hero section is visible with an h1', async ({ page }) => {
  9  |     const heading = page.locator('h1');
  10 |     await expect(heading).toBeVisible();
  11 |     await expect(heading).not.toBeEmpty();
  12 |   });
  13 | 
  14 |   test('Hero CTA focuses/navigates to file upload', async ({ page }) => {
  15 |     const cta = page.getByRole('button', { name: /get started/i });
  16 |     await cta.click();
  17 |     const uploadInput = page.locator('input[type="file"]');
  18 |     await expect(uploadInput).toBeAttached();
  19 |   });
  20 | 
  21 |   test('FAQ section is visible with multiple questions', async ({ page }) => {
  22 |     const faqs = page.locator('.faq-item');
  23 |     expect(await faqs.count()).toBeGreaterThan(1);
  24 |   });
  25 | 
  26 |   test('Clicking FAQ item expands to reveal answer', async ({ page }) => {
  27 |     const faqButton = page.locator('.faq-item button').first();
  28 |     const faqAnswer = page.locator('.faq-item .answer').first();
  29 |     
  30 |     await expect(faqAnswer).toBeHidden();
  31 |     await faqButton.click();
  32 |     await expect(faqAnswer).toBeVisible();
  33 |   });
  34 | 
  35 |   test('Semantic HTML landmarks (<header>, <main>, <footer>) are present', async ({ page }) => {
  36 |     await expect(page.locator('header')).toBeVisible();
  37 |     await expect(page.locator('main')).toBeVisible();
  38 |     await expect(page.locator('footer')).toBeVisible();
  39 |   });
  40 | });
  41 | 
```