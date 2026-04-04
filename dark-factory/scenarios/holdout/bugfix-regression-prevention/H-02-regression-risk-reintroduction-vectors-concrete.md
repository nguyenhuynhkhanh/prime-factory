# Scenario: Regression Risk Assessment requires concrete code references for reintroduction vectors

## Type
edge-case

## Priority
high — Abstract reintroduction vectors like "future refactoring" are useless; concrete refs are actionable

## Preconditions
- `.claude/agents/debug-agent.md` exists with the updated debug report template

## Action
Read `.claude/agents/debug-agent.md` and inspect the Regression Risk Assessment section of the debug report template.

## Expected Outcome
- The reintroduction vectors subsection requires concrete code references (file:line or function names)
- The section explicitly states NOT to use abstract categories like "future refactoring" or "code changes in this area"
- The variant paths subsection specifies concrete alternative execution paths, not vague descriptions

## Failure Mode
If reintroduction vectors are allowed to be abstract, the code-agent cannot use them to design targeted variant tests.

## Notes
The developer confirmed: "concrete code references, not abstract categories" for reintroduction vectors.
