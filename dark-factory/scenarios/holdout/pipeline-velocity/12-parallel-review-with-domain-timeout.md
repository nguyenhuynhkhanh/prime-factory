# Scenario: Parallel review where one domain times out and developer retries just that domain

## Type
failure-recovery

## Priority
high -- validates targeted retry after partial failure

## Preconditions
- A feature triggers parallel domain review
- Security domain completes: APPROVED WITH NOTES
- Architecture domain completes: APPROVED
- API domain times out (no review file produced)
- The orchestrator reports the failure to the developer
- The developer chooses to retry the failed domain only

## Action
The orchestrator retries ONLY the API domain architect-agent.

## Expected Outcome
- Only one architect-agent is spawned (API domain), not all three
- The existing `test-feature.review-security.md` and `test-feature.review-architecture.md` are preserved and NOT re-run
- The API domain agent produces `test-feature.review-api.md`
- The orchestrator now has all three domain reviews and synthesizes them into `test-feature.review.md`
- The synthesis includes findings from all three domains, including the Security domain's notes from the original run
- Implementation proceeds normally

## Failure Mode (if applicable)
If the orchestrator re-runs all three domains on retry, the Security and Architecture reviews could produce different results than the first run, creating inconsistency. If it cannot do a targeted retry, the developer's only option is a full re-run.

## Notes
Targeted retry is an efficiency optimization. The orchestrator should be able to detect which domain files already exist and only fill in the gaps.
