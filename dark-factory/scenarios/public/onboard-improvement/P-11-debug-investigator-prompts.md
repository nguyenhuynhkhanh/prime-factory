# Scenario: df-debug investigator prompts include profile reading instruction

## Type
feature

## Priority
high -- investigators currently start from scratch on every bug

## Preconditions
- The df-debug skill file exists at `.claude/skills/df-debug/SKILL.md`

## Action
Read the df-debug skill file and verify all 3 investigator prompts include profile reading.

## Expected Outcome
- Investigator A prompt includes an instruction to read project-profile.md before investigation
- Investigator B prompt includes an instruction to read project-profile.md before investigation
- Investigator C prompt includes an instruction to read project-profile.md before investigation
- The instruction specifies reading the profile FIRST (before starting investigation)
- The instruction includes "if it exists" conditional

## Notes
Current investigator prompts (lines 22-43) start with "You are Investigator X. Your direction..." The profile reading should be added before the investigation-specific instructions.
