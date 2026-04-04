# Scenario: code-agent has correct section-targeted profile reading

## Type
feature

## Priority
high -- verifies the specific section list for code-agent

## Preconditions
- The code-agent file exists at `.claude/agents/code-agent.md`

## Action
Read the code-agent file and verify its section-targeted profile reading instructions.

## Expected Outcome
- The code-agent's profile reading instruction (currently line 68) lists specific sections: Tech Stack, Architecture (specifically Patterns to Follow), For New Features, Testing, Environment & Config
- The instruction replaces the current vague "it tells you the architecture, patterns, test setup, and conventions to follow"
- The instruction still includes fallback for when the profile doesn't exist

## Notes
The code-agent currently has the most helpful profile reference of all agents ("it tells you the architecture, patterns, test setup, and conventions to follow" at line 68), but it should be more specific about which sections to focus on.
