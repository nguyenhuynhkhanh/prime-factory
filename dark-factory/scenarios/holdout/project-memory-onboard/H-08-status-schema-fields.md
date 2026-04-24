# Scenario: H-08 — Retired-entry schema completeness

## Type
edge-case

## Priority
medium — FR-20. If the retired-entry schema is ambiguous, downstream consumers will parse entries inconsistently.

## Preconditions
- onboard-agent file documents the status-flip mechanism.

## Action
Structural test asserts the status-flip documentation specifies at least these fields:
- `status` (values: at minimum `active`, `retired`)
- `retiredAt` (ISO-8601)
- `retiredReason` (string — may be free-form or developer-provided)

And that the retired entry's original content (`id`, `title`, `rule`, `sourceRef`, etc.) is **preserved** — not overwritten — when the status flip is applied.

## Expected Outcome
- Status values enumerated.
- Retirement metadata fields named.
- Original content preservation is explicit.

## Failure Mode (if applicable)
If any field is missing from the documentation, test names it. If preservation is ambiguous, test fails.

## Notes
Consumers reading memory files need to know whether a retired entry retains its original `rule` text. This scenario locks that in.
