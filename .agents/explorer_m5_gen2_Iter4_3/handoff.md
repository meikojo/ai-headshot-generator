# Handoff Report: E2E Tier 4 Test Fixes

## 1. Observation
- The user reported four remaining defects in `e2e/tier4/tier4-scenarios.spec.ts`:
  1. `credits--` logic flaw consuming the last credit but rejecting generation.
  2. Incorrect `freeUsed` incrementing on failed generations.
  3. Missing loading spinner wait causing potential pointer interception.
  4. Missing updated counts in the `/api/generate` mock responses.
- In `e2e/tier4/tier4-scenarios.spec.ts`, multiple `**/api/generate` route mocks (lines 27-38, 109-128, 221-232, 289-308) perform side-effects (`credits--`, `freeUsed++`) **before** evaluating the failure condition (`if (credits <= 0 && freeUsed > 3)`). 
- If a user has exactly 1 credit, the mock decrements it to `0`. Then the check `credits <= 0` passes, and if `freeUsed > 3` is also true, it returns `403`. This consumes the credit but blocks generation.
- Similarly, `freeUsed` increments to `4` before the check, meaning a free attempt fails but still increments the `freeUsed` counter.
- The `403` responses only return `{ error: 'Limit exceeded' }` without any updated `credits` or `freeUsed` counts.
- At lines 176 and 360, the test uploads a 4th image (triggering a 403) and immediately checks `expect(paywallModal).toBeVisible()`. In a realistic UI, a loading spinner might still be active and block the interaction before the modal fully resolves. There is no `await expect(loader).not.toBeVisible()` prior to checking the paywall.

## 2. Logic Chain
1. **To fix the `credits--` and `freeUsed` flaws**, the mocks must evaluate the limit constraint **before** modifying the counts.
   - For free usage: `if (freeUsed >= 3) { return 403; } freeUsed++;`
   - For credits: `if (credits <= 0 && freeUsed >= 3) { return 403; } if (credits > 0) credits--; else freeUsed++;`
2. **To fix missing updated counts**, all `route.fulfill` calls (both 200 and 403) must include the `credits` and `freeUsed` variables in the JSON response body.
3. **To fix the missing loading spinner wait**, after `uploadAndGenerate()` on the 4th attempt, we must retrieve the `loader` element and explicitly `await expect(loader).not.toBeVisible()` before interacting with or asserting the visibility of the Paywall modal. This ensures the 403 response has fully propagated to the UI state and any loaders have demounted.

## 3. Caveats
- No caveats. The issues were clearly reproducible from the mock implementation logic. The fixes are localized to the e2e test file. Since I have read-only access to source code, I am providing exact replacement snippets below.

## 4. Conclusion
The e2e test file `e2e/tier4/tier4-scenarios.spec.ts` needs structural updates to the API generation mocks and the DOM synchronization logic for the paywall. 

**Recommended Code Changes:**

**A. Test 1 Mock (lines 27-38)**
```typescript
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
```

**B. Test 2 Mock (lines 109-128)**
```typescript
    await page.route('**/api/generate', async (route) => {
      if (credits <= 0 && freeUsed >= 3) {
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
```

**C. Test 3 Mock (lines 221-232)**
```typescript
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
```

**D. Test 4 Mock (lines 289-308)**
*(Same logic as Test 2 Mock).*
```typescript
    await page.route('**/api/generate', async (route) => {
      if (credits <= 0 && freeUsed >= 3) {
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
```

**E. Loading Spinner Wait for Test 2 (after line 176)**
```typescript
    // 3. Upload a 4th image and click "Generate AI Headshot"
    await uploadAndGenerate();

    // explicitly wait for the loading spinner to disappear
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
    await expect(loader).not.toBeVisible();

    // 4. Observe the Paywall Modal appearing
```

**F. Loading Spinner Wait for Test 4 (after line 360)**
```typescript
    // Attempt 4th generation
    await fileInput.setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: dummyImage });
    await expect(page.locator('img[alt*="preview" i]').first()).toBeVisible();
    await page.getByRole('button', { name: /generate/i }).click();

    // explicitly wait for the loading spinner to disappear
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
    await expect(loader).not.toBeVisible();

    // 6. Verify Paywall modal appears
```

## 5. Verification Method
- Apply the code changes.
- Run `npm run test:e2e` or `npx playwright test e2e/tier4/tier4-scenarios.spec.ts`.
- The tests should pass cleanly without flakiness related to pointer interception on the paywall modal, and mock logic should correctly maintain credit limits.
