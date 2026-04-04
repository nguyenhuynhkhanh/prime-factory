# Scenario: Broader codebase sampling covers all top-level modules

## Type
feature

## Priority
high -- ensures profile accuracy across the full codebase

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`

## Action
Read the onboard-agent file and verify the codebase sampling instruction is broader than "3-5 files."

## Expected Outcome
- The onboard-agent Phase 3 (or equivalent) instructs sampling at least one file per top-level module/directory
- The instruction replaces or augments the current "look at 3-5 representative files" guidance
- There is an instruction to flag inconsistent patterns across modules and ask the developer which is canonical
- The instruction should NOT specify a hard upper limit on files to sample (the cap for large projects is handled separately)

## Notes
The current instruction at line 62 says "Map code patterns (look at 3-5 representative files)." This should be updated to reference top-level modules/directories.
