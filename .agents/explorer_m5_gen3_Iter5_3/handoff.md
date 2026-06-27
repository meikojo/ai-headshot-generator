# Handoff Report: E2E Tier 4 Scenarios Fix

## 1. Observation
1. Compilation Error: In `e2e/tier4/tier4-scenarios.spec.ts` Test 2 (`should upgrade a free user to paid upon hitting the generation limit`), `const loader` was declared multiple times in the same function scope (lines 170, 181, 201), leading to a TS2451 SyntaxError. The same pattern was present in Test 4.
2. Race Condition: In Test 2 and Test 4, the 403 API mock response for the generate endpoint was resolving instantly without delay. This caused the assertion `await expect(loader).not.toBeVisible()` to execute and pass instantly before the UI had a chance to render the loader. The UI then proceeded to show the loader asynchronously while the test logic raced ahead.

## 2. Logic Chain
1. To fix the duplicate declaration compilation error, the `loader` locator was extracted to the top of the test blocks (just below the input and dummy image declarations). Reassignments of `const loader = ...` throughout Test 2 and Test 4 were replaced to use this top-level variable instead.
2. To fix the race condition causing the tests to be flaky, an artificial delay (`await new Promise(resolve => setTimeout(resolve, 500));`) was added to the 403 API response in Test 2 and Test 4 mock setup logic. 
3. With the delay established, the test flow was modified to correctly verify the loading state transitions. The previous logic of `await expect(loader).not.toBeVisible()` (which trivially passed) was upgraded to explicitly verify the mount and unmount cycle:
   ```typescript
   await expect(loader).toBeVisible();
   await expect(loader).not.toBeVisible();
   ```

## 3. Caveats
- Added explicit artificial delays of 500ms to the 403 response mocks, which slightly increases the test duration by ~500ms per 403 hit. This is acceptable for E2E tests simulating network latency and ensures DOM updates properly trigger Playwright's visibility assertions.
- We did not alter the core application design or change backend assumptions, adhering to the opaque-box test constraints.

## 4. Conclusion
The compilation error TS2451 has been resolved by extracting the `loader` variable to the top of the test cases. The race condition around the 403 response has been addressed by introducing network latency simulation and enforcing strong `toBeVisible()` -> `not.toBeVisible()` transitions to ensure the application state catches up. Both Test 2 and Test 4 were patched accordingly.

## 5. Verification Method
- **Static Analysis**: Verify compilation by running TypeScript compiler `npx tsc --noEmit` on the e2e suite.
- **E2E Testing**: Run the targeted tests using the Playwright runner: `npx playwright test e2e/tier4/tier4-scenarios.spec.ts`.
- **Spot Check**: Review `d:/ai-headshot-generator/e2e/tier4/tier4-scenarios.spec.ts` manually to confirm that the `const loader` is only defined once in Test 2 and Test 4 scopes and that artificial `setTimeout` delays exist before the 403 response triggers.
