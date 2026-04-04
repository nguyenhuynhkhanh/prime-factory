# Scenario: test-agent references project-profile.md with section targeting

## Type
feature

## Priority
critical -- this is the primary gap fix; test-agent currently has ZERO profile reference

## Preconditions
- The test-agent file exists at `.claude/agents/test-agent.md`

## Action
Read the test-agent file and verify it references project-profile.md with specific section instructions.

## Expected Outcome
- The test-agent includes an instruction to read `dark-factory/project-profile.md`
- The instruction specifies sections to focus on: Testing, Tech Stack, Environment & Config
- The instruction appears early in the process (before writing any tests, ideally before or as part of Step 0)
- The instruction includes the "if it exists" conditional (graceful degradation)

## Notes
The test-agent currently has NO reference to project-profile.md whatsoever. This is the critical gap. The instruction should help the test-agent understand: which test framework to use, what test patterns to follow, and how the project's environment is configured.
