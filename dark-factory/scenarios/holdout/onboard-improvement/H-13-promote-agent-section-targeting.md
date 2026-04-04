# Scenario: promote-agent has section-targeted profile reading

## Type
feature

## Priority
high -- promote-agent currently has only vague profile reference

## Preconditions
- The promote-agent file exists at `.claude/agents/promote-agent.md`

## Action
Read the promote-agent file and verify its profile reading instruction is updated with section targeting.

## Expected Outcome
- The promote-agent's profile reading instruction (currently line 19: "Read `dark-factory/project-profile.md` if it exists for test setup details") is updated to list specific sections: Testing, Tech Stack
- The instruction is more specific than "for test setup details"
- The sections listed are the ones relevant to test promotion: Testing (framework, config, location, naming, quality bar) and Tech Stack (language, runtime)
- The "if it exists" conditional is preserved

## Notes
The promote-agent has minimal profile usage. The section targeting should help it understand: which test framework is in use, where tests should be placed, and what naming conventions to follow -- all critical for adapting holdout tests into the project's permanent test suite.
