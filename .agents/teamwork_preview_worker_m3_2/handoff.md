# Observation
- The previous `e2e/tier2/*.spec.ts` files bypassed assertions using `if (await locator.isVisible())`, and asserted on DOM text for errors that are actually surfaced via `window.alert`, violating the application's actual implementation.
- `src/app/generate/page.tsx` catches API errors and calls `window.alert('Failed to generate headshot. Please try again.')`.
- `src/app/generate/page.tsx` tracks remaining freemium credits using `localStorage.setItem('headshot_count', ...)`.
- The `UploadZone.tsx` component relies on React Dropzone for validation messages, and renders them into the DOM with the class `.text-red-400`.
- The `PaywallModal.tsx` handles checkout failures silently with a `console.error` and leaves the modal open.
- The `ShareButton.tsx` handles clipboard actions directly via `navigator.clipboard.writeText` and a fallback `document.execCommand('copy')`, setting local state to update the UI button text to "Copied!".
- The `Hero.tsx` and `app/page.tsx` elements do not use `img` tags or expandable buttons for the FAQ, but rather static HTML elements.
- The `npx tsc --noEmit` command timed out waiting for user permission.

# Logic Chain
1. To enforce genuine, unconditional testing, all `if` blocks wrapping assertions were removed. The tests now assert `toBeVisible()`, `not.toBeVisible()`, or specific values unconditionally.
2. For generation errors, tests now use `page.on('dialog', async dialog => { ... })` to properly catch and verify the error messages thrown via `window.alert`, conforming exactly to how the application behaves on a 500, 429, or network abort.
3. For freemium limits, testing directly interacts with `localStorage.getItem('headshot_count')` and modifies it to trigger the Paywall.
4. For checkout errors, tests intercept `/api/credits/checkout` and simulate failures (500, network abort), asserting that the application fails silently while keeping the user on the pricing or paywall modal (since there is no error banner).
5. For share buttons, permissions are strictly manipulated using `context.grantPermissions` to trigger success and fallback behaviors for clipboard operations, which updates the UI.
6. For UI layout, bounded values (e.g. `boundingBox`) and viewport adjustments are tested on the actual implemented structure, rather than hallucinated components.
7. Exactly 5 tests were implemented per file (totaling 40 tests) as per `TEST_INFRA.md` requirements.

# Caveats
- Type checking via `npx tsc --noEmit` could not be executed locally due to the user approval timeout, but standard Playwright TypeScript types were used and inspected manually.

# Conclusion
The E2E Tier 2 testing suite has been entirely rewritten without conditional wrappers. It now rigorously tests the application's true error behaviors, limits, and edge cases, strictly adhering to the remediation constraints.

# Verification Method
- Execute `npx tsc --noEmit` to verify type checking.
- Execute `npx playwright test e2e/tier2/` to run all 40 tests. They should execute with 0 failures, and `grep` will show 0 instances of `if` wrappers around `expect` calls.
