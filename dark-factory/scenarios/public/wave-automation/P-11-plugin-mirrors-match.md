# Scenario: Plugin mirror files match source files exactly

## Type
regression

## Priority
critical -- existing test 12 asserts byte-for-byte match; breaking this fails CI

## Preconditions
- Source files have been updated
- Plugin mirror files have been updated

## Action
Compare the following file pairs:
1. `.claude/skills/df-orchestrate/SKILL.md` vs `plugins/dark-factory/skills/df-orchestrate/SKILL.md`
2. `.claude/rules/dark-factory.md` vs `plugins/dark-factory/.claude/rules/dark-factory.md`

## Expected Outcome
- Each source file is byte-for-byte identical to its plugin mirror
- No content differences between any pair

## Failure Mode
N/A -- file comparison

## Notes
Validates AC-11. The existing test suite (Section 12) already asserts this, but the code-agent must know to update BOTH files.
