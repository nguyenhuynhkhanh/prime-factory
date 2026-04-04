# Scenario: All domains APPROVED but with overlapping concerns are deduplicated

## Type
edge-case

## Priority
high -- validates dedup when no domain is blocked

## Preconditions
- A feature spec is undergoing parallel domain review
- Security domain returns APPROVED WITH NOTES: "Add rate limiting to POST /api/users to prevent brute-force account creation"
- Architecture domain returns APPROVED WITH NOTES: "POST /api/users should have rate limiting to prevent resource exhaustion under load"
- API domain returns APPROVED WITH NOTES: "POST /api/users needs rate limiting -- document the 429 response in the API contract"

## Action
All three domain reviews complete and the orchestrator synthesizes results.

## Expected Outcome
- The overall status is APPROVED WITH NOTES (no blockers)
- The synthesized review contains the rate limiting concern ONCE, not three times
- The deduplicated finding captures the essence from all three domains (security, scalability, and API contract perspectives)
- The finding attributes all three domains as sources
- The "Key Decisions Made" and "Remaining Notes" sections in the synthesized review contain the deduplicated version
- When forwarded to code-agents, the finding appears once with full context

## Failure Mode (if applicable)
If deduplication fails, the code-agent receives the same concern three times with slightly different wording, potentially treating them as three separate issues requiring three separate implementations.

## Notes
This scenario tests deduplication when all domains agree (no contradiction) but express the same concern differently. The orchestrator should recognize semantic overlap, not just string matching.
