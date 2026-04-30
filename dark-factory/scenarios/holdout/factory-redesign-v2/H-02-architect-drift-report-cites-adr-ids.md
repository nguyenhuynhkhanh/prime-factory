# Scenario: H-02 — architect drift check output format requires citing specific ADR IDs

## Type
edge-case

## Priority
critical — a drift report that says "the implementation doesn't follow the pattern" without citing the ADR ID is unactionable. The code-agent cannot fix what it cannot locate.

## Preconditions
- `.claude/agents/architect-agent.md` has been updated with drift check instructions.

## Action
Structural test performs an aggressive assertion on the drift check output format:
1. Verify the architect-agent file describes that drift reports must cite ADR IDs (e.g., "AUTH-011", "API-023") not just prose descriptions.
2. Verify the file prohibits a generic "does not match architecture" verdict — the verdict must name which ADR(s) are violated.
3. Verify CLEAN vs DRIFT_FOUND are the only two verdict outcomes documented for the drift check.

## Expected Outcome
- ADR ID citation requirement is explicit.
- Generic verdict is forbidden (or the format makes it structurally impossible to produce one).
- Exactly two verdict outcomes: CLEAN and DRIFT_FOUND.

## Failure Mode (if applicable)
If the drift check description allows a free-text verdict without ADR ID citation, test fails. This scenario exists because it is easy to write "flag architectural drift" and miss the traceability requirement.
