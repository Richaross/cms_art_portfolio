# 🎨 Art Portfolio & CMS

A high-performance, dark-themed art portfolio website featuring a custom Content Management System (CMS), integrated directly with Supabase and Cloudinary. This application serves as a comprehensive platform for artists to showcase their work, manage sales through limited drops, and publish news updates.

## ⚡ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Image Hosting**: [Cloudinary](https://cloudinary.com/) (Upload Widget & Management API)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Payments**: Integrated Stripe links for direct purchasing.

---

## ✨ Features & Architecture

### 1. Portfolio System (Collections)
The portfolio is structured around **Collections** (previously "Sections"), which allows for grouping multiple artworks under a single thematic header.

- **Collections Grid**: The main page displays a responsive grid of Collections, each with a cover image, title, and description.
- **Deep Zoom & Detail Modal**: Clicking a collection opens an immersive modal that reveals:
    - **Header**: High-resolution cover image and collection statement.
    - **Items Grid**: A nested grid displaying individual artworks contained within the collection.
- **Item Details**: Each item in the collection has its own metadata:
    - **Sales Status**: Items can be marked "For Sale" or "Archival/Not for Sale".
    - **Inventory Management**: Real-time display of price and stock quantity.
    - **Direct Purchase**: Integration with Stripe payment links for available items.

### 2. Custom CMS (Dashboard)
A secure, authenticated dashboard located at `/dashboard` provides full control over the website's content.

- **Collection Management (`SectionEditor`)**:
    - Manage Collection metadata (Title, Description, Cover Image).
    - **Nested Item Management**: dedicated interface to Add, Edit, and Delete individual artworks (`SectionItem`) within a collection.
    - **Drag-and-Drop Ordering**: Reorder collections and items to curate the viewer's journey.
- **Image Management**:
    - **Uploads**: Integrated Cloudinary widget for seamless, optimized image uploads.
    - **Smart Deletion**: Automated cleanup logic ensures that when a Collection or Item is deleted, its associated image is permanently removed from Cloudinary to maintain storage hygiene.
- **News & Updates**:
    - Full blogging capability with `NewsEditor`.
    - Supports Categories (Exhibitions, Press, General), Summaries, and External Links.
- **About Section**:
    - Real-time editing of the Artist's Biography and Portrait image.

### 3. Database Schema (Supabase)

The application uses a relational PostgreSQL schema designed for scalability and data integrity.

- **`sections` (Collections)**:
    - `id`, `title`, `description`, `img_url`, `order_rank`
    - Acts as the parent container for artworks.
- **`section_items` (Artworks/Products)**:
    - Linked to `sections` via `section_id` (One-to-Many).
    - `title`, `description`, `image_url`
    - **Commerce Fields**: `price`, `stock_qty`, `is_sale_active`, `stripe_link`.
- **`news_posts`**:
    - Stores blog/news feedback with `category`, `summary`, and `link_url`.
- **`about_info`**:
    - Singleton row for storing the artist's bio and portrait.

### 4. Security & Performance
- **Server Actions**: All data mutations (Create, Update, Delete) are handled via Next.js Server Actions, ensuring secure database interactions and keeping business logic off the client.
- **Row Level Security (RLS)**: Supabase policies enforce that only authenticated users (the Admin) can modify data, while the public has read-only access.
- **Optimized Rendering**: Utilizing Next.js Image optimization and Framer Motion for 60fps animations and transitions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account
- Cloudinary Account

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
   NEXT_PUBLIC_CLOUDINARY_PUBLIC_API=your_api_key
   NEXT_PUBLIC_CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Database Setup:**
   Run the SQL migrations provided in `schema_v4_items.sql` (and previous versions) in your Supabase SQL Editor to set up tables and RLS policies.

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```
app/
├── actions/            # Server Actions for DB mutations (portfolio.ts, news.ts, about.ts)
├── app/               # Next.js App Router pages
│   ├── dashboard/     # CMS Dashboard (Protected)
│   ├── page.tsx       # Main Landing Page
│   └── ...
├── components/        # React Components
│   ├── cms/           # Dashboard Editors (SectionEditor, ItemEditor, NewsEditor)
│   ├── ui/            # Shared UI elements
│   └── ...            # Public components (Portfolio, Navbar, About)
├── domain/            # TypeScript interfaces and domain models
├── lib/               # Shared utilities (Supabase client, Services)
└── types/             # Database type definitions
```

---

## 🔮 Future Updates & Roadmap

Based on a production readiness audit, the following improvements are planned:

### 1. Automated Testing Suite
- **Unit Testing**: Implement `Jest` and `React Testing Library` for utility functions and complex components.
- **E2E Testing**: Set up `Playwright` or `Cypress` for critical user flows (smoke tests).

### 2. CI/CD Pipeline
- **GitHub Actions**: Establish a pipeline to run linter, type checks, and tests on every Pull Request.
- **Build Checks**: Ensure the application compiles successfully before merging.

### 3. Code Quality & Standards
- **Prettier**: Enforce consistent code formatting.
- **Husky & Lint-Staged**: Run quality checks (linting/formatting) automatically on git commits.

### 4. Monitoring & performance
- **Error Logging**: Integrate Sentry for real-time error tracking in production.
- **Performance**: Implement bundle analysis and strictly validate environment variables.

### 5. Security Hardening
- **CSP**: Configure Content Security Policy headers.
- **Env Validation**: Use `zod` to validate all environment variables at build time.
