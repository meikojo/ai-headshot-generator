# Handoff Report: E2E Tier 4 Scenarios Test Fixes

## 1. Observation
- Investigated `d:/ai-headshot-generator/e2e/tier4/tier4-scenarios.spec.ts` for the reported defects.
- **`credits--` logic flaw and `freeUsed` increment**: In Test 2 (lines 109-128) and Test 4 (lines 289-308), the `/api/generate` mock unconditionally consumes credits or increments `freeUsed` before checking limits. For example, if a user has 1 credit and `freeUsed > 3`, `credits` becomes 0, and the limit check `credits <= 0 && freeUsed > 3` erroneously rejects the generation. It also increments `freeUsed` beyond the limit of 3, even on 403 responses.
- **Missing loading spinner wait**: In Test 2 (line 178) and Test 4 (line 362), the test asserts the Paywall Modal becomes visible right after clicking "Generate", without waiting for the loading state to complete and disappear on a 403 rejection. This risks pointer interception when the app renders a loader overlay.
- **Missing updated counts in API response**: Across all 4 tests, the successful 200 response for `/api/generate` returns only `resultUrl` and omits the updated `credits` and `freeUsed` fields, which the frontend might need for UI consistency.

## 2. Logic Chain
1. By refactoring the mock logic to conditionally decrement `credits` or increment `freeUsed` **only if** the user is allowed to generate, we fix both the `credits--` logic flaw (1 credit won't incorrectly trigger 403) and prevent `freeUsed` from incrementing on failures.
2. Including `credits` and `freeUsed` in the 200 response payloads for `**/api/generate` fulfills the frontend's potential dependency on fresh counter values post-generation.
3. Adding `await expect(page.getByRole('progressbar').or(page.getByText(/loading/i)).first()).not.toBeVisible();` after the `generate` action but before interacting with the paywall modal ensures Playwright doesn't attempt to click through a fading loader.

## 3. Caveats
- The changes strictly address the logic in the Playwright test mocks. It assumes the frontend correctly handles the 403 rejection and reveals the modal, as no frontend source was examined.
- The `freeUsed` limit is hardcoded as `3` based on the original test structure.

## 4. Conclusion
We must rewrite the `/api/generate` intercept mocks in all 4 tests to follow an atomic check-then-consume pattern and include updated counts in their responses. We also need to add a loader disappearance wait in Test 2 and Test 4 immediately following the 4th generation attempt.

## 5. Verification Method
1. Run the test command: `cd d:/ai-headshot-generator && npx playwright test e2e/tier4/tier4-scenarios.spec.ts`
2. Verify all 4 scenarios pass successfully.
3. Observe Playwright trace or console to confirm the paywall modal is clicked without pointer interception errors.

## Proposed Code Changes

### Change 1: Update API Mock in Test 1
**Target:** `e2e/tier4/tier4-scenarios.spec.ts` (lines 27-38)
```typescript
    await page.route('**/api/generate', async (route) => {
      if (freeUsed >= 3) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded' })
        });
      }
      freeUsed++;
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultUrl: 'https://mock-image-url.com/headshot.png', credits: 0, freeUsed })
      });
    });
```

### Change 2: Update API Mock in Test 2
**Target:** `e2e/tier4/tier4-scenarios.spec.ts` (lines 109-128)
```typescript
    await page.route('**/api/generate', async (route) => {
      let allowed = false;
      if (credits > 0) {
        credits--;
        allowed = true;
      } else if (freeUsed < 3) {
        freeUsed++;
        allowed = true;
      }
      
      if (!allowed) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded' })
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultUrl: 'https://mock-image-url.com/headshot.png', credits, freeUsed })
      });
    });
```

### Change 3: Wait for loader in Test 2
**Target:** `e2e/tier4/tier4-scenarios.spec.ts` (insert around line 178)
```typescript
    // Wait for the loader to disappear before checking modal
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
    await expect(loader).not.toBeVisible();
```

### Change 4: Update API Mock in Test 3
**Target:** `e2e/tier4/tier4-scenarios.spec.ts` (lines 221-232)
```typescript
    await page.route('**/api/generate', async (route) => {
      if (credits <= 0) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded' })
        });
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

### Change 5: Update API Mock in Test 4
**Target:** `e2e/tier4/tier4-scenarios.spec.ts` (lines 289-308)
```typescript
    await page.route('**/api/generate', async (route) => {
      let allowed = false;
      if (credits > 0) {
        credits--;
        allowed = true;
      } else if (freeUsed < 3) {
        freeUsed++;
        allowed = true;
      }
      
      if (!allowed) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded' })
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultUrl: 'https://mock-image-url.com/headshot.png', credits, freeUsed })
      });
    });
```

### Change 6: Wait for loader in Test 4
**Target:** `e2e/tier4/tier4-scenarios.spec.ts` (insert around line 362)
```typescript
    // Wait for loader to disappear
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
    await expect(loader).not.toBeVisible();
```
