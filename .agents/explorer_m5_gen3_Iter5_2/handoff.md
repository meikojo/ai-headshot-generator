# Handoff Report: E2E Tier 4 Scenarios

## 1. Observation
- **Compilation Error**: In `e2e/tier4/tier4-scenarios.spec.ts`, `const loader = page.getByRole...` is declared at line 181 and again at line 201 within the exact same block scope (the main body of "Test 2: should upgrade a free user..."). This results in a TypeScript `TS2451` SyntaxError (`Cannot redeclare block-scoped variable 'loader'.`).
- **Race Condition / Flaky Test**: In Tests 2 and 4, when the frontend initiates an image generation that exceeds the free tier limit, the mocked `/api/generate` endpoint returns a `403` immediately without any network latency. Meanwhile, the test uses `await expect(loader).not.toBeVisible()` immediately after the user clicks "Generate". Because Playwright evaluates this assertion instantly, it passes *before* the application state has enough time to render the loader, leading to a race condition and subsequent pointer interception errors on the paywall modal since Playwright proceeds too early.

## 2. Logic Chain
1. **Compilation fix**: By declaring `const loader` once near the top of the test function (e.g., around line 155 in Test 2, line 349 in Test 4) and removing the `const` redeclarations, we eliminate the TS2451 error and can reuse the locator elegantly.
2. **Race condition fix**: To accurately simulate the real-world wait times of API failures and allow the frontend state to transition properly, an artificial delay (e.g., `await new Promise((resolve) => setTimeout(resolve, 500));`) must be introduced to the 403 mock routes.
3. Once the 403 response is delayed, the loading spinner will mount for at least 500ms. We can therefore enforce a more rigorous assertion sequence: first `await expect(loader).toBeVisible()`, followed by `await expect(loader).not.toBeVisible()`. This strictly ensures Playwright waits for the loader to vanish entirely, preventing premature interaction with the modal.

## 3. Caveats
- I did not modify the actual source file (`e2e/tier4/tier4-scenarios.spec.ts`) because I am restricted to read-only actions for this investigation. 
- The artificial delay of `500ms` matches the existing delay for `200 OK` mock responses. Ensure this delay works reliably in CI, which it should since Playwright auto-retries assertions.

## 4. Conclusion
To resolve the compilation and race condition issues, we must:
1. Hoist `const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();` to the top of Tests 2 and 4.
2. Remove all subsequent block-scope declarations of `const loader` in those tests.
3. Inject a `500ms` delay into the `403` API mock fulfillments.
4. Replace `await expect(loader).not.toBeVisible()` with `await expect(loader).toBeVisible(); await expect(loader).not.toBeVisible();` when waiting for 403 failures.

Below are the exact code snippets that an implementation agent can apply.

## 5. Verification Method
- **TypeScript**: Run `npx tsc --noEmit` to verify the redeclaration syntax error is resolved.
- **Playwright Tests**: Run `npx playwright test e2e/tier4/tier4-scenarios.spec.ts` multiple times (e.g., with `--repeat-each 5`) to confirm that the tests are completely stable and not flaky. No pointer interception on the paywall modal should occur.

---

### Proposed Code Changes (Implementation Details)

**1. In Test 2 ("should upgrade a free user to paid..."):**

**Change A: Delay the 403 Response**
```typescript
// Before (around line 110)
      if (credits <= 0 && freeUsed >= 3) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded', credits, freeUsed })
        });
      }

// After
      if (credits <= 0 && freeUsed >= 3) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded', credits, freeUsed })
        });
      }
```

**Change B: Define `loader` once and update assertions**
```typescript
// Before (around lines 154-155)
    const fileInput = page.locator('input[type="file"]').first();
    const dummyImage = Buffer.from('fake-image');

// After
    const fileInput = page.locator('input[type="file"]').first();
    const dummyImage = Buffer.from('fake-image');
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
```

**Change C: Remove redeclarations and fix race condition**
```typescript
// Before (around line 170 in the loop)
      const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
      await expect(loader).toBeVisible();

// After
      await expect(loader).toBeVisible();
```

```typescript
// Before (around lines 180-182)
    // explicitly wait for the loading spinner to disappear
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
    await expect(loader).not.toBeVisible();

// After
    // explicitly wait for the loading spinner to appear and disappear
    await expect(loader).toBeVisible();
    await expect(loader).not.toBeVisible();
```

```typescript
// Before (around lines 200-202)
    // 9. Wait for the completed generation
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
    await expect(loader).toBeVisible();

// After
    // 9. Wait for the completed generation
    await expect(loader).toBeVisible();
```

**2. In Test 4 ("should handle subscription cancellation..."):**

**Change D: Delay the 403 Response**
```typescript
// Before (around line 296)
      if (credits <= 0 && freeUsed >= 3) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded', credits, freeUsed })
        });
      }

// After
      if (credits <= 0 && freeUsed >= 3) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Limit exceeded', credits, freeUsed })
        });
      }
```

**Change E: Define `loader` once and update assertions**
```typescript
// Before (around lines 349-350)
    const fileInput = page.locator('input[type="file"]').first();
    const dummyImage = Buffer.from('fake-image');

// After
    const fileInput = page.locator('input[type="file"]').first();
    const dummyImage = Buffer.from('fake-image');
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
```

**Change F: Remove redeclarations and fix race condition**
```typescript
// Before (around line 358 in the loop)
      const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
      await expect(loader).toBeVisible();

// After
      await expect(loader).toBeVisible();
```

```typescript
// Before (around lines 370-372)
    // explicitly wait for the loading spinner to disappear
    const loader = page.getByRole('progressbar').or(page.getByText(/loading/i)).first();
    await expect(loader).not.toBeVisible();

// After
    // explicitly wait for the loading spinner to appear and disappear
    await expect(loader).toBeVisible();
    await expect(loader).not.toBeVisible();
```
