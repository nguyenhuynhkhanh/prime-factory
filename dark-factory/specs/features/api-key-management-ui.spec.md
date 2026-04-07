# Feature: api-key-management-ui

## Context

Admins (CTOs) need to provision and manage API keys for developer installs entirely from the dashboard. The prior onboarding model used a shared invite link that all developers followed; this feature replaces that with admin-generated per-install API keys that the admin distributes individually. Each key is generated with a human-readable label so the admin can identify which install it belongs to.

The feature also introduces four install status states (replacing the two-state Active/Inactive model), a top-level navigation so the admin can move between the dashboard, installs list, and org settings, and an org rename form.

This spec covers only the dashboard UI. All API routes are implemented in the `api-key-management-server` spec and must exist before this UI is built.

## Scope

### In Scope (this spec)
- Replace `app/(dashboard)/installs/page.tsx` with the new installs page (remove CopyInviteLink, add GenerateKeyModal trigger, new status model, Revoke button with confirmation, `label` column, nullable `computerName`/`gitUserId` rendering)
- New `app/(dashboard)/installs/GenerateKeyModal.tsx` client component (label form, one-time key reveal, forced confirmation before close)
- Add minimal nav to `app/(dashboard)/layout.tsx` (Dashboard, API Keys, Org Settings links)
- New `app/(dashboard)/settings/page.tsx` server component (session gate, fetch org name, render RenameOrgForm)
- New `app/(dashboard)/settings/RenameOrgForm.tsx` client component (pre-filled input, PATCH /api/v1/orgs, success/error states)
- Delete / supersede `app/(dashboard)/installs/CopyInviteLink.tsx` (no longer used)

### Out of Scope (explicitly deferred)
- Key rotation (generating a replacement key for an existing install)
- Bulk revoke
- Per-install detail page
- Pagination or search on the installs list (the server-side LIMIT 200 cap from the existing page remains)
- Audit log UI (revoke events are stored server-side but not surfaced here)
- Email notifications on revoke

### Scaling Path
The installs page currently queries D1 directly in the Server Component (same pattern as `app/(dashboard)/page.tsx`). The new page calls `GET /api/v1/dashboard/installs` via fetch (matching the Events page pattern) because the API response shape now includes server-computed fields (`isActivated`, `revokedAt`) that live in the installs table alongside the existing columns. If the installs list grows beyond 200 and pagination becomes necessary, the API already supports it; the page just needs to thread `page` query params.

## Requirements

### Functional

- FR-1: The installs page MUST call `GET /api/v1/dashboard/installs` (via internal fetch with forwarded cookies) instead of querying D1 directly, because the API response includes `isActivated` and `revokedAt` which this UI needs.
- FR-2: The installs table MUST include a `Label` column as the first column, populated from the `label` field in the API response.
- FR-3: `computerName` and `gitUserId` MUST render as `"—"` when null. This matches the pattern already used in `app/(dashboard)/page.tsx` and `app/(dashboard)/events/page.tsx`.
- FR-4: The Status badge MUST implement four states in priority order:
  - **Revoked** (`revokedAt IS NOT NULL`) — red badge — overrides all other states
  - **Active** (`isActivated && revokedAt IS NULL && lastSeenAt within 30d`) — green badge
  - **Inactive** (`isActivated && revokedAt IS NULL && (lastSeenAt IS NULL OR > 30d ago)`) — gray badge
  - **Pending** (`!isActivated && revokedAt IS NULL`) — amber badge
