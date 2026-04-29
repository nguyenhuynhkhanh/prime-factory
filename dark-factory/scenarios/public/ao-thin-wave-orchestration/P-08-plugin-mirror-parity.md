# Scenario: P-08 — Plugin mirror of df-orchestrate SKILL.md matches source after update

## Type
feature

## Priority
critical — the project enforces exact mirror parity between `.claude/skills/` and `plugins/dark-factory/skills/`; a stale plugin mirror breaks all projects using the plugin distribution.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` has been updated per this spec
- `plugins/dark-factory/skills/df-orchestrate/SKILL.md` has been manually updated to match

## Action
Run `node --test tests/dark-factory-contracts.test.js` and observe the mirror parity assertion for df-orchestrate SKILL.md.

## Expected Outcome
- The contracts test passes
- The assertion that `plugins/dark-factory/skills/df-orchestrate/SKILL.md` matches `.claude/skills/df-orchestrate/SKILL.md` (exact byte-for-byte) passes
- The test reads both files and asserts `source === plugin`

## Failure Mode
If `plugins/dark-factory/skills/df-orchestrate/SKILL.md` was not updated after the source change, the assertion fails with: "Plugin df-orchestrate SKILL.md must match source after [feature]".

## Notes
AC-11: contracts test asserts plugin mirror parity. AC-12: plugin mirror must be manually updated (SKILL.md is not compiled by the build system). The existing `serena-integration` section in contracts tests already covers this assertion format — this scenario validates that the same assertion still applies after our changes and has not been accidentally removed.
