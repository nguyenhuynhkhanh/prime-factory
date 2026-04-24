# Scenario: advisor and validator are distinct spawn invocations

## Type
feature

## Priority
critical — mode isolation defends the information barrier.

## Preconditions
- test-agent.md edited.

## Action
Read test-agent.md's mode-isolation documentation.

## Expected Outcome
- File explicitly states: "advisor-mode and validator-mode are NEVER mixed in one spawn" (or semantically equivalent).
- File documents that the agent validates its `mode` parameter at process start.
- File documents refusing to proceed if the mode is missing, misspelled, or both provided.
- File's Constraints section lists mode-mixing as a prohibited pattern.

## Notes
Covers FR-19, BR-6, INV-TBD-b. The invariant is documentation + test assertion.
