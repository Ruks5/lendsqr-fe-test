# Lendsqr Admin – Frontend Assessment

A React + TypeScript + SCSS build of four screens from the Lendsqr admin console: **Login**, **Dashboard**, **Users** and **User details**. The Users screens run against a mock API of 500 generated records.

> **Live demo:** _add your deployment URL here_ > **Demo login:** any well-formed email and a password of 8 or more characters (e.g. `adedeji@lendsqr.com` / `password123`).

---

## Quick start

```bash
nvm use            # Node 22 (any Node >= 18.18 works)
npm install
npm run dev        # http://localhost:5173
```

| Script                   | What it does                                 |
| ------------------------ | -------------------------------------------- |
| `npm run dev`            | Vite dev server                              |
| `npm run build`          | Type-check, then production build to `dist/` |
| `npm run preview`        | Serve the production build                   |
| `npm test`               | Run the unit and integration tests once      |
| `npm run test:coverage`  | Tests with a coverage report                 |
| `npm run lint`           | ESLint                                       |
| `npm run format`         | Prettier                                     |
| `npm run generate:users` | Regenerate the 500-record dataset (seeded)   |

## Tech stack

- **React 18 + TypeScript** (strict mode), built with **Vite**
- **SCSS modules**, with shared design tokens and mixins in `src/styles`
- **React Router 6**, with routes code-split using `React.lazy`
- **Vitest + React Testing Library + user-event** for tests
- **@faker-js/faker** (dev only) to generate the mock data

There is no UI kit and no state-management library. The app is small enough that React context and the URL cover all of its state, and every component is hand-built from the design.

## Mock API

`scripts/generate-users.mjs` generates 500 users with a fixed seed, so the output is the same on every run. The record shape is derived from the Figma frames: table fields, profile, education and employment, socials, guarantors, bank and tier. The output is written to `public/mock/users.json`.

The app fetches from `VITE_USERS_API_URL`:

```bash
cp .env.example .env
# VITE_USERS_API_URL=https://<your-endpoint>
```

- **Unset:** the app uses `/mock/users.json`, which is served alongside the deployed app. That makes the deployment its own dedicated endpoint, not one shared with other submissions.
- **Hosted elsewhere:** upload `public/mock/users.json` to any JSON host (npoint.io, mocky.io, json-generator, mockapi.io) and set the URL. Both a bare array and a `{ "data": [...] }` envelope are accepted.

All responses are validated at runtime (`src/api/users.ts`). A malformed record is dropped instead of crashing the table, and a response with the wrong shape shows the error state.

## Project structure

```
src/
  api/            fetch wrapper (timeout, abort, typed errors) and the users endpoint + validation
  components/
    icons/        inline SVG icon set (currentColor)
    layout/       app shell: header, sidebar, navigation config, page loader
    ui/           Button, TextField/SelectField, StatusBadge, Skeleton, StateMessage, ConfirmDialog
  features/
    auth/         mock session, AuthProvider, RequireAuth route guard
    users/        UsersProvider (data + status changes) and Users-page components
    user-details/ profile summary, accessible tabs, tab panels
    toast/        toast notifications announced via a live region
  hooks/          useDismiss, useMenuKeyboard, useDocumentTitle
  lib/            pure logic: filtering, pagination, stats, formatting, validation, storage
  pages/          one file per route (lazy-loaded)
  styles/         tokens, mixins, global styles
  test/           setup, fixtures, renderApp helper
```

Business logic (`lib/`) is pure and framework-free, so most behaviour is tested without rendering. Components stay thin.

## Key decisions

### Pagination, not virtualization

The table is paginated at 10, 20, 50 or 100 rows per page, which caps the DOM at 100 rows. Virtualization pays off when thousands of rows are in the DOM at once. At 100 rows it would add complexity (fixed row heights, broken native find-in-page, screen-reader quirks, a harder mobile card layout) for no measurable gain. With 500 records, filtering and slicing in memory takes well under a millisecond. Other measures keep the UI responsive:

- `useMemo` on filtering, stats and page slicing, keyed on the data and the URL params
- memoised table rows (`React.memo`), so a status change re-renders one row
- filters apply on submit, not on each keystroke
- `Intl` formatters created once at module load, not once per cell

If the dataset grew to tens of thousands of rows, the next step would be server-side pagination and filtering (the URL-driven state already maps directly onto query params). Virtualization only becomes worth it for very long infinite-scroll lists.

### Fetch once, filter on the client

The endpoint returns all 500 records, so the list is fetched once per session by `UsersProvider`. Moving between Dashboard, Users and User details doesn't refetch. Requests have a 15s timeout and are cancelled on unmount.

### State lives in the URL

Filters, page, page size and the active details tab are stored as query params (`/users?status=Blacklisted&page=3`). Refresh, back/forward and shared links all work, and out-of-range or garbage values are clamped or ignored.

### User details and localStorage