- FR-5: The `CopyInviteLink` import and usage MUST be removed from the installs page. The file `CopyInviteLink.tsx` can be deleted.
- FR-6: A "Generate API Key" button MUST appear above the installs table (and in the empty state). Clicking it opens `GenerateKeyModal`.
- FR-7: The installs table MUST have a Revoke action column. Each row where `revokedAt IS NULL` renders an enabled Revoke button. Rows where `revokedAt IS NOT NULL` render no button (or a disabled/absent placeholder to avoid column collapse).
- FR-8: Clicking Revoke MUST show an inline or modal confirmation step before calling `PATCH /api/v1/installs/[id]/revoke`. The user must explicitly confirm — a single click must not immediately revoke.
- FR-9: After a successful revoke, the affected row's Status badge MUST update to Revoked and the Revoke button MUST disappear/disable without a full page reload. The installs page is a Server Component; the revoke interaction is client-side state managed in a wrapping client component.
- FR-10: `GenerateKeyModal` MUST be a `"use client"` component with props `{ orgId: string, onSuccess: (label: string) => void }`.
- FR-11: `GenerateKeyModal` MUST contain a controlled `label` input (required, `maxLength={64}`).
- FR-12: On 201 from `POST /api/v1/installs`, the modal MUST display the `apiKey` value in a monospace, select-all-on-click element with the warning "Copy this key now — you won't be able to see it again".
- FR-13: The modal MUST show an "I've copied it" confirmation button. This is the ONLY way to close the modal after a key is generated — no escape key, no backdrop click, no X button should dismiss the modal once the key is shown.
- FR-14: On 409 from `POST /api/v1/installs`, the modal MUST display "A key with this label already exists".
- FR-15: On any other non-201 response, the modal MUST display a generic error message.
- FR-16: The modal MUST show a loading state during submit (button disabled, visual indicator).
- FR-17: `app/(dashboard)/layout.tsx` MUST render a `<nav>` with `<Link>` components to Dashboard (`/`), API Keys (`/installs`), and Org Settings (`/settings`). The layout still gates session and redirects to `/login` if unauthenticated.
- FR-18: `app/(dashboard)/settings/page.tsx` MUST be a Server Component that calls `requireCtoSession()`, redirects to `/login` on failure, queries D1 for the current org name (`SELECT name FROM orgs WHERE id = ?`), and renders `<RenameOrgForm>`.
- FR-19: `RenameOrgForm` MUST be a `"use client"` component with props `{ orgId: string, currentName: string }`. The text input is pre-filled with `currentName`.
- FR-20: On 200 from `PATCH /api/v1/orgs`, `RenameOrgForm` MUST show a "Saved" success indicator and update the displayed name in the input.
- FR-21: On error from `PATCH /api/v1/orgs`, `RenameOrgForm` MUST render the error message using the project's standard error pattern: `<p className="text-sm text-red-600" role="alert">`.
- FR-22: `RenameOrgForm` MUST show a loading state during submit.

### Non-Functional

- NFR-1: All new client components MUST follow the existing controlled-form pattern: `useState` + `fetch` + `FormEvent<HTMLFormElement>` (as in `app/(auth)/login/page.tsx`).
- NFR-2: All Tailwind class names for badges, inputs, buttons, and error messages MUST match the exact values documented in the existing patterns (see Implementation Notes).
- NFR-3: The installs page MUST forward cookies to the internal API fetch (same pattern as `app/(dashboard)/events/page.tsx` using `cookies()` from `next/headers`).
- NFR-4: The installs page MUST handle fetch errors gracefully and render an error state rather than crashing (same pattern as existing pages).
- NFR-5: `searchParams` and any async Next.js APIs MUST be awaited (Next.js version in this project has breaking changes — see AGENTS.md).

## Data Model

No schema changes in this sub-spec. All new fields (`label`, `revokedAt`, `isActivated`, `computerName`, `gitUserId`) are read from the API response shape defined in `api-key-management-server`.

The installs page switches from a direct D1 query to calling `GET /api/v1/dashboard/installs`. The existing `InstallRow` / `InstallRecord` types in `installs/page.tsx` are replaced by a new `DashboardInstall` interface matching the API response.

## Migration & Deployment

N/A — no existing data affected. This spec changes how the dashboard reads install data (API call instead of direct query) and adds new UI. There are no schema changes, cache keys, or stored formats altered by this spec. The `CopyInviteLink.tsx` file is deleted; it is not imported anywhere else in the codebase.

## API Endpoints Consumed

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/v1/dashboard/installs | List installs with status fields | admin session |
| POST | /api/v1/installs | Generate new API key | admin session |
| PATCH | /api/v1/installs/[id]/revoke | Revoke an install | admin session |
| PATCH | /api/v1/orgs | Rename org | admin session |

## Business Rules

- BR-1: Revoked status overrides all other status logic. If `revokedAt IS NOT NULL`, the badge is Revoked regardless of `isActivated` or `lastSeenAt`. — Prevents misleading "Active" badge on a revoked install.
- BR-2: Pending means the key was generated but the developer has not yet run `df-onboard` (i.e., `isActivated === false`). The install row exists in D1 but has never authenticated. — Distinguishes "key issued, not yet used" from "key was used but machine hasn't been seen recently".
- BR-3: The 30-day active window threshold is the same as the existing `isActiveInstall()` helper: `Date.now() - new Date(lastSeenAt).getTime() < 30 * 24 * 60 * 60 * 1000`. Exactly 30 days ago is Inactive (exclusive boundary).
- BR-4: The API key is shown exactly once — immediately after the 201 response. The modal does not allow closing until the admin confirms they have copied it. This is a security requirement: the plaintext key is never stored and cannot be retrieved later.
- BR-5: Re-activate is handled server-side and is idempotent (confirmed developer decision). The UI does not need a "reactivate" action.
- BR-6: The label field is admin-defined at key generation time and is immutable after creation. The UI must not allow editing a label.
- BR-7: Historical events from revoked installs still appear in the Event Explorer. The revoke action does not delete events.

