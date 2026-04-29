# Scenario: H-07 — All existing tests pass after agent migration (no regression)

## Type
regression

## Priority
critical — the entire existing test suite must remain green after this change

## Preconditions
- All 9 agents have been migrated to `.src.md` source files
- `bin/build-agents.js` has been run (assembled output is current)
- The assembled output is functionally identical to the pre-migration agent content, plus:
  - Auto-generated header comment added as first line
  - Drifted copies (test-agent, code-agent abbreviated code-map text) normalized to canonical form

## Action
Run `npm test` (all test suites).

## Expected Outcome
- All 331+ existing tests pass (agent frontmatter, skill frontmatter, pipeline routing, information barriers, mirror parity, manifest schema, architect review gate, etc.)
- No existing test fails due to the header comment being present (tests do string-includes assertions, not exact-match assertions — the header is a new first line, does not conflict)
- No existing test fails due to the drift corrections (canonical code-map text is a superset of the abbreviated form — existing substring assertions still match)
- The new tests added by this feature also pass

## Failure Mode (if applicable)
N/A.

## Notes
Exercises BR-1 (indirect — the assembled output is the source of truth for tests) and AC-15. The primary risk is that an existing test asserts the exact abbreviated form of the code-map orientation text that was in `test-agent.md` or `code-agent.md`. The spec author has confirmed no such exact-text assertion exists — tests use `.includes()` with substrings like `"it is always present and current"`.
