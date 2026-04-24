# Scenario: Rule file explicitly documents non-blocking behavior for missing memory

## Type
failure-recovery

## Priority
critical — backward compatibility for existing Dark Factory projects that have never been onboarded with memory.

## Preconditions
- `.claude/rules/dark-factory-context.md` exists with the memory update applied.

## Action
Read the rule file and scan for prose describing how agents should behave when `dark-factory/memory/` is missing.

## Expected Outcome
- The file contains explicit prose stating that missing memory files are non-blocking.
- The prose uses language such as "warn and proceed", "not yet onboarded", or "treat as empty" — enough that any agent implementer reading this rule will not throw on missing files.
- The prose uses the SAME pattern as the existing treatment of missing `project-profile.md` (the 4th bullet is parallel in structure to the existing three).
- No wording demands memory presence as a precondition for `/df-*` commands.

## Notes
Validates FR-14, BR-5, EC-1. This is the migration guarantee for existing projects.
