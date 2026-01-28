---
description: Run all necessary checks (lint, type-check, unit tests, build) before committing code.
---

// turbo-all

This workflow performs fast local validation before committing. E2E tests are run in CI only.

1. Ensure you are in the project root directory.

2. Check for any tests that are superficial (e.g. empty tests, or tests with no valid assertions). If any are found, remove them.

3. Run ESLint to check for code quality issues:

   ```bash
   npm run lint
   ```

4. Run TypeScript to check for type errors:

   ```bash
   npx tsc --noEmit
   ```

5. Run Unit and Component tests using Jest:

   ```bash
   npm run test
   ```

6. Perform a production build to ensure everything compiles correctly:
   ```bash
   npm run build
   ```

---

## Additional Checks (Run Manually or in CI)

### E2E Tests

E2E tests are excluded from pre-commit for speed and reliability. Run them:

- **In CI**: Automatically on every PR/push
- **Locally (when needed)**:
  ```bash
  npm run dev        # Start dev server in one terminal
  npm run test:e2e   # Run E2E tests in another terminal
  ```

**Note**: E2E tests require a running dev server on port 3000.
