# Scenario: H-05 — task packet for code-agent explicitly excludes holdout scenarios

## Type
edge-case

## Priority
critical — this is the information barrier. A code-agent that receives holdout scenarios can trivially overfit to them, making holdout validation meaningless.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` has been updated with task packet construction.

## Action
Structural test performs an aggressive check on the task packet definition in df-orchestrate SKILL.md:
1. Verify the task packet structure for IMPLEMENTING state lists the inputs the code-agent receives.
2. Verify holdout scenarios are NOT listed in those inputs.
3. Verify public scenarios ARE listed (this is required — code-agent needs them).
4. Verify the task packet description explicitly states that holdout content must not be passed.

## Expected Outcome
- Holdout exclusion is explicit (not just implied by omission).
- Public scenario inclusion is explicit.
- The constraint language is "must not" or equivalent — not "typically does not".

## Failure Mode (if applicable)
Omitting holdout from the list without an explicit "must not include holdout" statement fails. Implicit exclusion is insufficient — this barrier must be stated as a hard constraint.
