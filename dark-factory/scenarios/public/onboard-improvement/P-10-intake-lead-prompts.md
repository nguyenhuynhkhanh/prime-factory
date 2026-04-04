# Scenario: df-intake lead prompts include profile reading instruction

## Type
feature

## Priority
high -- leads currently start from scratch on every feature

## Preconditions
- The df-intake skill file exists at `.claude/skills/df-intake/SKILL.md`

## Action
Read the df-intake skill file and verify all 3 lead prompts include profile reading.

## Expected Outcome
- Lead A prompt includes an instruction to read project-profile.md before codebase research
- Lead B prompt includes an instruction to read project-profile.md before codebase research
- Lead C prompt includes an instruction to read project-profile.md before codebase research
- The instruction specifies reading the profile FIRST (before "Research the codebase")
- The instruction includes "if it exists" conditional

## Notes
Current lead prompts (lines 36-79) say "Research the codebase, then output your findings." The profile reading should be prepended before codebase research.
