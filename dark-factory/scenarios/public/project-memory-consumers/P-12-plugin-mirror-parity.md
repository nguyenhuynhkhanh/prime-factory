# Scenario: All 5 source files mirrored byte-identically to plugins/dark-factory/

## Type
feature

## Priority
critical — distribution correctness

## Preconditions
- The 5 source files have been modified per this spec:
  - `.claude/agents/spec-agent.md`
  - `.claude/agents/architect-agent.md`
  - `.claude/agents/code-agent.md`
  - `.claude/agents/debug-agent.md`
  - `dark-factory/templates/spec-template.md`

## Action
Run `node --test tests/dark-factory-contracts.test.js`. Verify the mirror-parity suite covers all 5 changed files.

## Expected Outcome
- Every assertion comparing `.claude/agents/{name}.md` to `plugins/dark-factory/agents/{name}.md` for the 4 agents passes.
- The assertion comparing `dark-factory/templates/spec-template.md` to `plugins/dark-factory/templates/spec-template.md` passes.
- Zero content drift between source and mirror for the 5 changed files.
- If the test suite already covered these mirrors before this spec (it did), the new content is still byte-identical under the existing assertions — no new assertions strictly necessary, but the contracts test MUST continue to pass with the new content in place.

## Notes
Validates FR-16, AC-11, AC-13. The existing contract test structure is reused; this scenario asserts that the existing suite continues to pass with the new content.
