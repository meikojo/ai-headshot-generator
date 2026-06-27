# Observation
- The Forensic Auditor report established that the previous implementation for `e2e/tier2` tests violated integrity.
- Tests like `08-layout-errors.spec.ts` bypassed assertions via `if (await locator.isVisible()) { expect(...) }`.
- Locators such as `page.getByRole('img', { name: /hero|headshot/i })` were used, but source code analysis (`src/components/Hero.tsx`) confirms no such `<img>` elements exist in the UI.
- The UI handles errors using `window.alert('Failed to generate headshot. Please try again.');` rather than inserting error messages into the DOM, as seen in `src/app/generate/page.tsx` line 84.
- `TEST_INFRA.md` requires 40 tests for Tier 2 covering boundaries, corner cases, and error states, with 5 per feature.
- `SCOPE.md` requires mocking network APIs (e.g., `page.route()`) instead of hitting real endpoints.

# Logic Chain
1. To address the integrity violation, tests must NEVER use conditional `if` checks wrapping their assertions. Assertions must be run unconditionally so tests correctly fail when elements are missing or incorrect.
2. Because the application handles errors via `window.alert` instead of rendering text in the DOM, asserting on `page.getByText('server error')` is conceptually flawed and guaranteed to fail. Instead, the tests must use `page.on('dialog', dialog => { ... })` to capture and verify the `alert` messages and accept them.
3. Tests must be based on actual implementation. Using fabricated element locators like `/hero|headshot/i` leads to bypassed or failing tests. The test writer must check the `src/` directory to construct locators that actually match the application implementation.
4. Implementing these rules while adhering to `TEST_INFRA.md` constraint of 5 tests per 8 features (40 total) ensures that boundary/error states are tested legitimately.

# Caveats
- No caveats; the constraints are strict and derived directly from the application source and the requirements specified.

# Conclusion
A remediation Test Plan for Tier 2 is required, mandating strict unconditional assertions, proper dialog handling for window alerts, and locators that map to the exact source code implementations.

### Remediation Test Plan for E2E Tier 2:
1. **Rule 1: Unconditional Assertions Only.** `if` statements checking for element visibility before `expect` assertions are explicitly banned. All Playwright assertions (`expect(...)`) must be unconditional.
2. **Rule 2: Dialog Handling for Alerts.** The app uses `window.alert` to present API/generation errors (e.g. "Failed to generate headshot..."). Do NOT test for DOM text for these errors. Use `page.on('dialog', async dialog => { expect(dialog.message()).toContain('Failed'); await dialog.accept(); });` to assert on error cases.
3. **Rule 3: Implementation-Matched Locators.** Test writers must read actual UI components in `src/` to determine the correct locators. Do not assume semantic tags or roles (like images in Hero) if they do not exist.
4. **Rule 4: Scope & Mocking Constraint.** Maintain the required scope: exactly 40 tests, 5 for each of the 8 features. Tests must focus on boundary, corner, and error states. Mock network calls using `page.route()` to trigger the specific error cases to be tested.

# Verification Method
1. Run `npx playwright test e2e/tier2/` - the tests should legitimately pass without skipping any assertions.
2. Execute `grep -rn "if.*isVisible" e2e/tier2/` (or similar regex) to ensure 0 results.
3. Inspect `e2e/tier2/*.spec.ts` to confirm `page.on('dialog')` is used for alert assertions.
