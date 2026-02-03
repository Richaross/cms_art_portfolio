# 🎨 Art Portfolio & CMS

A high-performance, dark-themed art portfolio website featuring a custom Content Management System (CMS), integrated directly with Supabase and Cloudinary. This application serves as a comprehensive platform for artists to showcase their work, manage sales through limited drops, and publish news updates.

## 🖼️ Demo Gallery

<div align="center">

![Landing Hero](./README_images/image.png)  
_Landing Hero_

![About Section](./README_images/image-1.png)  
_About Section_

![Portfolio - Collections](./README_images/image-2.png)  
_Portfolio - Collections_

![Portfolio - Items](./README_images/image-3.png)  
_Portfolio - Items_

![News - Preview](./README_images/image-4.png)  
_News - Preview_

![News - Modal](./README_images/image-5.png)  
_News - Modal_

</div>

## ⚡ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Image Hosting**: [Cloudinary](https://cloudinary.com/) (Upload Widget & Management API)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Monitoring**: [Sentry](https://sentry.io/) (Error tracking & performance monitoring)
- **Testing**: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/react) & [Playwright](https://playwright.dev/)

---

## ✨ Features & Architecture

### 1. Public Portfolio

- **Dynamic Landing Hero**: Fully customizable immersive introduction. Artists can manage title, background image, and dimming intensity via the CMS.
- **Social Integration**: High-visibility links to Instagram, LinkedIn, Facebook, WhatsApp, and X.
- **Vertical Storytelling**: A redesigned portfolio experience that uses high-impact, full-width vertical scrolling for collections.
- **Interactive Shop Window**: Real-time commerce integration with a sleek popup "Shop Window" for for-sale items.
- **Archival Branding**: Premium "Archival" tags for pieces in private collections.
- **Inventory Management**: Real-time stock counts, pricing, and "For Sale" status toggles.

### 2. Custom CMS (Dashboard)

- **Service Layer Architecture**: Decoupled domain logic from Server Actions into dedicated services (`PortfolioService`, `NewsService`, `CloudinaryService`, `AboutService`, `HeroService`) for better testability and maintainability.
- **Dynamic Content Management**: A dedicated Hero Section editor to customize the landing page experience without touching code.
- **Bulk Item Operations**: Select and manage multiple portfolio items simultaneously:
  - **Bulk Delete**: Remove multiple items with confirmation and automatic Cloudinary cleanup
  - **Bulk Price Updates**: Update pricing for multiple items at once
  - **Bulk Sale Status**: Toggle "On Sale" or "Hidden" status for selected items
  - **Quick Sort**: Rapidly organize items by Date, Name (A-Z), or Price
- **Strict Type Safety**: 100% type-safe codebase using generated Supabase types and domain-driven interfaces.
- **Automated Image Cleanup**: Built-in hooks to ensure that deleting a record permanently removes the asset from Cloudinary.
- **Integrated Monitoring**: Sentry integration for real-time error capture and UI error state logging.

### 3. Database Schema (Supabase)

The application uses a relational PostgreSQL schema (validated via `schema_v4_items.sql`):

- `sections`: Parent container for collections.
- `section_items`: Individual artworks linked to sections.
- `inventory`: Real-time commerce details.
- `news_posts`: Blog content and updates.
- `about_info`: Artist biography and portrait data.
- `hero_settings`: Singleton table for landing page customization.

### 4. Quality Assurance & CI/CD

- **Test-First Culture**: Strict adherence to TDD principles. Every feature is backed by failing unit tests before implementation.
- **Comprehensive Test Coverage**: 62 passing tests across 14 test suites
  - **Unit Tests**: Jest + React Testing Library for components and services
  - **E2E Tests**: Playwright smoke tests for critical user flows
  - **Modern Testing Practices**: Migrated to `@testing-library/user-event` for realistic user interactions
  - **Bulk Actions Coverage**: Full test coverage for selection, delete, and update operations
- **Optimized Pre-Commit Workflow**: Fast local validation (~29s) running lint, type-check, unit tests, and build
- **CI Pipeline**: GitHub Actions running linting, type-checks, unit tests (Jest), and E2E smoke tests (Playwright) on every PR.
- **Git Hooks**: Husky and `lint-staged` enforce code quality and formatting (Prettier) before every commit.

---

## 🚀 Getting Started

### Installation

1. **Clone the repository and install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
   NEXT_PUBLIC_CLOUDINARY_API_KEY=...
   NEXT_PUBLIC_CLOUDINARY_API_SECRET=...
   NEXT_PUBLIC_SENTRY_DSN=...
   SENTRY_AUTH_TOKEN=...
   ```

3. **Database Setup:**
   Apply `schema_v4_items.sql` and `schema_v5_hero.sql` in the Supabase SQL Editor.

### Development & Testing

- **Dev Server**: `npm run dev`
- **Unit Tests**: `npm run test`
- **E2E Tests**: `npm run test:e2e`
- **CI Simulation**: `npm run test:ci` (Lint + Test + E2E + Build)

---

## 📂 Project Structure

```
app/
├── app/                  # Next.js App Router root
│   ├── actions/          # Server Actions (Calling services)
│   ├── domain/           # Domain models & abstractions
│   ├── lib/services/     # Business logic layer (Service classes)
│   └── ...               # App Router pages (dashboard, login, page.tsx)
├── components/           # React Components
│   ├── cms/              # Dashboard Editors (SectionEditor, NewsEditor)
│   └── ui/               # Shared UI elements
├── lib/                  # Infrastructure (Supabase client, Cloudinary, Sentry)
├── types/                # Database and Global type definitions
└── e2e/                  # Playwright end-to-end tests
```

---

## 🏁 Production Readiness Gap Analysis

Based on the latest report, the following critical steps were identified and have been implemented:

| Category          | Component                                                                                             | Status    | Implementation                                          |
| :---------------- | :---------------------------------------------------------------------------------------------------- | :-------- | :------------------------------------------------------ |
| **Code Quality**  | Prettier & Husky                                                                                      | ✅ Jan 15 | Automated formatting and pre-commit linting hooks.      |
| **Monitoring**    | Sentry                                                                                                | ✅ Jan 15 | Real-time error tracking and performance profiling.     |
| **Type Safety**   | Extreme Hardening                                                                                     | ✅ Jan 16 | Elimination of `any` types across the entire core.      |
| **Security**      | Env Validation (Zod)                                                                                  | ✅ Jan 16 | Build-time validation of required secrets.              |
| **Performance**   | Build Analysis (Turbopack)                                                                            | ✅ Jan 16 | Monitoring client-side JS via `--experimental-analyze`. |
| **Documentation** | [CONTRIBUTING.md](file:///c:/Users/Richaross/Documents/Projects/06_art_portfolio/app/CONTRIBUTING.md) | ✅ Jan 16 | Guidelines for future dev onboardings.                  |

---

## 🔮 Future Updates & Roadmap

### 1. Automated Testing Suite ✅

- **Unit Testing**: ✅ Implemented `Jest` and `React Testing Library` for utility functions and complex components.
- **E2E Testing**: ✅ Set up `Playwright` with smoke tests for critical user flows.

### 2. CI/CD Pipeline ✅

- **GitHub Actions**: ✅ Established pipeline to run linter, type checks, and tests on every Pull Request.
- **Build Checks**: ✅ Ensure the application compiles successfully before merging.

### 3. Code Quality & Standards ✅

- **Prettier**: ✅ Enforced consistent code formatting.
- **Husky & Lint-Staged**: ✅ Quality checks are enforced at the commit level.
- **Type Hardening**: ✅ 100% strict typing achievement.

### 4. Monitoring & Performance ✅

- **Error Logging**: ✅ Jan 15. Sentry integrated.
- **Performance**: ✅ Jan 16. Implemented `--experimental-analyze`.
- **Security**: ✅ Jan 16. Added `zod` validation.

### 5. Security Hardening

- **CSP**: ✅ Jan 16. Implemented via `proxy.ts`.
- **Env Validation**: ✅ Jan 16. Implemented using `zod`.

### 6. Phase 2: Advanced CMS Features 🚧

- **Portfolio Reordering (Drag & Drop)**:
  - ✅ **Jan 26**. Manual sorting of Collections on the landing page (with keyboard support).
  - ✅ **Jan 26**. Drag-and-drop sorting of Items, including **Quick Sort** (Date/A-Z/Price).
- **Bulk Item Operations**:
  - ✅ **Jan 28**. Multi-select functionality for portfolio items.
  - ✅ **Jan 28**. Bulk delete with confirmation and Cloudinary cleanup.
  - ✅ **Jan 28**. Bulk price updates and sale status toggling.
- **Enhanced Content Editor**:
  - ✅ **Jan 25**. Support for **Hyperlinks** and basic formatting in descriptions (Tiptap).
  - ✅ **Jan 25**. Draft vs. Published status for News and Portfolio items.
  - ✅ **Jan 25**. Scheduled posting for News content.
- **Test Infrastructure Modernization**:
  - ✅ **Jan 28**. Migrated to `@testing-library/user-event` for better test reliability.
  - ✅ **Jan 28**. Comprehensive test coverage for Bulk Actions (62 passing tests).
  - ✅ **Jan 28**. E2E test refactoring with Playwright best practices.
  - ✅ **Jan 28**. Optimized pre-commit workflow (removed E2E, ~29s execution).
- **Media Library & Asset Management** 🚧:
  - **Centralized Library**: Reusable assets with tagging and advanced search.
  - **Smart Covers**: Logic to auto-assign "In Progress" placeholders or select covers from collection items.
  - **Advanced Imaging**: In-CMS image cropping with live preview (`react-easy-crop`).
  - **Contextual SEO**: Global Alt-Text defaults with support for per-context overrides.
- **Artist Analytics (TBD)**:
  - Dashboard for tracking artwork views and site engagement.
