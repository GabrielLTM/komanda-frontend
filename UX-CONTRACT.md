# UX Contract

## Product context

- **Audience:** Staff at Mau Mau Lanches.
- **Primary jobs:** Manage menu categories and products, delivery neighborhoods, and courier records.
- **Target market:** Brazilian local food-service operation, based on the Mau Mau Lanches source UI (Guaíba), Portuguese copy, and BRL values.
- **Active locale:** `pt-BR`.
- **Language/content register:** Direct, practical Brazilian Portuguese; user-facing messages describe the action and recovery.
- **Timezone/calendar policy:** Browser-local dates/times in the existing demonstration screens; no server-backed order timeline is claimed.
- **Accessibility target:** WCAG 2.2 AA baseline for touched catalog and courier workflows.

## Business-context sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Catalog and API fields | `compatibilidade-mau-mau.md`, integration planning artifact | API / product brief | 2026-10-22 |
| Orders and settlement availability | `compatibilidade-mau-mau.md`, integration planning artifact | Product brief | 2026-10-22 |
| Inventory outside the initial MVP | Explicit user scope decision in this conversation on 2026-10-22 | Current product decision | 2026-10-22 |
| Permission, deletion retention, billing, legal | Not specified by this frontend integration | Not applicable | 2026-10-22 |

The plan is the task's authoritative integration brief. API behavior is also checked against the backend contract and real local API during integration smoke tests; frontend code does not infer persistence guarantees from demo screens.

## Visual contract

- **Project design system:** [DESIGN.md](DESIGN.md).
- **Token ownership:** Existing `src/index.css` and established component styles are runtime-canonical; `DESIGN.md` mirrors the values used by the source.
- **Runtime source and mapping:** Local Plus Jakarta Sans and IBM Plex Mono `@font-face` declarations in `src/index.css`; palette, border, radius, and spacing values are currently consumed directly in components.
- **Theme:** Warm light palette, matching the imported product source.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native `<select>` for order neighborhood; labeled category buttons elsewhere | Existing source UI plus this contract | Native | Browser keyboard and selection smoke |
| Form | Owning CRUD component and shared API service | API plan and existing source workflow | Create / edit | Adapter tests and failure-state browser smoke |
| Scrollbar | Global `src/index.css` baseline | Existing runtime stylesheet | Warm visible scrollbar | Computed style / visual review |
| Toast | `src/components/Toast.jsx` | This contract | Polite status; inline error for recoverable failures | Static semantics and browser smoke |
| CRUD | `src/App.jsx` handlers through `src/services/api.js` | Backend API contract | Return to list after success; remain in form after failure | Node adapter tests and API/Postgres browser smoke |

## Component behavior

- **Buttons:** Native buttons; actions expose text, disabled state, and existing busy state. Destructive actions use an explicit in-app confirmation before DELETE.
- **Inputs:** Visible label or accessible name; invalid input retains its value and receives a corrective message.
- **Catalog lists:** API data is authoritative. Empty lists stay empty; load failures offer retry.
- **Search:** Local filtering only; query is transient and can be cleared by editing the field.

## Dataset navigation

- **Admin lists:** Render the backend's current arrays without invented pagination. The MVP API returns unpaginated arrays.
- **Loading, empty, and errors:** Initial load has status text; empty states describe missing records; load errors have retry; mutation errors remain visible in the owning form or list.
- **Navigation state:** Local tab and search state remain transient.

## Flow ledger

| Operation | Trigger | Pending | Success destination | Success feedback | Failure recovery | Focus outcome | Source ref |
|---|---|---|---|---|---|---|---|
| Create catalog item/category/neighborhood/courier | Save or Add | Owning mutation lock; duplicate action blocked | Return to owning list only after API success | Existing app toast | Keep form values and show server error inline | Keep dialog open on failure | Integration brief + backend API |
| Edit product/category/neighborhood/courier | Save | Owning mutation lock | Return to list after API success | Existing app toast | Keep edits and show server error | Keep editor open on failure | Integration brief + backend API |
| Toggle active state / reorder | Row action | Mutation lock; no optimistic local persistence | Stay in list with server response reflected | Existing app toast | Preserve server state and show list error | Stay at row | Integration brief + backend API |
| Delete record | Inline confirm then Delete | Mutation lock | Remove row after API success | Existing app toast | Keep row and confirmation available; show API conflict/error | Stay at row | Integration brief + backend API |
| Load cadastros | App start or retry | Stable loading status | Show API-backed lists | None required | Retry action; never populate demo catalog records | Keep current page | Integration brief + backend API |
| Finish order / reset / settlement | Unavailable controls | No API write | Stay on current view | Explain unavailable operation | Preserve cart/draft; no partial writes | Keep current screen | Integration brief |

## Navigation and responsive behavior

- Tab navigation stays inside the single-page shell. The initial source layout has a 210px rail and main content that scrolls naturally.
- Inventory is outside the MVP: it has no navigation item, rendered tab, or pending-delivery warning. Existing inventory source code is retained for a possible later phase; it is not mounted by the app.
- Modal content is bounded by the viewport and can scroll internally; save/cancel actions remain reachable.
- Long row actions wrap on narrow screens instead of being hidden.

## Overlays and feedback

- Existing app-owned modal components carry dialog roles, accessible titles, focus the first field, close with Escape through the application key handler, and retain form contents on failure.
- Destructive actions use inline app-owned confirmation because the existing interaction is a compact row-level action; no native browser confirmation is used.
- Success feedback uses the shared toast. Errors that need recovery appear inline/page-level and are not conveyed by toast alone.

## Async and resilience

- Catalog and admin mutations are pessimistic: update visible list state only after the API responds successfully.
- A shared mutation lock prevents duplicate writes from overlapping controls.
- Offline reads show an error with a retry control; mutation failures preserve form data and surface the backend message.
- Startup request sequences prevent an older StrictMode/retry response from overwriting the latest result.
- Orders, cash, courier settlement, and reset remain clearly marked demonstrations/unavailable; they do not issue partial backend mutations. Inventory is excluded from the MVP rather than presented as a pending feature.

## Validation

- Product price must be a finite positive number; zero is preserved where the backend permits it (courier daily value and delivery fee).
- Neighborhood fee and courier daily value must be finite and non-negative.
- Server validation messages are shown in the relevant form. Empty description maps to `null`; omitted PATCH fields remain omitted.
- Forms own validation and do not use browser-native alert/confirm/prompt APIs.

## Verification

- **Static commands:** `npm test`, `npm run build`, and the scoped strict premium UI audit.
- **Browser/API:** Parent task performs the local backend/PostgreSQL create/edit/toggle/reorder/delete, reload-persistence, retry, and failure-preservation smoke tests.
- **Canonical sibling workflow:** Imported Cardápio and Category modal patterns are preserved and extended with the same service/mutation behavior.
