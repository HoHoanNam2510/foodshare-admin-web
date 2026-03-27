# Web Project Instructions & Architecture

## 1. Tech Stack

- **Framework:** Next.js (App Router) + React
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Standard Web)
- **Icons:** `lucide-react`
- **Global State Management:** Zustand
- **API Fetching & Server State:** TanStack Query (React Query) + Axios

---

## 2. UI/UX Design System (Enterprise Corporate Trust - FoodShare Edition)

### 2.1. Overview & Creative North Star

**Creative North Star: "Corporate Trust meets Editorial Harvest"**
This design system embodies the modern enterprise SaaS aesthetic tailored for FoodShare's administrative platform. It rejects cold, sterile corporate formality in favor of a warm, confident, and inviting presence. We maintain our core "Harvest" color identity (Greens and Warm Neutrals) but elevate it with enterprise-grade polish: colored shadows, refined micro-interactions, and isometric depth.

**Keywords**: Trustworthy, Polished, Dimensional, Modern, Enterprise-Ready, Vibrant.

### 2.2. Colors & Surface Philosophy

We strictly adhere to the established FoodShare color tokens, leveraging them to create professional tonal layering.

- **Primary (The Stem)**: `primary` (#296c24) for authoritative action and primary gradients. `primary-container` (#72b866) for accents.
- **Secondary (The Zest)**: `secondary` (#944a00) and `secondary-container` (#fd933f) for striking highlights and notifications.
- **Backgrounds (The Soil)**: `surface` (#f9f9f8) for the main wrapper, `surface-lowest` (#ffffff) for elevated cards.
- **Dark Mode**: `dark-bg` (#080c1f) for depth, `dark-card` (rgba(255,255,255,0.03)) for surfaces.

### 2.3. Typography

- **Fonts**: `Epilogue` for Display/Headlines (authoritative, modern) and `Be Vietnam Pro` for Body/UI (highly readable).
- **Weights & Hierarchy**:
  - **ExtraBold (800) / Bold (700)** for Hero headlines and section titles.
  - **SemiBold (600)** for card titles and important labels.
  - **Medium (500)** for navigation and standard buttons.
- **Letter Spacing**: Tight tracking (`tracking-tight` or `-0.02em`) on large headlines for modern polish.

### 2.4. Elevation, Shadows & Effects (Enterprise Polish)

We replace flat, neutral gray shadows with **Colored Shadows** tinted with our Primary Green to reinforce the brand palette:

- **Default Card Shadow**: Soft green-tinted base elevation (`shadow-soft`).
- **Hover State**: Cards lift on hover (`-translate-y-1`) with multi-layer depth (`shadow-hover`).
- **Glow Effects**: Badges or active states use an ethereal green glow (`shadow-glow`).
- **Gradients**: Strategic use of `from-primary to-primary-container` for active buttons and `bg-clip-text text-transparent` for emphasizing metrics or headlines.
- **Atmospheric Blobs**: Use large, softly blurred orbs (`blur-3xl`) with very low opacity (5-10%) in the background to create depth without distraction.

### 2.5. Micro-Interactions & Styling Rules

- **Buttons**: Primary buttons use gradients. Apply a subtle lift (`hover:-translate-y-0.5`) and increased shadow on hover.
- **Cards**: Base cards use `rounded-xl`, `bg-surface-lowest`, and a very subtle border.
- **Inputs**: `rounded-lg`, `bg-transparent` or white. Focus states must use `focus-within:ring-2 focus-within:ring-primary/50`.
- **The "No-Line" Rule (Refined)**: Rely primarily on generous padding and background tonal shifts. Use borders (`border-outline-variant` or `dark:border-dark-hover`) only to strictly separate distinct architectural panels (e.g., Sidebar vs. Main Content) or table rows.

---

## 3. Folder Structure & Routing (Next.js App Router)

- **`/app`:** Routing, layouts, and pages.
  - `/app/layout.tsx`: Root layout (Providers, Fonts).
  - `/app/(auth)`: Grouped unauthenticated routes.
  - `/app/(dashboard)`: Protected routes.
- **`/components`:**
  - `/components/ui`: Base UI elements (shadcn/ui customized with our Tonal palette).
  - `/components/features`: Domain-specific components.
  - `/components/layout`: `Navbar`, `Sidebar`.
- **`/store`:** Zustand stores.
- **`/lib`:** Axios instances, Tailwind `cn` utility.

---

## 4. Component Coding Standards

- **Server vs. Client Components:** Default to **Server Components**. Add `"use client"` ONLY when interactivity (`useState`, `onClick`, Zustand) is required.
- **Web Tags:** Use semantic HTML (`<main>`, `<article>`, `<nav>`).
- **Images:** Always use Next.js `<Image>` for WebP optimization.

---

## 5. State Management & API Fetching

- **Client State (Zustand):** Used for sidebar toggles, active filters, etc. Must be inside `"use client"` components.
- **Server State (React Query):** For client-side fetching needing caching/mutations. Use Next.js native `fetch` in Server Components for SEO-critical data.
- **Interceptors (Axios):** Attach JWT tokens (often stored in cookies) and handle 401 redirects.

---

## 6. Web-Specific Best Practices

- **Responsive Design:** Design mobile-first, then use Tailwind prefixes (`md:`, `lg:`, `xl:`).
- **Hover & Focus:** Ensure every clickable element has a `hover:` state and inputs have `focus:` states (e.g., `focus:ring-2 focus:ring-primary-T40`).
