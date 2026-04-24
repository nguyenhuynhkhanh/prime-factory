# Scenario: advisor output uses enumerated categories only (no free-form prose)

## Type
feature

## Priority
critical — structural barrier that prevents holdout leakage.

## Preconditions
- test-agent.md edited.

## Action
Read test-agent.md's advisor-mode output-schema documentation.

## Expected Outcome
- Output schema documented as: `{ status, feasibility: [{ scenario, verdict }], flakiness: [{ scenario, verdict }], dedup: [{ scenario, matchedFeature, matchedPath }], missing: [INV-ID], infrastructureGaps: [{ scenario, missingFixture }] }`.
- `verdict` fields are enumerated: feasibility → `feasible | infeasible | infrastructure-gap`; flakiness → `low | medium | high`.
- Scenario references use file path or scenario ID only — NOT full scenario text.
- test-agent.md explicitly states: "advisor output MUST NOT contain free-form prose that quotes or paraphrases holdout scenario content."
- test-agent.md declares this as an information-barrier rule in its Constraints section.

## Notes
Covers FR-17, BR-7. The enumerated-only schema is the enforcement mechanism.
