---
description: Run all necessary checks (lint, type-check, unit/e2e tests, build) before committing code.
---

// turbo-all

1. Ensure you are in the project root directory.
2. Run ESLint to check for code quality issues:
   ```bash
   npm run lint
   ```
3. Run TypeScript to check for type errors:
   ```bash
   npx tsc --noEmit
   ```
4. Run Unit and Component tests using Jest:
   ```bash
   npm run test
   ```
5. Run End-to-End tests using Playwright:
   ```bash
   npm run test:e2e
   ```
6. Perform a production build to ensure everything compiles correctly:
   ```bash
   npm run build
   ```
