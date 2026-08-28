# NIVAARAN Frontend Architecture & UI Analysis

This document provides a deep dive into the frontend architecture, design system, and UI component structure of the NIVAARAN (Jharkhand Societal Challenge & Innovation Network) project. It is designed to help any AI agent or developer quickly understand the technical approach and styling paradigms used in the repository.

## 1. Core Technology Stack

The frontend is built as a Single Page Application (SPA) prioritizing performance, type safety, and rapid UI development:

*   **Framework:** React 18
*   **Language:** TypeScript (strict mode enabled via `tsconfig.json`)
*   **Build Tool / Bundler:** Vite (for fast HMR and optimized production builds)
*   **Styling Engine:** Tailwind CSS (v3.4.1) paired with PostCSS and Autoprefixer
*   **Icons:** `lucide-react` (provides consistent, customizable SVG icons)
*   **Backend Integration:** Firebase (v12.18.0) for Auth (and likely Firestore/Storage based on `.env.example`)

## 2. Routing & View Orchestration Strategy

Interestingly, while `react-router-dom` is installed as a dependency, the current architectural approach relies on **Stateful Conditional Rendering** based on robust Role-Based Access Control (RBAC) rather than URL-based declarative routing.

### The Orchestrator: `App.tsx`
`App.tsx` acts as the primary orchestrator, wrapping the application in an `<AuthProvider>`. It manages the top-level view state:
1.  **Unauthenticated State:** Renders `<LandingPage>` or `<AuthPage>` based on local state toggles (`showAuthPage`).
2.  **Authenticated State:** Uses the `currentUser.role` to mount the appropriate portal.

### Portals (`src/pages/portals/`)
The application is strictly siloed into dedicated portal components based on the 5 primary user groups:
*   `AdminPortal.tsx` (Platform Super Admin)
*   `CitizenPortal.tsx` (Citizen)
*   `GovPortal.tsx` (Government Department)
*   `IndustryPortal.tsx` (Industry / MSME, CSR)
*   `UnivPortal.tsx` (University Admin, Faculty, Students)

**Security:** Each portal mount is wrapped in a `<ProtectedRoute>` component which performs a secondary assertion that the current user's role exists in the `allowedRoles` array before rendering children.

## 3. Design System & Styling (Tailwind Config)

The UI adheres strictly to the civic/government disaster-management aesthetic defined in the project constraints. It completely avoids pure whites (`#FFFFFF`) and harsh blacks, opting for a warm, trustworthy, high-contrast palette.

### Theme Configuration (`tailwind.config.js`)
The `tailwind.config.js` extends the default theme with custom semantic colors and typography:

**Color Palette:**
*   `nivaaran-primary` (`#1E3A5F` / hover: `#16293F`): Deep trust-blue for primary actions, nav, and headers.
*   `nivaaran-secondary` (`#0F766E`): Teal-green for success states, verification, and impact indicators.
*   `nivaaran-accent` (`#C2760C`): Warm amber/ochre for CTAs and highlights.
*   `nivaaran-danger` (`#B3261E`): High severity red for disaster flags.
*   `nivaaran-warning` (`#B45309`): Medium severity/pending review.
*   *Note: Backgrounds utilize inline warm off-whites (e.g., `#FAF8F3`) and muted borders (`#DCD6C6`).*

**Typography (Multi-lingual support):**
*   `sans`: Primary body font is **Inter**.
*   `heading`: Headers utilize **Plus Jakarta Sans** for a modern, approachable civic feel.
*   `devanagari`: Explicit support for **Noto Sans Devanagari** to support bilingual (Hindi/English) interfaces.
*   `mono`: **JetBrains Mono** for technical IDs and code refs.

### Global Styles (`src/index.css`)
Overrides base HTML tags to enforce the typography system globally across the `body` and heading (`h1`-`h6`) elements.

## 4. Component Implementation Patterns

Components are constructed using utility-first Tailwind classes directly in the JSX. There are no CSS modules or styled-components.

### Example: `QuickReportModal.tsx`
This component exemplifies the project's UI approach:
1.  **Glassmorphism & Overlays:** Uses `bg-black/60 backdrop-blur-sm` for modal backdrops.
2.  **Card Aesthetics:** Modal bodies use the warm background `bg-[#FAF8F3]` with subtle borders `border-[#DCD6C6]` and large rounded corners `rounded-2xl`.
3.  **Complex Forms:** Forms are divided into clear numbered sections.
4.  **Interactive Elements:** Buttons use dynamic classes for active states (e.g., switching from a white outline to solid `bg-[#1E3A5F]` when a category is selected).
5.  **Icons as Prominent Visuals:** Lucide icons are used heavily (e.g., `Camera`, `MapPin`) inside custom rounded containers to make the UI highly legible for citizens.
6.  **Browser APIs:** Directly integrates `navigator.geolocation` for real-time location capture during report submission.

## 5. Directory Structure

```text
frontend/
├── src/
│   ├── components/      # Reusable UI (Modals, ProtectedRoutes, Splash screens)
│   ├── config/          # Environment/API configurations
│   ├── context/         # React Context (AuthContext)
│   ├── i18n/            # Internationalization (Hindi/English translations)
│   ├── pages/           # High-level views (Landing, Auth)
│   │   └── portals/     # Role-specific dashboard shells
│   ├── App.tsx          # Root routing and RBAC orchestrator
│   ├── index.css        # Tailwind directives and base styles
│   └── main.tsx         # React DOM entry point
├── tailwind.config.js   # Design system tokens (colors, fonts)
├── vite.config.ts       # Bundler config
└── package.json         # Dependencies and scripts
```

## Summary for AI Agents
When generating or modifying frontend code for NIVAARAN:
1.  **Do not use generic colors** (like `bg-blue-500` or `text-red-600`). Always use the semantic palette defined in `tailwind.config.js` (e.g., `bg-nivaaran-primary`, `text-nivaaran-danger`) or the explicit hex codes matching the warm aesthetic (`#FAF8F3`).
2.  **Respect RBAC:** If adding a new feature, ensure it is placed within the correct portal under `src/pages/portals/` or protected via `<ProtectedRoute>`.
3.  **Responsive First:** Ensure all components use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) to support citizen access on low-bandwidth mobile devices.
