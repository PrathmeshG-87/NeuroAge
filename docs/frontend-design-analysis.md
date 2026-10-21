# Frontend Design Analysis - NeuroAge

> AI-Based Brain Age Prediction and Healthy Brain Aging Assessment Using MRI

**Analysis Date:** 2026-10-18
**Author:** Frontend Technical Lead
**Status:** Phase 0 - Design Analysis Complete

---

## Table of Contents

1. [Existing Frontend Architecture Summary](#1-existing-frontend-architecture-summary)
2. [Design Resource Analysis](#2-design-resource-analysis)
3. [Proposed Visual Direction](#3-proposed-visual-direction)
4. [Dependency and Component Plan](#4-dependency-and-component-plan)
5. [Phased Development Plan](#5-phased-development-plan)
6. [Appendix: Design Token Draft](#appendix-design-token-draft)

---

## 1. Existing Frontend Architecture Summary

### Finding: No Existing Frontend Application

The workspace at `d:\NeuroAge` contains **no existing frontend application**. The root directory has only three design resource directories:

```
d:\NeuroAge/
├── awesome-design-md-main/     # 73 real-world DESIGN.md files
├── taste-skill-main/           # Anti-slop frontend design skill (Claude)
└── web-design-main/            # Web design SKILL + 58 brand reference systems
```

**No** `package.json`, `vite.config.ts`, `tsconfig.json`, React router setup, component directories, CSS files, or any frontend infrastructure exists. The frontend must be built from scratch.

### Implication

This is a **greenfield build**. We have full freedom to select the optimal stack, architecture, and design system without migration constraints. The three design resources serve as style and quality references, not as starting code to fork.

---

## 2. Design Resource Analysis

### 2.1 awesome-design-md-main

**Nature:** A curated collection of 73 `DESIGN.md` files extracted from real production websites (Stripe, Linear, Vercel, Sentry, IBM, Apple, etc.). Each follows a standardized 9-section format originally defined by Google Stitch.

**Key Insights for NeuroAge:**

| DESIGN.md | Why Relevant | Key Patterns |
|-----------|-------------|--------------|
| **Linear** | Clean, precise dark-mode engineering tool | Ultra-subtle borders (`rgba(255,255,255,0.05)`), restrained purple accent, Geist font |
| **Sentry** | Data-dense monitoring dashboard | Dark theme, pink-purple accent on telemetry data, dense card grids |
| **IBM** | Enterprise scientific platform (Carbon DS) | Blue palette, structured layouts, accessibility-first, 8px grid |
| **Vercel** | Monochromatic developer precision | Black/white only, Geist family, extreme typographic restraint |
| **Supabase** | Developer dashboard with data visualization | Dark emerald theme, code-first, hierarchical card surfaces |
| **PostHog** | Analytical dashboard with hedgehog personality | Playful but data-dense, developer-friendly dark UI |

**Applicable 9-Section DESIGN.md Structure:**
1. Visual Theme & Atmosphere
2. Color Palette & Roles (CSS variables + RGB helpers)
3. Typography Rules (font stacks, hierarchy tables, forbidden fonts)
4. Component Stylings (all 5 states: default/hover/active/focus/disabled)
5. Layout Principles (spacing scale, grids, containers)
6. Depth & Elevation (surface stacking, shadow hierarchy)
7. Do's and Don'ts (design guardrails)
8. Responsive Behavior (breakpoints, touch targets, collapse strategies)
9. Agent Prompt Guide (color reference, ready-to-use prompts)

**Decision:** We will create a NeuroAge-specific `DESIGN.md` following this proven 9-section format, serving as the single source of truth for all UI development.

---

### 2.2 taste-skill-main

**Nature:** A comprehensive anti-slop frontend design skill (1207 lines) focused on eliminating common AI-generated design cliches. Contains 13+ sub-skills and a research directory on design quality.

**Key Principles Extracted:**

#### Design Read Before Code
Before any implementation, declare a one-line design read:
> "Reading this as: scientific research dashboard for neuroscience researchers and clinicians, with a trust-first analytical language, leaning toward dark precision engineering with a dual teal/coral accent system."

#### The Three Dials (adapted for NeuroAge)
| Dial | NeuroAge Setting | Rationale |
|------|-----------------|-----------|
| `DESIGN_VARIANCE` | **4** | Scientific credibility requires structured, predictable layouts |
| `MOTION_INTENSITY` | **3-4** | Data dashboards need immediate readability, not cinematic motion |
| `VISUAL_DENSITY` | **6-7** | High information density (MRI slices, metrics, charts) but still breathable |

#### Anti-Slop Rules (Critical for NeuroAge)
- **NO** AI-purple gradients, neon glows, or generic glassmorphism
- **NO** Inter as default font (use Geist, DM Sans, or Satoshi)
- **NO** centered hero with mesh gradient blob
- **NO** 3-column equal feature cards (use varied layouts)
- **NO** hand-rolled SVG icons (use Phosphor Icons or Lucide)
- **NO** fake-precise numbers (model metrics must be real or clearly labeled mock)
- **NO** em-dashes anywhere in the UI
- **NO** scroll-reveal on dashboard data (information must be immediately visible)
- **NO** custom mouse cursors
- **NO** generic spinners (use skeleton loaders matching card topology)

#### Typography Discipline
- Sans-serif display by default (Geist, Satoshi, DM Sans)
- Serif ONLY if explicitly justified (not applicable for a scientific dashboard)
- Monospace for all numerical data, metrics, coordinates (JetBrains Mono)
- Tight headings (`tracking-tighter`), relaxed body (`leading-relaxed`, `max-w-[65ch]`)

#### Interactive States (All Must Be Implemented)
- Loading: Skeleton loaders matching final layout shape
- Empty States: Beautifully composed with guidance
- Error States: Clear, inline for forms, contextual toasts for transient
- Tactile Feedback: `-translate-y-[1px]` or `scale-[0.98]` on `:active`
- Button contrast: WCAG AA minimum (4.5:1)

#### Dark Mode Protocol
- Dual-mode by default (system preference respected)
- No pure `#000000` or `#ffffff` (use off-black and off-white)
- CSS variable token strategy for theme switching
- Hierarchy parity: visual hierarchy works in both modes

---

### 2.3 web-design-main

**Nature:** A complete web design SKILL with a two-phase workflow (DESIGN.md first, code second), 58 pre-analyzed brand design systems, reference pattern libraries, and Python scripts for token extraction.

**Key References and Their NeuroAge Application:**

#### Dashboard Scene Defaults (from `scene-defaults.md`)
```yaml
layout:
  structure: Sidebar + Top Bar + Content Area
  container: Full width (sidebar 240-280px, content auto)
  grid: Dense grid (2-4 columns, gap 12-16px)
  spacing: Compact (16-24px section spacing)

components:
  required: Sidebar nav, Data cards, Chart containers, Tables, Filters
  common: KPI numbers, Status badges, Breadcrumbs, Notifications, Skeleton loaders
  optional: Real-time indicators, Dark mode, Draggable cards

interaction_baseline: L1
  - Data cards: hover border highlight ONLY (no translateY lift)
  - Table rows: hover background color change
  - Sidebar: collapsible, current item highlighted
  - Loading: skeleton pulse
  - Numbers: transition animation (counter roll)
  - CRITICAL: No scroll-reveal on data (must be immediately visible)

typography:
  page_title: 1.5rem
  card_title: 0.875-1rem
  body: 0.8125-0.875rem
  numbers: 1.5-2.5rem, font-weight 700-800
  density: High (information dense, separated by grid and borders)
```

#### 10-Step Spacing Scale
```css
--sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;
--sp-5: 24px;  --sp-6: 32px;  --sp-7: 48px;  --sp-8: 64px;
--sp-9: 96px;  --sp-10: 128px;
```

#### Interaction Tiers
| Tier | Use In NeuroAge | Implementation |
|------|----------------|----------------|
| **L1 (Refined Static)** | Dashboard views, data cards, tables | Hover states, focus rings, soft entry animations |
| **L2 (Fluid Interactive)** | Landing page, MRI viewer navigation | Scroll reveal, sticky nav blur, chart tooltips |
| **L3 (Immersive)** | NOT applicable | Scientific dashboard - no cinematic scroll-hijacking |

#### Quality Checklist (100-point audit for every page)
- All colors via CSS variables, zero hardcoded hex
- Font stacks match DESIGN.md exactly
- Every interactive element has hover + focus states
- Skeleton loaders match card topology
- Mobile (< 600px) has no horizontal overflow
- Touch targets >= 44x44px

---

## 3. Proposed Visual Direction

### Design Read
> "Scientific research dashboard for neuroscience researchers and academic audiences, with a trust-first precision language, leaning toward dark analytical engineering with a dual teal/coral functional accent system."

### Visual Identity: "Dark Precision Scientific"

A restrained, data-focused dark theme that communicates scientific rigor, transparency, and trustworthiness. Inspired by Linear's precision, Sentry's data density, and IBM's enterprise authority - adapted for medical research.

### 3.1 Color System

#### Primary Surfaces (Dark Mode - Default)
```css
--bg-canvas:     #0a0b0e;    /* Void / page background */
--bg-surface-1:  #111217;    /* Base cards, sidebar */
--bg-surface-2:  #171921;    /* Elevated containers */
--bg-surface-3:  #1f222d;    /* Modals, active cards */
--bg-hover:      #242836;    /* Surface hover state */
```

#### Light Mode Surfaces
```css
--bg-canvas:     #f8f9fb;    /* Page background */
--bg-surface-1:  #ffffff;    /* Cards */
--bg-surface-2:  #f1f3f7;    /* Sidebar, secondary surfaces */
--bg-surface-3:  #e8ebf0;    /* Elevated containers */
--bg-hover:      #edf0f5;    /* Hover state */
```

#### Text Hierarchy (4-tier luminance scale)
```css
--text-primary:    #ebecef;   /* ~92% luminance - headings */
--text-secondary:  #c6c9d2;   /* ~78% - body text */
--text-tertiary:   #8d909c;   /* ~56% - metadata, captions */
--text-quaternary: #60636f;   /* ~40% - disabled, overlines */
```

#### Functional Accents (Dual System)
```css
/* Cool accent: Scientific / precision / AI / positive */
--accent-teal:      #5eead4;
--accent-teal-hover: #8cf5e3;
--accent-teal-bg:   rgba(94, 234, 212, 0.12);

/* Warm accent: Biological / aging / alert / attention */
--accent-coral:      #fb923c;
--accent-coral-hover: #fdb874;
--accent-coral-bg:   rgba(251, 146, 60, 0.12);

/* Semantic status */
--status-success: #10b981;    /* Brain age <= chronological */
--status-warning: #f59e0b;    /* Moderate age difference */
--status-critical: #ef4444;   /* Large age difference */
--status-info:    #60a5fa;    /* Informational, model metrics */
```

#### Borders
```css
--border-subtle:  rgba(67, 70, 81, 0.5);
--border-strong:  rgba(67, 70, 81, 0.9);
--border-accent:  rgba(94, 234, 212, 0.3);
```

### 3.2 Typography System

| Role | Font | Size | Weight | Line Height | Tracking | Use Case |
|------|------|------|--------|-------------|----------|----------|
| Hero Display | DM Sans | `clamp(36px, 4vw, 56px)` | 700 | 1.10 | -0.025em | Page hero headings |
| Section Title | DM Sans | `clamp(22px, 2.5vw, 32px)` | 700 | 1.20 | -0.015em | Section headers |
| Card Header | DM Sans | 17-19px | 600 | 1.30 | -0.01em | Widget/panel titles |
| KPI Display | JetBrains Mono | 28-44px | 700 | 1.05 | -0.02em | Brain Age, Gap, Metrics |
| Body | DM Sans | 14-15px | 400 | 1.60 | 0 | Descriptions, reports |
| Data/Code | JetBrains Mono | 13-14px | 500 | 1.50 | 0 | MAE, RMSE, coordinates |
| Eyebrow | JetBrains Mono | 11-12px | 500 | 1.40 | 0.10em (uppercase) | Category labels |

**Font Loading:** Self-hosted with `@font-face` and `font-display: swap`. No Google Fonts `<link>` tags.

### 3.3 Layout Architecture

```
+-----------------------------------------------------------------------------------+
|  Top Bar (sticky, 56px): Logo | Nav Links | Theme Toggle | Upload CTA             |
+------------------+----------------------------------------------------------------+
|                  |                                                                 |
|  Sidebar (240px) |  Content Area (fluid, max-w-1440px)                            |
|  Collapsible     |                                                                 |
|  Grouped Nav:    |  ┌──────────┬──────────┬──────────┬──────────┐                  |
|  - Dashboard     |  │Brain Age │ Chrono   │ Age Gap  │ Model    │  KPI Row         |
|  - Upload MRI    |  │  67.2    │  Age: 62 │  +5.2    │ Conf: 87%│                  |
|  - Results       |  └──────────┴──────────┴──────────┴──────────┘                  |
|  - MRI Viewer    |  ┌─────────────────────────┬──────────────────┐                  |
|  - History       |  │                         │                  │                  |
|  - Model Info    |  │   MRI Slice Viewer      │  Assessment      │                  |
|  - Reports       |  │   (Axial/Coronal/Sag)   │  Summary         │                  |
|  - Settings      |  │                         │                  │                  |
|                  |  └─────────────────────────┴──────────────────┘                  |
|  Disclaimer      |  ┌──────────────────┬─────────────────────────┐                  |
|  (footer)        |  │  Feature         │  Model Performance      │                  |
|                  |  │  Importance      │  (MAE, RMSE, r)         │                  |
|                  |  └──────────────────┴─────────────────────────┘                  |
+------------------+----------------------------------------------------------------+
```

### 3.4 Component Shape System

| Element | Border Radius | Rationale |
|---------|--------------|-----------|
| Cards/Panels | 12px | Soft but structured |
| Buttons (Primary) | 8px | Clickable, not pill-like |
| Inputs/Selects | 8px | Consistent with buttons |
| Badges/Pills | 9999px (full) | Status indicators |
| Modals/Dialogs | 16px | Prominent but grounded |
| Tooltips | 8px | Matches input shape |

### 3.5 Shadow & Elevation

```css
--shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-sm:  0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-md:  0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-glow-teal: 0 0 20px rgba(94, 234, 212, 0.15);
```

### 3.6 Interaction Model (L1 with selective L2)

| Context | Interaction Level | Details |
|---------|------------------|---------|
| Dashboard data cards | L1 | Border highlight on hover, no lift |
| Table rows | L1 | Background tint on hover |
| KPI numbers | L1+ | CountUp animation on first load |
| MRI slice viewer | L2 | Smooth slider-driven navigation, crosshairs |
| Landing page | L2 | Scroll reveal on sections, sticky nav blur |
| Chart tooltips | L2 | Follow-cursor with data display |
| Upload progress | L1 | Determinate progress bar, skeleton state |
| Page transitions | L1 | Simple fade, no slide |

### 3.7 Medical Disclaimer Design

Every page includes a persistent, non-intrusive disclaimer:
- Bottom of sidebar: small-text research disclaimer with link to full details
- Results page: prominent callout box before results
- PDF report: full disclaimer page
- Style: `--text-tertiary` on `--bg-surface-1`, subtle left border in `--accent-coral`

---

## 4. Dependency and Component Plan

### 4.1 Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | React 18+ with Vite | Project requirement, fast HMR, TypeScript |
| **Language** | TypeScript (strict mode) | Type safety for medical data |
| **Styling** | Tailwind CSS v4 + CSS Variables | Design token system, responsive utilities |
| **Routing** | React Router v7 | Standard, well-maintained |
| **State** | Zustand + React Query (TanStack) | Lightweight global state + async server state |
| **Charts** | Recharts or Plotly.js (React wrapper) | Scientific charts, confidence intervals |
| **Icons** | Lucide React | Clean, consistent stroke icons |
| **Forms** | React Hook Form + Zod | Validation, file upload handling |
| **PDF** | @react-pdf/renderer | PDF report generation client-side |
| **MRI Viewer** | NiiVue (WebGL NIFTI viewer) or custom canvas | Domain-specific MRI rendering |
| **HTTP** | Axios or Fetch with React Query | API integration with FastAPI backend |
| **Notifications** | Sonner | Lightweight toast notifications |
| **Animation** | CSS transitions + Tailwind | L1 baseline, no heavy animation library |

### 4.2 Explicit Non-Dependencies (DO NOT install)

| Library | Reason |
|---------|--------|
| Framer Motion / Motion | L1 interaction level; CSS transitions suffice |
| GSAP / ScrollTrigger | No scroll-hijacking in a dashboard |
| Three.js / WebGL (generic) | Use domain-specific NiiVue instead |
| Material UI | Not our design system |
| Ant Design | Not our design system |
| Bootstrap | Not our design system |
| styled-components | Using Tailwind |
| Emotion | Using Tailwind |

### 4.3 Component Architecture

```
src/
├── app/                          # Application shell
│   ├── App.tsx                   # Root component, providers, router
│   ├── routes.tsx                # Route definitions
│   └── providers/                # Theme, Query, Auth providers
│
├── components/
│   ├── ui/                       # Primitive design system components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Dialog.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Progress.tsx
│   │   └── Toast.tsx
│   │
│   ├── layout/                   # Structural layout components
│   │   ├── AppShell.tsx          # Sidebar + topbar + content area
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── PageHeader.tsx
│   │   └── ContentContainer.tsx
│   │
│   ├── data-display/             # Data visualization components
│   │   ├── KPICard.tsx           # Large metric with delta badge
│   │   ├── MetricRow.tsx         # Compact metric display
│   │   ├── DataTable.tsx         # Sortable, paginated table
│   │   ├── AgeComparisonChart.tsx
│   │   ├── ConfidenceInterval.tsx
│   │   ├── FeatureImportanceChart.tsx
│   │   ├── ModelPerformanceChart.tsx
│   │   └── AgeDistributionChart.tsx
│   │
│   ├── mri/                      # MRI-specific components
│   │   ├── MRIUploader.tsx       # Drag-drop + file browser
│   │   ├── MRIViewer.tsx         # Slice viewer (axial/coronal/sagittal)
│   │   ├── SliceNavigator.tsx    # Slider for slice selection
│   │   └── MRIPreview.tsx        # Thumbnail preview
│   │
│   ├── assessment/               # Assessment-specific components
│   │   ├── BrainAgeResult.tsx    # Main result display
│   │   ├── AssessmentSummary.tsx
│   │   ├── RiskInterpretation.tsx
│   │   ├── Disclaimer.tsx        # Medical disclaimer banner
│   │   └── ReportDownload.tsx    # PDF generation trigger
│   │
│   └── shared/                   # Cross-cutting components
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── LoadingOverlay.tsx
│       ├── FileValidator.tsx
│       └── ThemeToggle.tsx
│
├── pages/                        # Route-level page components
│   ├── LandingPage.tsx
│   ├── DashboardPage.tsx
│   ├── UploadPage.tsx
│   ├── ResultsPage.tsx
│   ├── MRIViewerPage.tsx
│   ├── HistoryPage.tsx
│   ├── ModelInfoPage.tsx
│   └── NotFoundPage.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useTheme.ts
│   ├── useMRIUpload.ts
│   ├── usePrediction.ts
│   ├── useAssessmentHistory.ts
│   └── useModelMetrics.ts
│
├── services/                     # API integration layer
│   ├── api.ts                    # Axios/fetch instance config
│   ├── mriService.ts             # /api/v1/mri/* endpoints
│   ├── predictionService.ts      # /api/v1/predict
│   ├── assessmentService.ts      # /api/v1/assessments
│   ├── modelService.ts           # /api/v1/model/metrics
│   └── reportService.ts          # /api/v1/reports/*
│
├── types/                        # TypeScript type definitions
│   ├── mri.ts
│   ├── prediction.ts
│   ├── assessment.ts
│   ├── model.ts
│   └── api.ts
│
├── utils/                        # Pure utility functions
│   ├── formatters.ts             # Number, date, age formatting
│   ├── validators.ts             # File validation helpers
│   ├── constants.ts              # App-wide constants
│   └── brainAge.ts               # Brain-PAD calculation
│
├── styles/                       # Global styles
│   ├── globals.css               # CSS variables, Tailwind directives
│   ├── tokens.css                # Design token definitions
│   └── fonts.css                 # @font-face declarations
│
├── assets/                       # Static assets
│   ├── fonts/                    # Self-hosted font files
│   └── images/                   # Logos, placeholder images
│
└── test/                         # Test files
    ├── components/
    ├── hooks/
    ├── services/
    └── utils/
```

### 4.4 Route Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | LandingPage | Project introduction, disclaimers, upload CTA |
| `/dashboard` | DashboardPage | Overview of latest assessment, quick stats |
| `/upload` | UploadPage | MRI file upload with validation |
| `/results/:id` | ResultsPage | Assessment results, visualizations |
| `/viewer/:id` | MRIViewerPage | Full MRI slice viewer |
| `/history` | HistoryPage | Past assessments list |
| `/model` | ModelInfoPage | Model metrics, training info, limitations |
| `*` | NotFoundPage | 404 handler |

---

## 5. Phased Development Plan

### Phase 1: Foundation (Week 1)
> Scaffold, design tokens, layout shell

- [ ] Initialize Vite + React + TypeScript project
- [ ] Install core dependencies (Tailwind v4, React Router, Zustand, React Query)
- [ ] Create `DESIGN.md` for NeuroAge (9 sections, full token definitions)
- [ ] Implement CSS variable token system (`tokens.css`, `globals.css`)
- [ ] Self-host fonts (DM Sans, JetBrains Mono)
- [ ] Build `AppShell` layout (Sidebar, TopBar, ContentContainer)
- [ ] Build primitive UI components (Button, Card, Badge, Input, Skeleton)
- [ ] Implement theme toggle (dark/light with system preference)
- [ ] Set up route structure with placeholder pages
- [ ] Configure ESLint, Prettier, path aliases

### Phase 2: Landing & Upload (Week 2)
> First user-facing flows

- [ ] Build Landing Page (project explanation, research disclaimer, upload CTA)
- [ ] Build MRI Upload page (drag-drop zone, file browser, format validation)
- [ ] Implement file validation (NIfTI format check, size limits)
- [ ] Build processing status UI (progress bar, skeleton loading states)
- [ ] Create EmptyState and ErrorBoundary components
- [ ] Set up API service layer (Axios instance, interceptors, error handling)
- [ ] Write unit tests for validators, formatters

### Phase 3: Results & Visualization (Week 3)
> Core data display

- [ ] Build KPICard component (brain age, chronological age, gap, confidence)
- [ ] Build BrainAgeResult component (main assessment display)
- [ ] Build AssessmentSummary with medical disclaimer
- [ ] Implement MRI slice viewer (axial, coronal, sagittal views)
- [ ] Build SliceNavigator (slider-based slice selection)
- [ ] Create AgeComparisonChart (scatter: predicted vs actual)
- [ ] Create FeatureImportanceChart (horizontal bar chart)
- [ ] Build Results page integrating all result components
- [ ] Connect to FastAPI backend (`/api/v1/predict`, `/api/v1/mri/validate`)

### Phase 4: Charts, Reports & History (Week 4)
> Complete feature set

- [ ] Build ModelPerformanceChart (MAE, RMSE, correlation display)
- [ ] Build Model Info page (training details, limitations, evaluation metrics)
- [ ] Implement PDF report generation (@react-pdf/renderer)
- [ ] Build History page (past assessments, DataTable with sorting/filtering)
- [ ] Implement ConfidenceInterval visualization
- [ ] Build AgeDistributionChart (histogram with subject position)
- [ ] Add toast notifications for async operations
- [ ] Full responsive testing (mobile, tablet, desktop)

### Phase 5: Polish & Testing (Week 5)
> Quality assurance

- [ ] Audit all pages against DESIGN.md quality checklist
- [ ] Verify zero hardcoded hex colors
- [ ] Test all interactive states (hover, focus, active, disabled)
- [ ] Test empty states, error states, loading states
- [ ] Verify WCAG AA contrast on all text
- [ ] Test touch targets >= 44x44px on mobile
- [ ] Integration tests (upload flow, prediction flow, report download)
- [ ] Performance audit (Lighthouse, bundle size analysis)
- [ ] Final responsive review across breakpoints
- [ ] Documentation review and README update

---

## Appendix: Design Token Draft

### CSS Variable Structure (tokens.css)

```css
:root {
  /* === SURFACES === */
  --bg-canvas: #f8f9fb;
  --bg-surface-1: #ffffff;
  --bg-surface-2: #f1f3f7;
  --bg-surface-3: #e8ebf0;
  --bg-hover: #edf0f5;

  /* === TEXT === */
  --text-primary: #1a1d26;
  --text-secondary: #4a4f5e;
  --text-tertiary: #6b7080;
  --text-quaternary: #9ca0ad;

  /* === BORDERS === */
  --border-subtle: #e2e5eb;
  --border-strong: #c8ccd4;
  --border-accent: rgba(20, 184, 166, 0.3);

  /* === ACCENT: TEAL (Cool / Scientific) === */
  --accent-teal: #0d9488;
  --accent-teal-hover: #0f766e;
  --accent-teal-bg: rgba(13, 148, 136, 0.08);

  /* === ACCENT: CORAL (Warm / Biological) === */
  --accent-coral: #ea580c;
  --accent-coral-hover: #c2410c;
  --accent-coral-bg: rgba(234, 88, 12, 0.08);

  /* === SEMANTIC STATUS === */
  --status-success: #10b981;
  --status-success-bg: rgba(16, 185, 129, 0.08);
  --status-warning: #f59e0b;
  --status-warning-bg: rgba(245, 158, 11, 0.08);
  --status-critical: #ef4444;
  --status-critical-bg: rgba(239, 68, 68, 0.08);
  --status-info: #3b82f6;
  --status-info-bg: rgba(59, 130, 246, 0.08);

  /* === SHADOWS === */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

  /* === SPACING === */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;
  --sp-9: 96px; --sp-10: 128px;

  /* === RADII === */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* === TRANSITIONS === */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;

  /* === Z-INDEX SCALE === */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;
}

/* === DARK MODE === */
[data-theme="dark"] {
  --bg-canvas: #0a0b0e;
  --bg-surface-1: #111217;
  --bg-surface-2: #171921;
  --bg-surface-3: #1f222d;
  --bg-hover: #242836;

  --text-primary: #ebecef;
  --text-secondary: #c6c9d2;
  --text-tertiary: #8d909c;
  --text-quaternary: #60636f;

  --border-subtle: rgba(67, 70, 81, 0.5);
  --border-strong: rgba(67, 70, 81, 0.9);

  --accent-teal: #5eead4;
  --accent-teal-hover: #8cf5e3;
  --accent-teal-bg: rgba(94, 234, 212, 0.12);

  --accent-coral: #fb923c;
  --accent-coral-hover: #fdb874;
  --accent-coral-bg: rgba(251, 146, 60, 0.12);

  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Same dark mode values as above */
  }
}
```

---

## Summary of Findings

### What Was Inspected

| Resource | Status | Key Takeaway |
|----------|--------|-------------|
| **Existing frontend** | No frontend exists | Greenfield build, full design freedom |
| **awesome-design-md-main** | 73 DESIGN.md files inspected | 9-section format adopted; Linear, Sentry, IBM patterns most relevant |
| **taste-skill-main** | 1207-line skill + 13 sub-skills inspected | Three-dial system, anti-slop rules, typography discipline, dark mode protocol |
| **web-design-main** | SKILL.md + all references inspected | Dashboard scene defaults, spacing scale, interaction tiers, quality checklist |

### What Was Learned

1. **DESIGN.md-first workflow** is the industry standard for AI-assisted UI development
2. **Dashboard data MUST NOT use scroll-reveal** - immediate visibility is critical for scientific data
3. **Dual accent system** (teal for scientific/positive, coral for biological/alert) maps perfectly to brain age semantics
4. **L1 interaction tier** is correct for a data dashboard; L2 only for landing page
5. **Anti-slop discipline** prevents the most common AI-generated design cliches
6. **Self-hosted fonts** with `font-display: swap` required; no Google Fonts CDN links
7. **Four-tier text luminance** creates clear hierarchy without pure black/white

### Recommended Next Phase

**Phase 1: Foundation** - Scaffold the Vite + React + TypeScript project, install dependencies, implement the design token system, build the layout shell and primitive UI components, and create the full `DESIGN.md` specification document. This gives us a running application skeleton that all subsequent feature work builds upon.
