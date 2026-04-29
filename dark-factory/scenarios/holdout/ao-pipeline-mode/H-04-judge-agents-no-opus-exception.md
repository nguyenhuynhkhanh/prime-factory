# Scenario: H-04 — No code path allows judge agents to use Opus

## Type
edge-case

## Priority
critical — FR-6, BR-5, INV-TBD-a. The invariant is absolute: "no override path exists." The implementation must not have any conditional path that applies Opus to architect-agent or test-agent.

## Preconditions
- `implementation-agent.md` updated for this feature.

## Action
Structural test verifies that `implementation-agent.md` does NOT contain any conditional logic that would apply `claude-opus` to architect-agent or test-agent. Specifically:
1. Search for all occurrences of `architect-agent` spawn instructions — verify none reference `claude-opus` in the model parameter.
2. Search for all occurrences of `test-agent` spawn instructions — verify none reference `claude-opus`.
3. Verify the always-sonnet rule is documented as absolute with no conditional form (e.g., "regardless of mode", no `if mode === quality then opus` path visible for judge agents).

## Expected Outcome
- No `claude-opus` in any architect-agent or test-agent spawn instruction.
- The always-sonnet rule appears unconditional.

## Failure Mode (if applicable)
If `claude-opus` appears near an architect-agent or test-agent spawn: "implementation-agent.md must not pass claude-opus to judge agents (architect-agent, test-agent)."

## Notes
This is the hardest invariant to maintain as the model selection table grows. Future modes (e.g., `--mode custom`) must not break this. The structural test enforces it permanently.
