# Scenario P-03: Existing rows receive correct label backfill

## Type
feature

## Priority
high

## Preconditions
- Migration 0000 applied
- Three existing rows with varied ids:
  - Row 1: id='aaaaaaaa-1111-1111-1111-111111111111', api_key='key-1', created_at=1700000000
  - Row 2: id='bbbbbbbb-2222-2222-2222-222222222222', api_key='key-2', created_at=1699000000
  - Row 3: id='cccccccc-3333-3333-3333-333333333333', api_key='key-3', created_at=1680000000

## Action
Apply migration 0001.

## Expected Outcome
- Row 1: label = 'legacy-aaaaaaaa', expires_at = 1702592000 (future at 2026-04-07)
- Row 2: label = 'legacy-bbbbbbbb', expires_at = 1701592000 (future at 2026-04-07)
- Row 3: label = 'legacy-cccccccc', expires_at = 1682592000 (ALREADY EXPIRED — intentional per EC-2)
- All rows: revoked_at = NULL
- `SELECT COUNT(*) FROM installs` returns 3
