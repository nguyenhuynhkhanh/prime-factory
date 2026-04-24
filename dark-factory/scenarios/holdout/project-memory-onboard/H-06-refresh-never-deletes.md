# Scenario: H-06 — Incremental refresh never deletes; status flip only

## Type
edge-case

## Priority
critical — FR-20, BR-7. A delete-on-refresh bug would destroy accumulated memory silently.

## Preconditions
- onboard-agent file has incremental-refresh section documented.

## Action
Structural test asserts the incremental-refresh section:
1. Explicitly uses the phrase `status flip` (or close equivalent like `flip status`, `status: retired`) at least once.
2. Does NOT contain any phrase permitting deletion of existing entries (no `delete entry`, `remove from registry`, `drop entry` in the context of refresh).
3. Documents the status values a stale entry can transition to: at minimum `retired`, with fields `retiredAt: <ISO>` and `retiredReason`.
4. States that even when the developer explicitly requests removal, the agent performs a status flip — it never unwrites the file content.

## Expected Outcome
- `status flip` documented.
- No deletion phrasing in refresh context.
- Retirement schema documented.
- Even developer-confirmed removal is a status flip.

## Failure Mode (if applicable)
If any deletion phrase appears in the refresh context, test prints it. If the retirement schema is not documented, test names the missing fields.

## Notes
This protects against a subtle bug class where the agent might "tidy up" by removing entries the developer flagged as irrelevant. The entry history must remain auditable.
