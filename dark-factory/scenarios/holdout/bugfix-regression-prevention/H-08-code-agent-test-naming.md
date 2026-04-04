# Scenario: Code-agent Red Phase test naming convention references root cause, not symptom

## Type
edge-case

## Priority
medium — Test names are the first signal a developer sees; naming matters for long-term maintenance

## Preconditions
- `.claude/agents/code-agent.md` exists with the updated Red Phase

## Action
Read `.claude/agents/code-agent.md` and inspect Step 1 for the test naming requirement.

## Expected Outcome
- The Red Phase includes an explicit test naming convention: name references root cause, not symptom
- An example or contrast is provided (good name vs bad name)
- The naming convention is a guideline, not a rigid format (allows project-specific conventions)

## Failure Mode
If the test naming requirement is buried or vague, the code-agent will default to symptom-based names like `test_fix_bug_123` which tell future developers nothing about what the test guards.

## Notes
FR-9 specifies the example: `test_unbounded_query_without_limit` not `test_api_returns_500`.
