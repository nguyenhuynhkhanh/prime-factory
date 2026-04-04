# Scenario: Re-synthesize from cached domain review files when synthesized review is missing

## Type
edge-case

## Priority
medium -- validates recovery from partial state

## Preconditions
- A feature previously completed parallel domain review
- Domain review files exist:
  - `test-feature.review-security.md` (APPROVED)
  - `test-feature.review-architecture.md` (APPROVED WITH NOTES)
  - `test-feature.review-api.md` (APPROVED)
- The synthesized `test-feature.review.md` is missing (manually deleted, git conflict, etc.)

## Action
Run `/df-orchestrate test-feature`

## Expected Outcome
- The orchestrator detects the existing domain review files
- The orchestrator does NOT re-spawn architect-agents (the domain reviews are cached)
- The orchestrator re-synthesizes `test-feature.review.md` from the domain files
- The synthesized review has the correct overall status (APPROVED WITH NOTES based on the architecture domain)
- Findings are extracted and forwarded to code-agents normally
- Implementation proceeds without requiring a fresh review

## Failure Mode (if applicable)
If the orchestrator only checks for the synthesized review file and ignores domain files, it would re-run the full review unnecessarily, wasting time and potentially producing different results.

## Notes
This covers EC-3 from the spec. The domain review files are the source of truth; the synthesized file is derived.
