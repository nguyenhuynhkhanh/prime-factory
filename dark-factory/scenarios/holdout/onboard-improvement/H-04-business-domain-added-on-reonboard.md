# Scenario: Business domain section appears on re-onboard when project gains domain constraints

## Type
edge-case

## Priority
medium -- validates the conditional inclusion works across profile lifecycle

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`
- The Business Domain Entities section is documented as conditional (FR-7)
- The incremental refresh behavior is documented (FR-4)

## Action
Read the onboard-agent file. Verify that the instructions handle the case where a re-onboard discovers domain-specific constraints that weren't present before.

## Expected Outcome
- The onboard-agent's incremental refresh logic handles the case where a new section (like Business Domain Entities) appears that didn't exist in the original profile
- This new section should be presented to the developer as an addition during incremental refresh
- The conditional business domain logic is clear: include it when domain constraints are found, not by default

## Failure Mode (if applicable)
If the incremental refresh only handles section modifications (not section additions), a newly relevant business domain section would be silently dropped during the merge.

## Notes
This tests the interaction between FR-4 (incremental refresh) and FR-7 (conditional business domain).
