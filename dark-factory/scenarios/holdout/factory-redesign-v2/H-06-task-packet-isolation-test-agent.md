# Scenario: H-06 — task packet for test-agent excludes spec and public scenarios

## Type
edge-case

## Priority
critical — test-agent seeing the spec or public scenarios can bias validation toward documented behavior rather than independently verifying holdout conditions.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` has been updated with task packet construction.

## Action
Structural test verifies the task packet definition for TESTING state:
1. Holdout scenarios are listed as the ONLY input (besides the implementation artifact to test against).
2. The approved spec is NOT listed as an input.
3. Public scenarios are NOT listed as an input.
4. An explicit "holdout scenarios only" or equivalent constraint is stated.

## Expected Outcome
- Holdout-only constraint is explicit.
- Spec and public scenarios are explicitly excluded (not just absent).
- Test run reports no failures.

## Failure Mode (if applicable)
If the test-agent task packet description is silent on what to exclude (only lists what's included), this test fails with a note: implicit exclusion is insufficient for an information barrier.
