# 🎨 Art Portfolio & CMS

A high-performance, dark-themed art portfolio website featuring a custom Content Management System (CMS), integrated directly with Supabase and Cloudinary. This application serves as a comprehensive platform for artists to showcase their work, manage sales through limited drops, and publish news updates.

## ⚡ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Image Hosting**: [Cloudinary](https://cloudinary.com/) (Upload Widget & Management API)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Payments**: Integrated Stripe links for direct purchasing.
- **Testing**: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/react) & [Playwright](https://playwright.dev/)

---

## ✨ Features & Architecture

### 1. Public Portfolio

- **Landing Hero**: Immersive, high-impact introduction to the artist's work.
- **Portfolio System**: Structured around **Collections**, allowing for grouping multiple artworks under thematic headers.
- **Deep Zoom & Detail Modal**: Immersive viewer for individual artworks with full metadata.
- **Inventory Management**: Real-time stock counts, pricing, and "For Sale" status toggles.
- **Stripe Integration**: Direct purchase links for archival or limited edition works.

### 2. Custom CMS (Dashboard)

- **Service Layer Architecture**: Decoupled domain logic from Server Actions into dedicated services (`PortfolioService`, `NewsService`, `CloudinaryService`) for better testability and maintainability.
- **Collection Management**: Full CRUD for collections and nested items with drag-and-drop ordering.
- **Image Management**: Automated Cloudinary cleanup; deleting a record permanently removes its associated asset.
- **News & Updates**: Categorized blog system (Exhibitions, Press, General) with external link support.
- **About Editor**: Real-time updates for biography and portrait images.

### 3. Database Schema (Supabase)

The application uses a relational PostgreSQL schema (validated via `schema_v4_items.sql`):

- `sections`: Parent container for collections.
- `section_items`: Individual artworks linked to sections.
- `inventory`: Real-time commerce details.
- `news_posts`: Blog content and updates.
- `about_info`: Artist biography and portrait data.

### 4. Security & QA

- **RBAC & RLS**: Supabase Row Level Security ensures only authenticated admins can mutate data.
- **CI/CD Pipeline**: GitHub Actions running linting, type-checks, unit tests (Jest), and E2E smoke tests (Playwright) on every PR.

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
   ```

3. **Database Setup:**
   Apply `schema_v4_items.sql` in the Supabase SQL Editor.

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
├── lib/                  # Infrastructure (Supabase client, Cloudinary)
├── types/                # Database and Global type definitions
└── e2e/                  # Playwright end-to-end tests
```

---

## 🏁 Production Readiness Gap Analysis

Based on the latest report, the following critical steps were identified as **missing** and have been added to the Roadmap for future implementation:

| Category          | Missing Component    | Recommendation                                     |
| :---------------- | :------------------- | :------------------------------------------------- |
| **Code Quality**  | Prettier & Husky     | Automated formatting and pre-commit linting hooks. |
| **Monitoring**    | Sentry/LogRocket     | Real-time error tracking for production.           |
| **Security**      | Env Validation (Zod) | Build-time validation of required secrets.         |
| **Performance**   | Bundle Analyzer      | Ensuring client-side JS remains lean.              |
| **Documentation** | CONTRIBUTING.md      | Guidelines for future dev onboardings.             |

---

## 🔮 Future Updates & Roadmap

Based on a production readiness audit, the following improvements are planned:

### 1. Automated Testing Suite ✅

- **Unit Testing**: ✅ Implemented `Jest` and `React Testing Library` for utility functions and complex components.
- **E2E Testing**: ✅ Set up `Playwright` with smoke tests for critical user flows (landing page, navigation).

### 2. CI/CD Pipeline ✅

- **GitHub Actions**: ✅ Established pipeline to run linter, type checks, and tests on every Pull Request.
- **Build Checks**: ✅ Ensure the application compiles successfully before merging.

### 3. Code Quality & Standards ✅

- **Prettier**: ✅ Enforce consistent code formatting.
- **Husky & Lint-Staged**: ✅ Run quality checks (linting/formatting) automatically on git commits.

### 4. Monitoring & performance

- **Error Logging**: Integrate Sentry for real-time error tracking in production.
- **Performance**: Implement bundle analysis and strictly validate environment variables.

### 5. Security Hardening

- **CSP**: Configure Content Security Policy headers.
- **Env Validation**: Use `zod` to validate all environment variables at build time.
