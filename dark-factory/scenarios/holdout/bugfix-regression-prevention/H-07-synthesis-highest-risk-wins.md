# Scenario: Synthesis step takes the HIGHEST regression risk assessment when investigators disagree

## Type
edge-case

## Priority
high — Risk assessment disagreement is common; must have deterministic resolution

## Preconditions
- `.claude/skills/df-debug/SKILL.md` exists with the updated synthesis step

## Action
Read `.claude/skills/df-debug/SKILL.md` and inspect Step 2 for handling of conflicting regression risk assessments from different investigators.

## Expected Outcome
- The synthesis step specifies that when investigators disagree on regression risk level, the HIGHEST risk assessment is used
- The rationale from the investigator who identified the highest risk is included
- The synthesis does NOT average or downgrade the risk level

## Failure Mode
If no resolution rule exists, the synthesized report may use an arbitrary risk level, leading to either insufficient or excessive variant coverage.

## Notes
EC-5 covers this case. The synthesis step already handles root cause hypothesis disagreement but needs explicit guidance for regression risk disagreement.
