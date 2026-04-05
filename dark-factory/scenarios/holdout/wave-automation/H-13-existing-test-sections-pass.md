# Scenario: All existing test sections (1-12) pass without regression

## Type
regression

## Priority
critical -- any test regression blocks the entire change

## Preconditions
- All source files and their plugin mirrors have been updated
- `tests/dark-factory-setup.test.js` has been updated

## Action
Trace through each existing test section and verify the updated SKILL.md and rules files still satisfy the assertions.

## Expected Outcome
- Section 1 (Agent definitions): unchanged, passes
- Section 2 (Skill definitions): unchanged (SKILL.md still has frontmatter), passes
- Section 3 (Directory structure): unchanged, passes
- Section 4 (Pipeline routing): df-orchestrate still references "Feature mode" and "Bugfix mode" and "bugfix mode" -- passes
- Section 5 (Architect review gate): df-orchestrate still includes "Architect Review", "architect-agent.md", "BLOCKED", "do NOT proceed" -- passes
- Section 6 (Information barriers): df-orchestrate still includes "NEVER pass holdout" + "code-agent", "NEVER pass" + "test-agent", "NEVER pass" + "architect-agent" -- passes
- Section 7 (Project onboarding): df-orchestrate still includes "project-profile.md" -- passes
- Section 8 (Bugfix red-green): df-orchestrate still includes "FAILS", "PASSES"/"passes", "regression"/"existing tests" -- passes
- Section 8b (Promote/archive): df-orchestrate still includes "promote-agent.md", "archive" (lowercase), "manifest.json" -- passes
- Section 9 (CLAUDE.md completeness): all commands still documented -- passes
- Section 10 (Group orchestration flags): all flag-related content preserved -- passes
- Section 11 (Intake manifest fields): df-intake unchanged -- passes
- Section 12 (Plugin mirrors): mirrors updated to match source -- passes

## Failure Mode
If any section fails, the code-agent must identify which assertion broke and fix the relevant content.

## Notes
This is the most comprehensive regression check. Each bullet traces a specific test assertion to the content it matches in the updated files. The most likely regressions are in Sections 5, 6, and 10, which assert specific phrases in SKILL.md.
