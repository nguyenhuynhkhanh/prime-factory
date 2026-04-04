# Scenario: Investigator C prompt requires proportional output for trivial bugs

## Type
feature

## Priority
high — Prevents overhead on trivial bugs while ensuring thorough analysis of complex ones

## Preconditions
- `.claude/skills/df-debug/SKILL.md` exists and contains the Investigator C prompt

## Action
Read `.claude/skills/df-debug/SKILL.md` and inspect the Investigator C prompt for proportional output guidance.

## Expected Outcome
- The prompt explicitly states that every bug gets systemic search
- The prompt provides guidance for proportional output:
  - Simple/trivial bugs: brief output like "No systemic patterns found. Classification: isolated incident." with justification
  - Complex bugs: full pattern search with file refs and risk assessment
- The prompt does NOT allow skipping systemic search for any bug

## Notes
This ensures trivial bugs are not burdened with unnecessary analysis while still receiving a baseline check.
