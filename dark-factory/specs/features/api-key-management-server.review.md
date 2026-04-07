# Architect Review — api-key-management-server

**Status: APPROVED WITH NOTES**

(Note: Initial review returned BLOCKED but all findings are implementation TODOs, not spec gaps. The spec is correct — these are things the code-agent must implement.)

## Key Decisions Made

1. **`requireApiKey` rewrite**: Remove `API_KEY_SALT` guard and `getCloudflareContext()` call entirely. Add `revokedAt` and `expiresAt` to SELECT. Check `revokedAt IS NOT NULL` first → 403. Check `expiresAt < now` second → 401. Fire-and-forget UPDATE must set both `lastSeenAt` AND `expiresAt = now + 2592000` (Unix seconds integer: `Math.floor(Date.now() / 1000) + 2592000`).

2. **`POST /api/v1/installs` full replacement**: The current 410 stub must be replaced with the `requireCtoSession`-gated admin key generation handler. Body: `{ label }`. Validates label (trimmed, non-empty, ≤ 64 chars). Checks label uniqueness among non-revoked installs (`WHERE org_id = ? AND label = ? AND revoked_at IS NULL`). Generates server UUID for `id`, 32-byte hex `apiKey`. Sets `expiresAt = Math.floor(Date.now() / 1000) + 2592000` in INSERT. Returns `201 { id, apiKey, label, expiresAt }`.

3. **`expiresAt` must be set on INSERT (creation time, not first use)**: Confirmed in spec. Code-agent must put this in the INSERT `.values()`, not defer to first Bearer auth.

4. **Three new route files to create**:
   - `app/api/v1/installs/[id]/revoke/route.ts` — PATCH, `requireCtoSession`, org-scope guard, idempotent (already revoked → 200)
   - `app/api/v1/installs/activate/route.ts` — POST, Bearer auth via `requireApiKey`, body: `{ computerName, gitUserId }`, idempotent (always overwrites), sets computerName + gitUserId + expiresAt + lastSeenAt in one UPDATE
   - `app/api/v1/orgs/route.ts` — PATCH, `requireCtoSession`, body: `{ name }`, orgId from session only

5. **`await ctx.params` for dynamic routes**: `const { id } = await ctx.params` in `[id]/revoke/route.ts` (Next.js 16 requirement from project profile).

6. **Dashboard installs query extension**: Add `installs.label`, `installs.revoked_at`, `installs.expires_at`, and `CASE WHEN computer_name IS NOT NULL THEN 1 ELSE 0 END AS is_activated` to SELECT in `GET /api/v1/dashboard/installs`. Update `InstallRow` and `InstallRecord` interfaces. Do NOT add `api_key`.

7. **Active-count queries — add `AND revoked_at IS NULL`** in all three locations:
   - `app/(dashboard)/page.tsx` active installs count query
   - `app/api/v1/dashboard/stats/route.ts` active installs count query
   - Extended installs route query

8. **`PATCH /api/v1/orgs` scoped to session orgId only**: Never read `orgId` from request body.

## Remaining Notes

- Timestamp mode: `db/schema.ts` uses `{ mode: "timestamp" }` — Drizzle D1 adapter may accept `Date` objects or raw Unix-second integers. The existing dashboard queries use raw integer arithmetic in raw SQL. For Drizzle `.update().set()` calls, use `new Date(expiresAtUnixSeconds * 1000)` if Drizzle accepts Date, or check the D1 adapter. Use whichever is consistent with how `lastSeenAt: new Date()` works in the existing `requireApiKey` fire-and-forget.
- Label uniqueness race: pre-insert SELECT check is acceptable (spec acknowledges narrow race window). No partial index needed.
- `PATCH revoke` on malformed UUID: SELECT returning 0 rows naturally produces 404. No UUID format validation needed.
- `apiKey` must never appear in GET responses. The dashboard installs allow-list pattern already handles this.
