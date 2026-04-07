# Holdout Test Results — api-key-management-server

## duplicate-label-returns-409.md: Duplicate label returns 409

Status: PASS

Evidence:
- `POST /api/v1/installs/route.ts` performs a pre-insert SELECT filtered by `orgId`, `label`, and `isNull(revokedAt)`. A matching non-revoked row returns 409 `{ "error": "label already in use" }`.
- Revoked installs are excluded from the uniqueness check (`isNull(installs.revokedAt)` in the WHERE clause), so label reuse after revocation produces a 201 insert.
- Cross-org isolation is enforced: `eq(installs.orgId, orgId)` scopes the check to the session's org only; a same-label install in another org does not trigger 409.
- Concurrent duplicate (EC-5): the `catch` block detects a UNIQUE constraint violation in the message string and maps it to 409, providing a second safety layer beyond the pre-insert SELECT.

---

## revoke-then-activate-returns-403.md: Revoke-then-activate returns 403

Status: PASS

Evidence:
- `PATCH /api/v1/installs/[id]/revoke/route.ts` sets `revokedAt = new Date()` on the install (scoped to session `orgId`) and returns 200 `{ ok: true }`.
- `POST /api/v1/installs/activate/route.ts` calls `requireApiKey(request)` first. In `requireApiKey`, after looking up the install row, the revocation check `if (installRow.revokedAt !== null)` returns early with 403 `{ "error": "api key revoked" }` — before the fire-and-forget `lastSeenAt`/`expiresAt` update is reached and before the activate handler body executes.
- The ordering assertion holds: revocation is checked before expiry, and the handler body is never entered for a revoked key. The install row remains unmodified (`computerName`, `gitUserId`, `lastSeenAt`, `expiresAt` are all untouched).

---

## activate-idempotent-second-call-succeeds.md: Activate idempotent — second call succeeds and overwrites

Status: PASS

Evidence:
- `POST /api/v1/installs/activate/route.ts` has no "already activated" guard. After passing `requireApiKey`, it unconditionally executes `UPDATE installs SET computerName, gitUserId, expiresAt, lastSeenAt WHERE id = installId`.
- A second call with new values overwrites `computerName` and `gitUserId` as required, and extends `expiresAt` to `now + 30d` and sets `lastSeenAt = now` in the same UPDATE.
- A third call with identical values is a no-op in effect (same values written again), returning 200 `{ ok: true }`.
- `requireApiKey` also performs a fire-and-forget update of `lastSeenAt` and `expiresAt` on every successful auth, consistent with the expected sliding expiry behavior.

---

## active-count-excludes-revoked-installs.md: Active count excludes revoked installs

Status: PASS

Evidence:
- **Assertion 1 (stats API)**: `GET /api/v1/dashboard/stats/route.ts` Query 1 uses `WHERE org_id = ? AND last_seen_at > thirtyDaysAgo AND revoked_at IS NULL`. This correctly counts only 2 active installs — excludes `install-revoked` (`revoked_at IS NOT NULL`) and `install-unactivated` (`last_seen_at = NULL`, fails `> thirtyDaysAgo`).
- **Assertion 2 (dashboard page)**: `app/(dashboard)/page.tsx` `fetchStats()` runs the identical SQL query with the same two filters. The "Active in last 30 days" stat card renders `{activeInstalls}` which equals 2.
- **Assertion 3 (installs list)**: `GET /api/v1/dashboard/installs/route.ts` uses a LEFT JOIN with no revocation filter, so all four installs are included. `revokedAt` is mapped to ISO string or null. `isActivated` is derived from `CASE WHEN computer_name IS NOT NULL THEN 1 ELSE 0 END`. `eventCount` uses `COUNT(events.id)` — historical events for the revoked install are counted. `computerName` and `gitUserId` are null for the unactivated install.
- **Assertion 4 (response shape)**: `InstallRecord` type and the allow-list map include all required fields: `label`, `revokedAt`, `expiresAt`, `isActivated`, `computerName`, `gitUserId`, plus legacy fields `id`, `createdAt`, `lastSeenAt`, `eventCount`, `lastEventAt`.
- **Assertion 5 (apiKey absent)**: `apiKey` is not in the SELECT column list, and the allow-list destructuring in `.map()` never references it. It cannot appear in the response.

---

## Summary

Total: 4 passed, 0 failed
