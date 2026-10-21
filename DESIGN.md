# NeuroAge Design Specification (DESIGN.md)

> Standardized 9-Section Design Specification for AI-Based Brain Age Prediction & Healthy Brain Aging Assessment.

---

## 1. Visual Theme & Atmosphere
- **Archetype**: Dark Precision Scientific / Clinical Research Console.
- **Atmosphere**: Restrained, objective, high-clarity, trustworthy, and academic.
- **Design Intent**: Eliminate AI-slop (no neon glows, no arbitrary purple gradations, no misleading diagnostic claims). Focus on high legible data hierarchy, immediate readability, and scientific rigor.

---

## 2. Color Palette & Roles

```css
:root {
  /* Surface Layers (Dark Mode Default) */
  --bg-canvas: #0a0b0e;
  --bg-surface-1: #111217;
  --bg-surface-2: #171921;
  --bg-surface-3: #1f222d;
  --bg-hover: #242836;

  /* 4-Tier Text Luminance */
  --text-primary: #ebecef;    /* ~92% luminance */
  --text-secondary: #c6c9d2;  /* ~78% luminance */
  --text-tertiary: #8d909c;   /* ~56% luminance */
  --text-quaternary: #60636f; /* ~40% luminance */

  /* Functional Accents */
  --accent-teal: #5eead4;         /* Precision, AI inference, youthful resilience */
  --accent-teal-rgb: 94, 234, 212;
  --accent-teal-bg: rgba(94, 234, 212, 0.12);

  --accent-coral: #fb923c;        /* Biological marker, deviation, warning */
  --accent-coral-rgb: 251, 146, 60;
  --accent-coral-bg: rgba(251, 146, 60, 0.12);

  /* Semantic Status */
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-critical: #ef4444;
  --status-info: #60a5fa;

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-strong: rgba(255, 255, 255, 0.16);
  --border-accent: rgba(94, 234, 212, 0.35);
}
```

---

## 3. Typography Rules
- **Display & Headings**: DM Sans / Inter (`letter-spacing: -0.02em`).
- **Body & Paragraphs**: Inter / DM Sans (`line-height: 1.6`, `max-width: 68ch`).
- **Data, Coordinates & Metrics**: JetBrains Mono (`font-variant-numeric: tabular-nums`).
- **Banned**: Comic Sans, Papyrus, Fraunces, random decorative serifs.

---

## 4. Component Stylings
- **Buttons**: 5 distinct states (`default`, `hover`, `active`, `focus-visible`, `disabled`). Active state simulates physical press (`scale(0.98)`).
- **Cards**: Flat with 1px subtle border; hover shows border brightening (`--border-strong`). NO translateY jumping in dense data grids.
- **KPI Indicators**: Large monospace metrics with signed delta badges.
- **MRI Slice Viewports**: Dark canvas frame with coordinate overlays and plane markers (Axial, Coronal, Sagittal).

---

## 5. Layout Principles
- **Grid Foundation**: 10-step spacing scale (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`, `128px`).
- **Structure**: Collapsible navigation sidebar (240px) + Header bar (56px) + Fluid content area (max 1440px).

---

## 6. Depth & Elevation
- Multi-tier surface luminance stacking rather than high-contrast drop-shadows.
- `shadow-sm: 0 2px 4px rgba(0,0,0,0.4)`
- `shadow-md: 0 4px 12px rgba(0,0,0,0.5)`
- `shadow-glow: 0 0 16px rgba(94,234,212,0.15)`

---

## 7. Animation & Interaction (L1 Tier)
- **Baseline**: L1 (Refined Static). Immediate data render; NO scroll-reveal delays on diagnostic numbers.
- **Transitions**: `150ms-250ms` with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **A11y**: Full `@media (prefers-reduced-motion: reduce)` override support.

---

## 8. Do's and Don'ts
- **DO**: Show explicit disclaimers stating this is an investigational research prototype, not a medical diagnostic tool.
- **DO**: Display confidence intervals and explain brain age delta (Brain-PAD) neutrally.
- **DON'T**: Fabricate diagnostic health statuses (e.g., "Brain Disease Detected").
- **DON'T**: Use AI-purple mesh gradients or unthrottled mouse-follow bloom effects.
- **DON'T**: Use em-dashes (`—`) in headers, summaries, or badges.

---

## 9. Responsive Behavior
- **Desktop (>= 1024px)**: Full multi-pane orthogonal MRI slice viewer + KPI cards + charts.
- **Tablet (768px - 1023px)**: 2-column stacked layout with collapsible sidebar.
- **Mobile (< 768px)**: Single-column linear layout; touch targets >= 44x44px.
