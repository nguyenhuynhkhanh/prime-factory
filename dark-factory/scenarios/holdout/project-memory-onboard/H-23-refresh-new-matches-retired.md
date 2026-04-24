# Scenario: H-23 — Refresh: new candidate matches a previously retired entry

## Type
edge-case

## Priority
low — EC-15. Possible when a rule is removed then re-introduced later.

## Preconditions
- onboard-agent incremental-refresh section present.

## Action
Structural test asserts the refresh section documents:
1. When a new candidate has the same `title` + `rule` as an existing `status: retired` entry, the agent FLAGS the match to the developer with a "possible un-retirement" note.
2. The agent does NOT auto-reactivate the retired entry.
3. The developer may choose: (a) accept the new candidate as a brand-new entry (new ID), (b) un-retire the existing entry (flip status back to `active`, optionally with a `reactivatedAt` timestamp), or (c) reject the new candidate.
4. Option (b) is implemented as another status flip — never a delete-and-re-add.

## Expected Outcome
- Match-detection documented.
- Un-retirement as status flip documented.
- Developer choices enumerated.

## Failure Mode (if applicable)
If the documentation would auto-reactivate retired entries, test fails. If the developer is not offered a choice, test fails.

## Notes
This handles the case where a removed rule comes back. The history of retirement is preserved; reactivation is explicit and auditable.
