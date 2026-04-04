# Scenario: df-intake leads read profile BEFORE codebase research

## Type
feature

## Priority
high -- validates the ordering requirement (BR-8)

## Preconditions
- The df-intake skill file exists at `.claude/skills/df-intake/SKILL.md`

## Action
Read the df-intake skill file. For each of the 3 lead prompts, verify the profile reading instruction appears BEFORE the "Research the codebase" instruction.

## Expected Outcome
- In Lead A's prompt: the profile reading instruction appears in the text before "Research the codebase, then output your findings"
- In Lead B's prompt: same ordering -- profile first, then research
- In Lead C's prompt: same ordering -- profile first, then research
- The profile reading is part of the quoted prompt text that gets sent to the spec-agent (not just a comment to the orchestrator)

## Failure Mode (if applicable)
If the profile instruction is placed after "Research the codebase," leads will already be deep in codebase analysis before getting the profile context, defeating the purpose. If it's outside the quoted prompt, the spec-agent won't see it.

## Notes
This validates BR-8 which specifies "BEFORE codebase research, not after." The instruction must be inside the `>` quoted block for each lead.
