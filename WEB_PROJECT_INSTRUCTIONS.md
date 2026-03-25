# Web Project Instructions & Architecture

## 1. Tech Stack

- **Framework:** Next.js (App Router) + React
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Standard Web)
- **Icons:** `lucide-react`
- **Global State Management:** Zustand
- **API Fetching & Server State:** TanStack Query (React Query) + Axios

---

## 2. UI/UX Design System (The Editorial Harvest)

### 2.1. Overview & Creative North Star

_(Follows the same "Living Magazine" philosophy as mobile: asymmetric layouts, overlapping elements, no rigid borders)._

### 2.2. Colors & Tonal Layering

Utilizes the exact same 13-step tonal scale (T0 to T100) across Primary, Secondary, Tertiary, and Neutral palettes to ensure brand consistency.

**Web-Specific Surface Adaptations:**

- **Hover/Active States:** Because the web utilizes mouse interactions, actively leverage the Tonal scale. (e.g., A button is `bg-primary-T40`, on hover it becomes `bg-primary-T30`).
- **Backgrounds:** `bg-neutral-DEFAULT` for main wrapper, `bg-neutral-T100` for elevated cards.

**The "No-Line" Rule:**
Rely on generous padding (`gap-8`, `p-10`) and background shifts. Use `<hr/>` only if absolutely necessary for data tables, tinted with `neutral-T90`.

### 2.3. Typography

- Utilize `next/font/google` with CSS variables (`--font-epilogue`, `--font-be-vietnam-pro`).
- Keep font scaling responsive (`text-base md:text-lg`).

### 2.4. Elevation & Depth (Web specific)

- Use Tailwind's soft shadow utilities (`shadow-sm`, `shadow-md`) but customize the shadow color in `tailwind.config.ts` to use a low-opacity `neutral-T10` instead of pure black.

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
