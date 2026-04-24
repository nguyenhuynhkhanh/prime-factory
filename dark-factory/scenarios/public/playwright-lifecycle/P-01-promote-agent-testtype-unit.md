# Scenario: promote-agent includes testType "unit" for unit test files

## Type
feature

## Priority
critical -- core schema change that enables E2E-aware cleanup

## Preconditions
- promote-agent.md exists at `.claude/agents/promote-agent.md`
- The file contains the registry entry JSON example in Step 7

## Action
Read promote-agent.md and verify the `files` array JSON example includes a `"testType"` field.

## Expected Outcome
- The JSON example in the registry entry section includes `"testType": "unit"` (or `"testType": "e2e"`) as a field in the file entry object
- The promote-agent instructs setting `"testType": "unit"` for unit test files

## Notes
This is a structural test verifying agent content, not runtime behavior.