- Opening a user (View Details, clicking a name, or a Dashboard link) saves that record to localStorage.
- The details page renders from the stored copy **immediately**, then swaps in the live record once the list loads and writes it back so the copy stays fresh.
- If the API is down, a previously viewed user still renders, with a "showing the saved copy" note and a Retry button.
- Storage is defensive: every read is parsed and validated, failures (private mode, quota exceeded, corrupt JSON) fall back silently, and only the 20 most recently viewed users are kept.
- Cached records contain personal data (BVN, phone numbers), so they are **cleared on logout**.
- **Blacklist** and **Activate** go through a confirmation dialog and are stored as status overrides merged over the API data. They stand in for a server mutation, so they survive logout.

### Gaps in the brief and how I filled them

| Gap                            | Decision                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| No Dashboard frame             | A compact overview: the stat cards, users by status, users by organization, and the 5 most recent sign-ups, each linking into a filtered Users view. |
| No auth backend                | Mock auth with full client validation, an 8-hour session, a route guard that returns you to the page you asked for, and logout.                      |
| "Forgot password?" has no flow | Reveals a short note that resets go through the organisation admin, rather than a dead link.                                                         |
| Header search                  | Searches name, email, organization, status and phone, and submits to `/users?q=…`.                                                                   |
| Switch Organization            | Lists organizations from the data and opens Users filtered by the one you pick.                                                                      |
| Other sidebar items            | Each opens an honest "coming soon" page instead of a dead link. Unknown URLs get a 404 page.                                                         |
| Other tabs on User details     | Bank, Loans and Savings show what the data has. Documents and App & System show empty states.                                                        |
| Blacklisting is consequential  | Requires confirmation, and the action that matches the current status is disabled.                                                                   |
| Stat cards when the API fails  | Show "—", not a misleading 0.                                                                                                                        |
| Users with no guarantor        | "No guarantor on record" (about 10% of the dataset, on purpose).                                                                                     |

### Loading, empty and error states

| Where        | Loading                     | Empty                                                | Error                                                    |
| ------------ | --------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Stat cards   | skeleton values             | n/a                                                  | "—"                                                      |
| Users table  | skeleton rows, `aria-busy`  | "No users yet" / "No users match" with Clear filters | message with the cause and Try again                     |
| User details | page skeleton               | "User not found"                                     | saved copy with a Retry note, or an error with Try again |
| Dashboard    | skeleton cards and lists    | "No users yet"                                       | message with Try again                                   |
| Routes       | spinner while a chunk loads | 404 page                                             | error boundary with Reload                               |

## Responsive behaviour

- **≥ 1024px:** fixed sidebar and full header, as in the design.
- **< 1024px:** the sidebar becomes an off-canvas drawer (hamburger button, overlay, closes on Escape or navigation, page scroll locked).
- **< 768px:** search moves into the drawer, the Users table becomes stacked cards labelled per field, the filter popover gets a dedicated Filter button with an active-filter count, and the details action buttons go full width.
- On widths where the table doesn't fit, it scrolls horizontally inside its card. Long emails and names are truncated, with the full value in a tooltip.
- Stat cards: 4 columns ≥ 1280px, otherwise 2. The details grids go 5/4 → 3 → 2 columns.

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `aside`), a skip link, a table with a caption and `scope`d headers, and description lists (`dl`) on the details page.
- Every control has a label. Icon-only buttons have `aria-label`s.
- Form errors are linked with `aria-describedby` and `aria-invalid`, and focus moves to the first invalid field.
- Menus follow the WAI-ARIA menu-button pattern (arrow keys, Home/End, Escape returns focus). Tabs use a roving tabindex. The confirmation dialog traps focus and restores it on close.
- After client-side navigation, focus moves to `main` and the document title updates.
- Visible focus rings, `prefers-reduced-motion` respected, and status shown as text, not colour alone.

## Testing

89 tests (Vitest + RTL) cover positive and negative paths:

- **Logic:** filtering (each field, combinations, whitespace, no match), URL parsing (invalid values), pagination maths and the ellipsis range, stats, formatters, login validation.
- **API:** success, both response shapes, malformed records dropped, wrong shape, HTTP 503, network failure, invalid JSON, timeout, abort.
- **Storage:** round-trips, corrupt JSON, invalid shapes, cache eviction, `localStorage` throwing.
- **Session:** sign-in, invalid credentials, expiry, logout clearing personal data.
- **Pages (integration, real route tree):** login validation, password toggle, redirect when signed out; Users loading → data, pagination, page size, filter panel (including Escape and focus return), empty and error states with retry, blacklist with confirm and cancel, View Details persisting to storage; User details from the API, from storage when offline, not found, error, disabled actions, activate flow, keyboard tabs.

## Deployment

`vercel.json` adds an SPA rewrite, so deep links like `/users/42` work. Deploy with Vercel (or any static host that has an SPA fallback):

```bash
npm run build   # outputs dist/
```

## Known limitations

- Auth is mocked on the client and gives no real security.
- Status changes are stored per browser. A real implementation would `PATCH` the API and update optimistically.
- The design font for Login (Avenir Next) is proprietary. It is used if installed and falls back to Work Sans.