## Error Handling

| Scenario | Response | UI Behavior |
|----------|----------|-------------|
| POST /installs — missing label | 400 `{ error: "missing required fields" }` | Generic error message in modal |
| POST /installs — label too long | 400 `{ error: "label too long" }` | Generic error message in modal (prevented client-side by maxLength=64) |
| POST /installs — duplicate label | 409 `{ error: "label already in use" }` | "A key with this label already exists" in modal |
| PATCH /installs/[id]/revoke — not found | 404 | Generic error shown inline in the installs table row or toast |
| PATCH /api/v1/orgs — validation error | 400 `{ error: string }` | Error message rendered as `<p role="alert">` in RenameOrgForm |
| GET /api/v1/dashboard/installs — network/server error | any non-ok | Full-page error state: "Unable to load API keys. Please refresh the page." |
| Settings page — D1 query fails | exception | Server Component catches and renders error state |

## Acceptance Criteria

- [ ] AC-1: Navigating to `/installs` shows a "Generate API Key" button above the table (or empty state).
- [ ] AC-2: Clicking "Generate API Key" opens the modal with a label input and a disabled submit button when the input is empty.
- [ ] AC-3: After successful key generation, the modal shows the API key in a monospace element with the one-time warning.
- [ ] AC-4: The modal cannot be dismissed by clicking outside or pressing Escape while the key is displayed.
- [ ] AC-5: Clicking "I've copied it" closes the modal.
- [ ] AC-6: The installs table shows four badge states: Revoked (red), Active (green), Inactive (gray), Pending (amber).
- [ ] AC-7: Revoked badge takes priority over Active/Inactive logic.
- [ ] AC-8: Rows where `revokedAt IS NULL` show an enabled Revoke button.
- [ ] AC-9: Rows where `revokedAt IS NOT NULL` show no enabled Revoke button.
- [ ] AC-10: Clicking Revoke shows a confirmation step before the API call is made.
- [ ] AC-11: After confirming revoke, the row's badge updates to Revoked without a full page reload.
- [ ] AC-12: `computerName` and `gitUserId` render as `"—"` when null.
- [ ] AC-13: The `label` column appears as the first column in the installs table.
- [ ] AC-14: The layout renders nav links to Dashboard, API Keys, and Org Settings.
- [ ] AC-15: Navigating to `/settings` renders the RenameOrgForm pre-filled with the current org name.
- [ ] AC-16: Submitting a new org name with a valid value shows "Saved" and updates the input.
- [ ] AC-17: Submitting an invalid org name shows an error message with `role="alert"`.
- [ ] AC-18: Unauthenticated access to `/installs` or `/settings` redirects to `/login`.

## Edge Cases

- EC-1: An install with `isActivated=true`, `revokedAt` set, and `lastSeenAt` within 30 days — badge MUST be Revoked (BR-1 override).
- EC-2: An install with `isActivated=false` and `revokedAt` set — badge MUST be Revoked, not Pending.
- EC-3: An install with `isActivated=true`, `revokedAt=null`, and `lastSeenAt` exactly 30 days ago — badge is Inactive (exclusive boundary, same as existing BR-3).
- EC-4: Admin submits GenerateKeyModal and the POST succeeds (201) but `onSuccess` callback causes the parent to refresh the installs list — modal remains open showing the key until the admin clicks "I've copied it".
- EC-5: Admin tries to close the key-reveal modal by pressing Escape or clicking outside — must not dismiss.
- EC-6: Revoke button is clicked and the PATCH returns 404 (install was already deleted server-side) — show error inline, do not crash.
- EC-7: Label input at exactly 64 characters — allowed. At 65 characters — the `maxLength` HTML attribute prevents input; if sent via a non-browser client, server returns 400.
- EC-8: Installs list is empty — empty state is shown AND the "Generate API Key" button is still present.
- EC-9: After revoking an install, the Event Explorer still shows that install's historical events when filtered by installId.
- EC-10: `computerName` or `gitUserId` contains HTML special characters (e.g., `<script>`) — React JSX escaping prevents XSS.
- EC-11: `RenameOrgForm` is submitted with the same name as current — server returns 200; UI shows "Saved" (idempotent).

