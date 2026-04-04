# Scenario: Overlapping findings across domains are deduplicated during synthesis

## Type
feature

## Priority
high -- validates deduplication logic in synthesis step

## Preconditions
- A feature spec is undergoing parallel domain review
- The Security domain review flags: "Missing input validation on the `email` field in POST /api/users"
- The API domain review flags: "POST /api/users endpoint lacks input validation for `email` parameter"
- The Architecture domain review says: APPROVED with no overlapping findings

## Action
All three domain reviews complete and the orchestrator synthesizes them into `test-feature.review.md`.

## Expected Outcome
- The orchestrator detects that Security and API domains raised the same concern (missing email validation)
- The synthesized review includes this finding ONCE, not twice
- The synthesized finding attributes both domains as sources (e.g., "Raised by: Security, API")
- Other non-overlapping findings from each domain appear normally
- The final review is cleaner and does not contain redundant entries
- The deduplicated findings are forwarded to code-agents without duplication

## Notes
Deduplication is a judgment call by the orchestrator -- exact string matching is not required. Findings about the same concern expressed differently should still be merged.
