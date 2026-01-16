# Contributing to Art Portfolio

Welcome! We're glad you're here. This guide will help you get started with contributing to the Art Portfolio project while maintaining our high standards for code quality, security, and performance.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (for local development or testing)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Set up your environment variables:
   Copy `.env.example` to `.env.local` and fill in your Supabase and Cloudinary credentials.
   ```bash
   cp .env.example .env.local
   ```

### Local Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## 🛠 Workflow

### Branching Strategy

- `main`: Production-ready code.
- Feature branches: `feature/your-feature-name`
- Bug fixes: `fix/issue-description`

### Commit Message Convention

We follow basic conventional commits:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests

### Pull Request Process

1. Create a branch from `main`.
2. Ensure all tests pass (`npm run test` and `npm run test:e2e`).
3. Ensure the linter and type-checker are happy (`npm run lint` and `npx tsc --noEmit`).
4. Submit your PR and wait for review.

## 📐 Coding Standards

### TypeScript: Extreme Hardening

- **No `any`**: The use of `any` is strictly prohibited in production and test code.
  - If a type is complex (e.g., Supabase joins), define a specific interface at the repository or component level.
  - Use `unknown` with type guards or assertions only when truly necessary.
  - For environment variables, use conditional Zod schemas instead of `any` casts to handle CI fallbacks.
- **Strict Mode**: Ensure `strict: true` in `tsconfig.json` is respected. Build failures will occur on any implicit or explicit type violations.

### CSS: Vanilla CSS

- Use Vanilla CSS for maximum flexibility.
- Follow a consistent naming convention (BEM or similar) if not using CSS Modules.
- Prioritize responsive design (Mobile-First).

### Testing: TDD Mandatory

- **Red-Green-Refactor**: Write a failing test before writing any production code.
- **Unit Tests**: Use Jest and React Testing Library for business logic and components.
  ```bash
  npm run test
  ```
- **E2E Tests**: Use Playwright for critical user flows.
  ```bash
  npm run test:e2e
  ```

## 🔒 Security & Performance

### Environment Validation

All critical environment variables are validated at build time/startup using `zod` in `lib/env.ts`. If you add a new required variable, update the schema there.

### Content Security Policy (CSP)

Security headers are managed via `proxy.ts`. Ensure any new external services are added to the appropriate CSP directives.

### Performance Monitoring

We use Next.js experimental analyzer for Turbopack. You can analyze the bundle size using:

```bash
npm run analyze
```

## ❓ Troubleshooting

- **Invalid Environment Variables**: Check that your `.env.local` contains all required keys defined in `lib/env.ts`.
- **Date Errors**: Ensure database dates (snake_case) are properly mapped to JS Date objects in the service layer.
