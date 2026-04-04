# Scenario: Architect BLOCK for symptom-only fixes is proportional to bug complexity

## Type
edge-case

## Priority
high — Prevents over-engineering trivial fixes AND under-engineering critical ones

## Preconditions
- `.claude/agents/architect-agent.md` exists with the updated bugfix evaluation section

## Action
Read `.claude/agents/architect-agent.md` and inspect the bugfix evaluation section for proportionality guidance on BLOCKing.

## Expected Outcome
- The evaluation section states that the architect can BLOCK symptom-only fixes
- The section states that the threshold is proportional to bug complexity
- A simple typo or off-by-one does NOT need deep root cause analysis to pass review
- A shared utility logic bug or complex state management issue DOES need root cause depth to pass
- The architect uses the Regression Risk Assessment to calibrate the proportionality
- The BLOCK power is explicitly stated (not just implied from existing evaluation criteria)

## Failure Mode
If proportionality is not explicit, the architect may either: (a) BLOCK every fix that lacks deep root cause analysis (over-engineering), or (b) never BLOCK symptom-level fixes (under-engineering).

## Notes
BR-6 defines the proportionality rule. EC-8 covers the case where HIGH risk + symptom-level fix results in BLOCK.