## Dependencies

- **Depends on**: `api-key-management-server` (all API routes listed above must exist and return the documented response shapes before this UI can be tested end-to-end)
- **Depended on by**: none
- **Group**: api-key-management

## Implementation Size Estimate

- **Scope size**: medium (5 files modified/created + 1 deleted)
- **Suggested parallel tracks**: 2 tracks with zero file overlap:
  - **Track A** — installs page rework: `app/(dashboard)/installs/page.tsx` + `app/(dashboard)/installs/GenerateKeyModal.tsx` + delete `CopyInviteLink.tsx`
  - **Track B** — nav + settings: `app/(dashboard)/layout.tsx` + `app/(dashboard)/settings/page.tsx` + `app/(dashboard)/settings/RenameOrgForm.tsx`

## Implementation Notes

Patterns to follow (grounded in codebase evidence):

**Form pattern** — `app/(auth)/login/page.tsx`: controlled `useState` + `fetch` + `FormEvent<HTMLFormElement>`. Error state rendered as `<p className="text-sm text-red-600" role="alert">`. Button disabled during loading with `disabled:opacity-50`.

**One-time reveal pattern** — `app/(auth)/signup/page.tsx`: after API success, switch to a different render branch that shows the sensitive value in a `<code>` element inside a `border bg-gray-50 rounded` container. The "I've copied it" button is the only exit from that state.

**Internal fetch with cookies** — `app/(dashboard)/events/page.tsx`: `cookies()` from `next/headers`, `.getAll().map(...).join("; ")`, forwarded as `cookie` header. `cache: "no-store"`. `NEXT_PUBLIC_BASE_URL` env var.

**Null rendering** — `app/(dashboard)/page.tsx` and `events/page.tsx`: `{value ?? "—"}` inline in JSX.

**Status badges** (exact Tailwind classes):
- Active: `inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800`
- Inactive: `inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600`
- Revoked (new): `inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700`
- Pending (new): `inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700`

**Nav** — simple `<nav>` with Next.js `<Link>` components. No external navigation library. The layout already imports `redirect` and `requireCtoSession`; add `import Link from "next/link"`.

**installs/page.tsx fetch** — switch from the current direct D1 query (using `getDatabase()` + `drizzle-orm/sql`) to calling `GET /api/v1/dashboard/installs` via `fetch` (same pattern as events page). The existing `InstallRow` / `InstallRecord` types are replaced. Keep the `isActiveInstall()` 30-day threshold logic but apply it only when `revokedAt IS NULL && isActivated`.

**Revoke interaction** — the installs page is a Server Component. To handle client-side revoke state without converting the whole page to a client component, extract the table body (or the full interactive part) to a `"use client"` wrapper component that holds local state for which row IDs have been revoked.

---

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 (installs fetch via API) | P-01 |
| FR-2 (label column) | P-01 |
| FR-3 (null computerName/gitUserId → "—") | P-03, H-04 |
| FR-4 (4-state badge logic) | P-03, H-03 |
| FR-5 (CopyInviteLink removed) | P-05 |
| FR-6 (Generate API Key button) | P-01, P-02 |
| FR-7 (Revoke button column) | P-04 |
| FR-8 (revoke confirmation) | P-04, P-06 |
| FR-9 (row updates after revoke) | P-04 |
| FR-10–FR-16 (GenerateKeyModal) | P-02, H-01 |
| FR-17 (nav links) | P-05 |
| FR-18–FR-19 (settings page + RenameOrgForm) | P-07 |
| FR-20–FR-22 (RenameOrgForm submit) | P-07 |
| BR-1 (Revoked overrides all) | H-03 |
| BR-2 (Pending state) | P-03 |
| BR-3 (30-day boundary) | P-03 |
| BR-4 (key shown once, forced confirm) | P-02, H-01 |
| BR-7 (historical events survive revoke) | H-02 |
| EC-1 (Revoked overrides Active) | H-03 |
| EC-2 (Revoked overrides Pending) | H-03 |
| EC-3 (30-day exclusive boundary) | P-03 |
| EC-4 (modal stays open during parent refresh) | H-01 |
| EC-5 (Escape / backdrop does not close) | H-01 |
| EC-6 (404 on revoke) | P-04 (notes), P-06 |
| EC-7 (label max 64) | P-02 |
| EC-8 (empty state + generate button) | P-01 |
| EC-9 (revoked install events still visible) | H-02 |
| EC-10 (XSS in computerName) | H-04 |
| EC-11 (rename same name is idempotent) | P-07 |
