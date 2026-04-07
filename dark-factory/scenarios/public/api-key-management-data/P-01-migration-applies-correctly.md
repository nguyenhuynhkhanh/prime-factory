# Scenario P-01: Migration applies correctly to a database with existing installs

## Type
feature

## Priority
critical

## Preconditions
- A SQLite database has migration 0000 applied
- The `installs` table has the old shape: id, org_id, computer_name (NOT NULL), git_user_id (NOT NULL), hmac (NOT NULL), api_key, created_at, last_seen_at
- Two existing rows:
  - Row A: id='abc12345-0000-0000-0000-000000000001', org_id='org-1', computer_name='macbook-pro', git_user_id='gh-user-1', hmac='hmac-value-1', api_key='key-aaa', created_at=1700000000, last_seen_at=1700010000
  - Row B: id='def67890-0000-0000-0000-000000000002', org_id='org-2', computer_name='dev-laptop', git_user_id='gh-user-2', hmac='hmac-value-2', api_key='key-bbb', created_at=1700100000, last_seen_at=NULL

## Action
Apply migration `db/migrations/0001_api_key_management.sql` by executing each statement separated by `--> statement-breakpoint` in order.

## Expected Outcome
- Migration completes without error
- `installs` table has columns: id, org_id, label, computer_name, git_user_id, api_key, expires_at, revoked_at, created_at, last_seen_at
- `hmac` column does NOT exist (`PRAGMA table_info(installs)` shows no hmac column)
- Row A:
  - id = 'abc12345-0000-0000-0000-000000000001'
  - label = 'legacy-abc12345'
  - computer_name = 'macbook-pro'
  - api_key = 'key-aaa'
  - expires_at = 1702592000 (1700000000 + 2592000)
  - revoked_at = NULL
  - last_seen_at = 1700010000
- Row B:
  - id = 'def67890-0000-0000-0000-000000000002'
  - label = 'legacy-def67890'
  - api_key = 'key-bbb'
  - expires_at = 1702692000 (1700100000 + 2592000)
  - revoked_at = NULL
  - last_seen_at = NULL
- `SELECT COUNT(*) FROM installs` returns 2
- `installs_org_id_idx` index exists
- `installs_api_key_unique` unique index exists and functional
