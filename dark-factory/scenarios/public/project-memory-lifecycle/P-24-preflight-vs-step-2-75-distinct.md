# Scenario: pre-flight gate and Step 2.75 gate are documented as distinct checkpoints

## Type
feature

## Priority
high — all three lead reports flagged this confusion.

## Preconditions
- implementation-agent.md edited.

## Action
Read implementation-agent.md.

## Expected Outcome
- File documents the existing pre-flight test gate (before architect review).
- File documents the new Step 2.75 full-suite regression gate (after code-agent implementation, before promote).
- File explicitly states both gates are distinct checkpoints and both run in every feature cycle.
- The prose names their different purposes: pre-flight catches baseline failures before expensive architect+code work; Step 2.75 catches invariant regressions introduced by this feature.

## Notes
Covers FR-22. The documentation itself is the deliverable — it's the mitigation for a known confusion pattern.
