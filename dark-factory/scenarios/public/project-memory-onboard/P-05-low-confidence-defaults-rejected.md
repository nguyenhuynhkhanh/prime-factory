# Scenario: P-05 — Low-confidence candidates default to rejected

## Type
feature

## Priority
critical — INV-TBD-b and BR-4 are the most important quality gates for the memory layer. Without this, false-positive invariants will block legitimate features.

## Preconditions
- Phase 3.7a and Phase 7 Memory Sign-Off are present in the onboard-agent file.

## Action
Structural test performs two assertions:
1. Phase 3.7a body contains a phrase meaning "low-confidence candidates default to rejected" (match at least one of: `default to rejected`, `rejected by default`, `defaults to reject`). AND the body mentions the `[LOW CONFIDENCE]` marker that candidates must carry.
2. Phase 7 Memory Sign-Off body also reiterates the default-rejected rule so the sign-off UX implementer cannot miss it.

## Expected Outcome
- Both phases (3.7a and 7) document the default-rejected behavior.
- The `[LOW CONFIDENCE]` marker is documented as the visible tag a developer sees.

## Failure Mode (if applicable)
If either phase lacks the default-rejected phrasing, or the `[LOW CONFIDENCE]` marker is missing, the test fails and names the missing location.

## Notes
This scenario pairs with H-01 (adversarial test: what if a low-confidence candidate is accepted without explicit opt-in? Must fail.) and H-09 (deterministic re-run). Together they protect the quality gate.
