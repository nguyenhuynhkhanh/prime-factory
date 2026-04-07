# Scenario H-01: Migration succeeds when installs table is empty

## Type
edge-case

## Priority
high — fresh environments and staging resets have empty installs tables

## Preconditions
- Migration 0000 applied
- `SELECT COUNT(*) FROM installs` returns 0
- `events` table is empty

## Action
Apply migration 0001.

## Expected Outcome
- All SQL statements execute without error
- `SELECT COUNT(*) FROM installs` returns 0 (no rows — not an error)
- `PRAGMA table_info(installs)` shows new column list: id, org_id, label, computer_name, git_user_id, api_key, expires_at, revoked_at, created_at, last_seen_at
- `hmac` column does not appear
- `installs_org_id_idx` index exists
- `installs_api_key_unique` index exists
- A new insert after migration succeeds:
  ```sql
  INSERT INTO installs (id, org_id, api_key, expires_at, created_at)
  VALUES ('test-empty-migration', 'org-x', 'key-x', 1800000000, 1775185200);
  ```
