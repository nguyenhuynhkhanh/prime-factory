# Scenario: architect-agent receives ZERO advisor-mode output, directly or indirectly

## Type
information-barrier

## Priority
critical — the holdout barrier to architect is preserved.

## Preconditions
- df-intake/SKILL.md, implementation-agent.md, architect-agent.md edited (note: architect-agent.md is NOT edited by this spec — but we verify the barrier holds).

## Action
Structural test traces information flow: does any path from advisor output reach architect-agent?

## Expected Outcome
- df-intake Step 5.5: advisor output goes to spec-agent, NOT architect-agent.
- Step 0c (architect review): architect-agent receives ONLY the spec file + feature name + domain + mode — NOT the advisor output, NOT the revised scenarios themselves, NOT the holdout scenarios.
- implementation-agent passes to architect-agent: spec path + domain + mode only. No advisor content passed through.
- architect-agent.md's Inputs section (existing, unchanged by this spec) lists spec + project profile + code map — NOT advisor output.
- Structural test greps architect-agent.md and finds no reference to `advisor`, `advisory`, or `mode: advisor`.

## Notes
Covers BR-8, INV-TBD-c. The existing architect information barrier must be preserved intact. This spec does NOT edit architect-agent.md; the test verifies no back-channel leak via the other edited files.
