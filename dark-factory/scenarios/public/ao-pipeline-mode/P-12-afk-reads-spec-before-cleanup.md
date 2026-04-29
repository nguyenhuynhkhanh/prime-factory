# Scenario: P-12 — `--afk` spec content is captured BEFORE cleanup deletes the spec file

## Type
feature

## Priority
critical — FR-14, BR-8. If the spec is deleted before the content is read, the PR body is empty. The ordering must be explicit and enforced.

## Preconditions
- `.claude/agents/implementation-agent.md` updated for this feature (cleanup step modified).
- OR `.claude/skills/df-orchestrate/SKILL.md` updated with the capture-then-delete ordering.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `implementation-agent.md` (or df-orchestrate SKILL.md — wherever the `--afk` logic resides) explicitly states the ordering: spec content capture happens BEFORE spec file deletion. Acceptable forms:
- "before cleanup deletes the spec"
- "read spec sections first, then delete"
- "capture ... before ... cleanup"

## Expected Outcome
- Assertion passes: the before-deletion ordering is explicitly documented.

## Failure Mode (if applicable)
"implementation-agent.md should document that --afk spec content is captured before the spec file is deleted."

## Notes
BR-8 also specifies a fallback: if capture fails, use a minimal PR body. The fallback documentation is tested in H-09.
