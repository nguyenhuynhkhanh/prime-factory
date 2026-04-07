# Scenario H-02: Migration preserves events.install_id references

## Type
edge-case

## Priority
critical — events referential integrity must survive migration

## Preconditions
- Migration 0000 applied
- One install row: id='install-ref-test-0000000000000001', org_id='org-1', computer_name='host', git_user_id='user', hmac='h', api_key='key-ref', created_at=1700000000, last_seen_at=NULL
- Two event rows referencing that install:
  - id='evt-1', install_id='install-ref-test-0000000000000001', org_id='org-1', command='df-intake', started_at=1700001000, created_at=1700001000
  - id='evt-2', install_id='install-ref-test-0000000000000001', org_id='org-1', command='df-debug', started_at=1700002000, created_at=1700002000

## Action
Apply migration 0001.

## Expected Outcome
- Migration completes without error
- `SELECT id FROM installs WHERE id = 'install-ref-test-0000000000000001'` returns 1 row
- `SELECT COUNT(*) FROM events` returns 2 (events unchanged)
- `SELECT install_id FROM events WHERE id = 'evt-1'` returns 'install-ref-test-0000000000000001'
- `SELECT install_id FROM events WHERE id = 'evt-2'` returns 'install-ref-test-0000000000000001'
- JOIN query still works:
  ```sql
  SELECT e.id, i.label FROM events e JOIN installs i ON e.install_id = i.id WHERE e.id = 'evt-1'
  ```
  Returns row with e.id='evt-1' and i.label='legacy-install-' (first 8 chars of 'install-ref-test-0000000000000001' = 'install-')

## Notes
- D1 does not enforce FK constraints, but the soft-FK relationship must remain functional after migration
- The label backfill 'legacy-' || substr('install-ref-test-0000000000000001', 1, 8) = 'legacy-install-r' (8 chars of 'install-r')
