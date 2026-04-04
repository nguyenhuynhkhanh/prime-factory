# Scenario: All existing tests still pass after implementation

## Type
regression

## Priority
critical -- any regression in the existing test suite means the implementation broke something

## Preconditions
- All tests in tests/dark-factory-setup.test.js currently pass
- Code map feature has been implemented (all files modified)

## Action
Run `node --test tests/dark-factory-setup.test.js`.

## Expected Outcome
- ALL existing test blocks pass:
  - Agent definitions (frontmatter validation)
  - Skill definitions (frontmatter validation)
  - Dark Factory directory structure
  - Pipeline routing
  - Architect review gate
  - Information barriers
  - Project onboarding
  - Bugfix red-green integrity
  - Promote and archive lifecycle
  - CLAUDE.md completeness
  - Group orchestration flags
  - Intake manifest field enforcement
  - Plugin mirrors (ALL pairs, including newly added ones)
  - Pipeline velocity tests
- No existing assertions broken by the additive changes
- New code map test block also passes

## Notes
Full regression check. The plugin mirror tests are the highest risk -- any modified source file must have its plugin mirror updated in the same commit.
