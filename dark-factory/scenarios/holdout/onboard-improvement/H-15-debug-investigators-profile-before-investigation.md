# Scenario: df-debug investigators read profile BEFORE investigation

## Type
feature

## Priority
high -- validates the ordering requirement (BR-8) for debug pipeline

## Preconditions
- The df-debug skill file exists at `.claude/skills/df-debug/SKILL.md`

## Action
Read the df-debug skill file. For each of the 3 investigator prompts, verify the profile reading instruction appears BEFORE the investigation-specific instructions.

## Expected Outcome
- In Investigator A's prompt: profile reading appears before "Focus on: following the execution from trigger to failure point"
- In Investigator B's prompt: profile reading appears before "Focus on: git blame/log for the affected area"
- In Investigator C's prompt: profile reading appears before "Focus on: similar code patterns elsewhere"
- The profile reading is part of the quoted prompt text (inside `>` block)

## Failure Mode (if applicable)
If the profile instruction is placed at the end of the investigator prompt, it would be treated as an afterthought rather than foundational context.

## Notes
Ordering matters because the profile provides the architectural context that makes investigation more efficient.
