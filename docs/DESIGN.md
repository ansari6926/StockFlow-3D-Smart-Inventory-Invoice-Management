# StockFlow 3D — UI/UX Design System Specification

## 1. Design Philosophy

**StockFlow 3D** follows a modern, futuristic SaaS aesthetic tailored for desktop and mobile inventory operators. The design balances visual polish (glassmorphism, subtle micro-animations, vibrant HSL gradients) with ultra-high information density and quick keyboard navigation.

---

## 2. Color System & Design Tokens

### 2.1 Theme Palette (Dark Mode Base)
- **Background**: `hsl(224, 71%, 4%)` (Deep Obsidian Midnight)
- **Card / Surface**: `hsl(224, 71%, 6%)` with `1px border border-border`
- **Primary Accent**: `hsl(210, 100%, 66%)` (Electric Indigo-Blue)
- **Secondary Surface**: `hsl(222.2, 47.4%, 14%)`

### 2.2 Functional Status Badges
- **Paid / Completed**: Emerald Green (`bg-emerald-500/15`, `text-emerald-500`, `border-emerald-500/30`)
- **Cancelled / Refunded**: Crimson Red (`bg-red-500/15`, `text-red-500`, `border-red-500/30`)
- **Low Stock Alert**: Amber Warm (`bg-amber-500/15`, `text-amber-500`, `border-amber-500/30`)

---

## 3. Typography & Micro-Animations

- **Primary Typeface**: `Inter` (Google Font) for UI controls, data tables, and forms.
- **Headings & Numbers**: `Space Grotesk` (Google Font) for monetary values and high-impact headlines.
- **Micro-Animations**:
  - `card-hover`: 3D elevation transition on hover (`transform: translateY(-2px); shadow-xl`).
  - `btn-shimmer`: Light shimmer animation gliding across call-to-action buttons.
  - `skeleton-wave`: Shimmering gradient loading skeletons for async data fetching.

---

## 4. Primary User Flows

### 4.1 Invoice Creation Flow (The Core Experience)
```
[Select / Search Product] ➔ [Validate Live Stock] ➔ [Set Quantity] ➔ [Apply Discount %] ➔ [Atomic Submit] ➔ [Success Dialog]
```
- Real-time cart calculation updating Subtotal, Discount, Tax (10%), and Total instantly without round-trips.
- Visual badge indicators when stock is low or items are already in cart.
- Server-enforced price displays reminding operators that prices are immutable from database.

### 4.2 Invoice Cancellation Flow (AI Change Loop Feature)
```
[Invoice Detail Page] ➔ [Click Cancel Invoice] ➔ [Confirmation Dialog] ➔ [RPC Execution] ➔ [Stock Restored Badge]
```
- Two-step safety dialog preventing accidental cancellations.
- Automatic cache revalidation refreshing inventory levels immediately upon cancellation.
