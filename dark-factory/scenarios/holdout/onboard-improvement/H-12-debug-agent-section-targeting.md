# Scenario: debug-agent has correct section-targeted profile reading

## Type
feature

## Priority
high -- verifies the specific section list for debug-agent

## Preconditions
- The debug-agent file exists at `.claude/agents/debug-agent.md`

## Action
Read the debug-agent file and verify its section-targeted profile reading instructions.

## Expected Outcome
- The debug-agent's profile reading instruction (currently lines 40-43) lists specific sections: Tech Stack, Architecture, Structural Notes, For Bug Fixes, Common Gotchas, Environment & Config
- The instruction replaces the current "This gives you architecture, patterns, testing setup, and known structural issues"
- The instruction specifically mentions "For Bug Fixes" and "Common Gotchas" sections which are most relevant to debugging
- The instruction still includes the fallback to proceed with manual investigation if no profile exists

## Notes
The debug-agent already has a good profile reference that mentions structural issues and bug fix sections, but should name the specific sections from the enriched template.
