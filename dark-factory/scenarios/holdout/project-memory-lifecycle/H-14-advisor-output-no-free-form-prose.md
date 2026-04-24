# Scenario: Advisor output schema rejects free-form prose fields

## Type
information-barrier

## Priority
critical — structural enforcement of the holdout barrier.

## Preconditions
- test-agent.md edited.

## Action
Read test-agent.md's advisor-output schema documentation.

## Expected Outcome
- Every field in the documented output schema is either:
  - A category from an enumerated set (`feasible | infeasible | infrastructure-gap`, `low | medium | high`), OR
  - A pointer reference (scenario file path, INV-ID, feature name, test file path), OR
  - A structured object composed of the above.
- NO field is typed as "description", "summary", "reasoning", or any free-form string.
- test-agent.md declares: "advisor output MUST NOT contain free-form prose that quotes or paraphrases holdout scenario content".
- Structural test asserts this prohibition phrase is present.
- Adversarial case: if the advisor wants to explain WHY something is infeasible, it uses a short enumerated `reason` field from a fixed vocabulary (e.g., `no-dev-server`, `fixture-missing`, `network-dependency`) — NOT a free-form sentence.

## Notes
Covers FR-17, BR-7, INV-TBD-c, EC-15. The most important information-barrier holdout assertion.
