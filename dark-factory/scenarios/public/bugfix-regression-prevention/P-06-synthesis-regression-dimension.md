# Scenario: Synthesis step includes regression risk as first-class dimension

## Type
feature

## Priority
critical — Without explicit synthesis, regression findings from investigators are lost

## Preconditions
- `.claude/skills/df-debug/SKILL.md` exists and contains the synthesis step (Step 2)

## Action
Read `.claude/skills/df-debug/SKILL.md` and inspect Step 2 (Synthesize findings).

## Expected Outcome
- Step 2 includes regression risk as a named dimension in the synthesis process
- The synthesis explicitly merges regression risk findings from ALL 3 investigators
- Regression risk appears alongside the existing dimensions (root cause hypotheses, evidence, impact analysis, fix approach)
- The existing synthesis dimensions are preserved (not replaced)

## Notes
Currently Step 2 has 4 numbered items: compare root cause hypotheses, merge evidence, merge impact analysis, pick best fix approach. Regression risk should be a 5th named dimension or integrated clearly into the existing structure.
