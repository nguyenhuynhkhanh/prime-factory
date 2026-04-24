# Scenario: df-intake SKILL contains Step 5.5 Test-Advisor Handoff

## Type
feature

## Priority
critical — advisor handoff is the spec-side quality gate.

## Preconditions
- `.claude/skills/df-intake/SKILL.md` edited.

## Action
Read df-intake/SKILL.md.

## Expected Outcome
- A new "Step 5.5: Test-Advisor Handoff" section exists between existing Step 5 (write spec) and Step 6 (update manifest).
- Step 5.5 documents: spec-agent spawns test-agent with `mode: advisor`, passing spec path + scenario draft paths + memory files.
- Step 5.5 documents: spec-agent reads advisory output, revises scenarios (may remove duplicates, flag infeasible, add missing coverage).
- Step 5.5 documents a summary line emitted to the intake output: "Testability review: N kept, M revised, K removed as duplicate, J flagged for infrastructure."

## Notes
Covers FR-24. The section's position (between Step 5 and Step 6) matters — Step 6 updates the manifest with `testAdvisoryCompleted`, so Step 5.5 must precede it.
