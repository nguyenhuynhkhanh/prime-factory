# Scenario: README files updated to reflect parallel review model

## Type
feature

## Priority
medium -- documentation accuracy

## Preconditions
- `README.md` and `dark-factory/README.md` currently describe the architect review as "3+ rounds" or "minimum 3 rounds of refinement"
- The pipeline-velocity feature replaces this with parallel domain review

## Action
Verify that README files are updated after implementation.

## Expected Outcome
- `README.md` no longer contains "3+ rounds" or "minimum 3 rounds" language describing architect review
- `dark-factory/README.md` no longer contains "3+ rounds" or "minimum 3 rounds" language
- Both files describe the architect review as parallel domain-focused review (security, architecture, API)
- The description accurately reflects that every spec gets full parallel review
- No references to "sequential rounds" remain in pipeline descriptions

## Notes
The `.claude/rules/dark-factory.md` file also needs updated language -- this is covered by the template mirroring scenario. This scenario focuses specifically on the user-facing README files.
