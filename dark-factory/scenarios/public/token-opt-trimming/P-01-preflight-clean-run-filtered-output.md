# Scenario: P-01 — Pre-flight gate produces only summary line in context on a clean run

## Type
feature

## Priority
critical — This is the primary optimization target. A clean run should inject ~1–3 lines into agent context, not ~54k tokens of raw TAP. Any implementation that passes this scenario has achieved the core token reduction for the happy path.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated with the tee + grep pattern in the Pre-flight Test Gate section.
- `plugins/dark-factory/agents/implementation-agent.md` has been rebuilt from source.
- `tests/dark-factory-setup.test.js` contains a `token-opt-trimming` promoted section with the new assertions.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/implementation-agent.md` contains both:
1. A reference to `tee` combined with the temp file path pattern `/tmp/preflight-` (confirming the full output is captured to disk).
2. The grep filter expression `grep -E '^not ok|^# (tests|pass|fail)'` (confirming only summary/failure lines enter agent context).

## Expected Outcome
- Both assertions pass.
- The test block for `token-opt-trimming` reports zero failures.
- The same assertions on `plugins/dark-factory/agents/implementation-agent.md` also pass (mirror parity).

## Failure Mode (if applicable)
If `tee` is absent from the pre-flight section, the implementation has not preserved the full output on disk — reject. If the grep filter is absent, raw TAP still flows into context — reject.

## Notes
Use `content.includes(phrase)` assertions matching the existing test style in `dark-factory-setup.test.js`. The exact phrase to match for the filter is `grep -E '^not ok|^# (tests|pass|fail)'` or a substring that uniquely identifies it.
