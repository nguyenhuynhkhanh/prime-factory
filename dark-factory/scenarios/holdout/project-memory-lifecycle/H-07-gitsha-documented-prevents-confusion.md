# Scenario: gitSha documentation explicitly names the "seeming self-reference" trap

## Type
edge-case

## Priority
high — documentation is the sole mitigation for future reader confusion.

## Preconditions
- promote-agent.md edited.

## Action
Grep promote-agent.md for prose explaining the gitSha convention.

## Expected Outcome
- The prose contains ALL of the following ideas:
  - `gitSha` is the commit-BEFORE the cleanup commit.
  - This is NOT self-referential (NOT the cleanup commit itself).
  - Reason: avoids the amend / two-pass workflow.
- The prose contains an explicit sentence addressing the reader's potential confusion (e.g., "a reader might expect the gitSha to reference the commit containing this ledger entry — it does not; see note below").

## Notes
Without this reader-facing note, future developers will be confused by the apparent tautology. The spec explicitly calls this out as a load-bearing documentation requirement.
