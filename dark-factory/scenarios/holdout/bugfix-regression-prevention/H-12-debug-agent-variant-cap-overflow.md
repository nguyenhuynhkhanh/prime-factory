# Scenario: Debug-agent variant scenario cap (3-5) includes prioritization guidance when more variants are possible

## Type
edge-case

## Priority
medium — When the cap is hit, which variants to include and which to defer matters

## Preconditions
- `.claude/agents/debug-agent.md` exists with the updated scenario writing section

## Action
Read `.claude/agents/debug-agent.md` and inspect Phase 6 for variant cap guidance.

## Expected Outcome
- The cap of 3-5 variant scenarios is explicit
- There is guidance (or at least mention) of what to do when more variants are possible than the cap allows
- The guidance prioritizes by risk or coverage breadth
- Deferred variants should be noted (in the report or scenario notes) even if not written as scenarios

## Failure Mode
If no prioritization guidance exists, the debug-agent may arbitrarily select variants, potentially missing the highest-risk ones.

## Notes
EC-6 covers this case: "Must prioritize by risk and coverage breadth. Document which variants were deferred and why."
