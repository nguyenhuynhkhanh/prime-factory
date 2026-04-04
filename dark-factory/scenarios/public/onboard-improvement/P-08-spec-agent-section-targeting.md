# Scenario: spec-agent has section-targeted profile reading

## Type
feature

## Priority
high -- ensures agents read relevant context efficiently

## Preconditions
- The spec-agent file exists at `.claude/agents/spec-agent.md`

## Action
Read the spec-agent file and verify it has section-targeted profile reading instructions.

## Expected Outcome
- The spec-agent's Phase 1 (or profile-reading step) lists specific sections to read from project-profile.md
- The listed sections include at minimum: Overview, Tech Stack, Architecture, API Conventions, Auth Model
- The instruction is more specific than the current "This tells you the tech stack, architecture, patterns, quality bar, and structural notes"
- The instruction still includes the fallback behavior ("if it exists" / "if it doesn't exist, tell the developer to run /df-onboard")

## Notes
Current instruction is at lines 31-33. It should be replaced with section-specific guidance.
