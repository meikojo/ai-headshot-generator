# Handoff Report: Tier 4 Scenarios Test Review

## 1. Observation
I reviewed `d:/ai-headshot-generator/e2e/tier4/tier4-scenarios.spec.ts`. 

In both the `should upgrade a free user to paid upon hitting the generation limit` (Test 2) and `should handle subscription cancellation and reflect downgraded access` (Test 4) scenarios, the `**/api/generate` route is mocked with the following logic (e.g., lines 109-121):

```javascript
    await page.route('**/api/generate', async (route) => {
      if (credits > 0) {
        credits--;
      } else {
        freeUsed++;
      }
      if (credits <= 0 && freeUsed > 3) {
        return route.fulfill({
          status: 403,
          // ...
```

This mock logic separates state mutation (`credits--`) from condition evaluation (`credits <= 0 && freeUsed > 3`).

## 2. Logic Chain
1. Suppose a user exhausts their free tier (`freeUsed` becomes `4`), which correctly triggers the paywall since `credits = 0`.
2. The user buys exactly 1 credit (`credits` becomes `1`). `freeUsed` remains `4`.
3. The user attempts to generate an image. The mock intercepts the request.
4. `credits > 0` evaluates to `true` (since `1 > 0`), so `credits--` executes. `credits` is now `0`.
5. The mock then evaluates `if (credits <= 0 && freeUsed > 3)`. Since `credits` is now `0` and `freeUsed` is still `4`, this condition evaluates to `true`.
6. The mock immediately fulfills the request with a `403 Limit exceeded` status.

## 3. Caveats
- Since Playwright tests could not be run dynamically due to a prompt timeout, this flaw was discovered via manual static analysis of the mock logic.
- The tests currently pass because the Stripe Checkout mock sets `credits = 100`. When `credits` decreases to `99`, `credits <= 0` is false, masking the bug. 
- Test 3 uses simpler, correct mock logic (`if (credits < 0) return 403;`) and avoids this defect.

## 4. Conclusion
**Risk Assessment: CRITICAL (Test Defect)**
There is a critical logical flaw in the test mock for `**/api/generate` in Test 2 and Test 4. This is the exact same `credits--` logical flaw seen in previous tiers. It will incorrectly reject paid generations and consume the user's final credit, failing to simulate correct backend behavior if `credits = 1`.

The mock logic should be updated to evaluate rejection based on the *state prior to deduction*, or refactored to:
```javascript
      if (credits > 0) {
        credits--;
      } else {
        freeUsed++;
        if (freeUsed > 3) {
          return route.fulfill({ status: 403, /* ... */ });
        }
      }
```

## 5. Verification Method
- Change the `credits = 100` assignment in Test 2 (line 141) to `credits = 1`.
- Run the Playwright test: `npx playwright test e2e/tier4/tier4-scenarios.spec.ts`.
- The test will fail at the 8th step ("Attempt the 4th generation again") because the `**/api/generate` mock will incorrectly return a `403` instead of a `200`, causing the UI to show the paywall again instead of the generated image.
