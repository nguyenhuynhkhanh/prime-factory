# H-02: Revoked install's historical events still appear in the event feed

**Spec refs:** BR-7, EC-9  
**Track:** Track A (installs page) + cross-cutting (events page — no changes required there)

## Type
edge-case / integration

## Priority
high — confirming the confirmed developer decision that revoke is non-destructive to event history

## Preconditions

- Install `install-abc` has `revokedAt` set (it is revoked).
- The `events` table contains rows with `install_id = 'install-abc'` from before the revoke.
- The Event Explorer page (`/events`) is otherwise functioning as currently implemented.

## Scenario: Revoked Install in Event Explorer

### Action
1. Navigate to `/events`.
2. Filter by the revoked install's ID (or do not filter — the events appear in the unfiltered feed).

### Expected Outcome
- Events with `install_id = 'install-abc'` appear in the event table.
- The event rows are not hidden, grayed out, or labeled as "from revoked install" — they display normally.
- The event count for this install is accurate.

## Scenario: Revoked Badge on Installs Page Does Not Remove Events

### Action
1. On the installs page, confirm that `install-abc` shows a Revoked badge.
2. Navigate to the Event Explorer.

### Expected Outcome
- The Event Explorer shows events from `install-abc` — the revoke action on the installs page did not delete or hide any events.

## Notes

- No code changes are needed to the events page for this scenario — it already shows events from all installs.
- This is a holdout scenario to confirm that the revoke implementation in `api-key-management-server` did not accidentally cascade-delete events, AND that no UI filtering was mistakenly added to the events page.
- The confirmed developer decision: "Historical events from revoked installs still show in dashboard."
