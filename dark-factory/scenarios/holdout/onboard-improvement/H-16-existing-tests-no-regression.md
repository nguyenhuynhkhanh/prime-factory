# Scenario: All existing tests pass after changes (no regression)

## Type
regression

## Priority
critical -- no implementation should break existing tests

## Preconditions
- The test file exists at `tests/dark-factory-setup.test.js`
- All agents and skills have been modified as specified
- All mirrors are in sync

## Action
Run `node --test tests/dark-factory-setup.test.js` after all changes are applied.

## Expected Outcome
- All existing tests pass (zero failures)
- New test assertions also pass
- No test is removed or weakened to make it pass

## Failure Mode (if applicable)
Common regression risks:
- Modifying agent content that breaks string-matching assertions (e.g., changing "read project-profile.md if it exists" in a way that the test's `content.includes()` no longer matches)
- Removing constraints language that information barrier tests check for
- Changing frontmatter that breaks frontmatter parsing tests

## Notes
The test file has 113 tests across 11 suites. The most fragile assertions are the string-matching ones in the information barriers suite (lines 296-408) and the onboarding suite (lines 414-477).
