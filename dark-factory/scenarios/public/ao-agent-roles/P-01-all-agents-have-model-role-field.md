# Scenario: All 9 agents have a model-role field in YAML frontmatter

## Type
feature

## Priority
critical — the model-role field is the entire deliverable of this spec; if it is absent from any agent the feature is not implemented

## Preconditions
- All 9 `.claude/agents/*.md` files exist: spec-agent, code-agent, debug-agent, onboard-agent, codemap-agent, architect-agent, test-agent, promote-agent, implementation-agent
- The existing `parseFrontmatter()` helper in `tests/dark-factory-setup.test.js` is available

## Action
For each of the 9 agent files, read the file, parse its YAML frontmatter using `parseFrontmatter()`, and check whether `fm['model-role']` is a non-empty string.

In test terms: a new describe block in `tests/dark-factory-setup.test.js` iterates over all 9 agent names and asserts `assert.ok(fm['model-role'], ...)` for each.

## Expected Outcome
- All 9 agents parse to a frontmatter object with a truthy `model-role` key
- No agent has a missing, undefined, or empty `model-role`
- Test output: 9 passing assertions, one per agent

## Failure Mode
If any agent file is missing `model-role`, the `assert.ok(fm['model-role'])` assertion fails with a message identifying the agent name. Test run fails; no silent pass-through.

## Notes
This is the minimum viable coverage check — it only verifies presence, not value validity. P-02 and P-03/P-04 cover value constraints and per-agent assignments.
