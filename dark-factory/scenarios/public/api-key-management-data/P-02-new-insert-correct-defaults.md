# Scenario P-02: New insert after migration has correct defaults

## Type
feature

## Priority
high

## Preconditions
- Migration 0001 has been applied successfully
- The Drizzle schema in `db/schema.ts` matches the post-migration table shape

## Action
Insert a new row omitting `label`, `revoked_at`, `computer_name`, `git_user_id`:

```sql
INSERT INTO installs (id, org_id, api_key, expires_at, created_at)
VALUES ('new-uuid-0000-0000-0000-000000000099', 'org-new', 'key-new-111', 1777777777, 1775185200);
```

## Expected Outcome
- Insert succeeds without error
- Inserted row has:
  - label = '' (empty string — DEFAULT '' applied, NOT NULL satisfied)
  - computer_name = NULL
  - git_user_id = NULL
  - revoked_at = NULL
  - expires_at = 1777777777
- `SELECT label FROM installs WHERE id = 'new-uuid-0000-0000-0000-000000000099'` returns '' (empty string, not NULL)
