# Scenario: All pre-existing test assertions still pass after model-role is added

## Type
regression

## Priority
critical — the change adds a new frontmatter field; if any existing test asserts exact frontmatter contents or fails on unexpected fields, the full test suite would break

## Preconditions
- All 9 `.claude/agents/*.md` files have been updated with `model-role`
- All 9 `plugins/dark-factory/agents/*.md` plugin files have been updated to match
- The full test suite is available (`npm test` or equivalent)

## Action
Run the full test suite:
```
node --test tests/dark-factory-setup.test.js tests/dark-factory-contracts.test.js
```

## Expected Outcome
- All pre-existing assertions pass without modification
- The new ao-agent-roles assertions also pass
- No test that previously passed now fails
- Specific checks that must still pass:
  - "spec-agent.md has valid frontmatter with name, description, tools" (setup test section 1)
  - All 8 existing mirror parity tests in `Plugin mirror parity (uncovered pairs)` and `project-memory-consumers` describe blocks (contracts test sections 2 and 6)
  - All information barrier assertions
  - All architect review tier assertions

## Failure Mode
If any existing test breaks:
- The `parseFrontmatter()` helper must not fail on encountering an unknown key — it must ignore it. The helper as written (split on `:`, skip non-colon lines) handles unknown fields correctly.
- The mirror parity tests for spec-agent, architect-agent, code-agent, debug-agent in the existing describe blocks will pass only if the plugin files are also updated. If the code-agent updates `.claude/agents/` but not `plugins/`, the existing mirror tests fail.

## Notes
AC-7 requires this. This scenario tests the "no regressions" guarantee. It is a holdout scenario because the code-agent should not see it and might optimize for only the new tests while accidentally breaking an existing one.
