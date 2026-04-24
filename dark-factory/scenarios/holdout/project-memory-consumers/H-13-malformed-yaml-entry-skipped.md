# Scenario: Malformed YAML frontmatter on one memory entry — consumers skip that entry, proceed with the rest

## Type
failure-recovery

## Priority
high — partial-file corruption must not crash the pipeline

## Preconditions
- `dark-factory/memory/invariants.md` contains 5 entries
- Entry 3 has malformed YAML frontmatter (missing closing `---`, or unquoted special character)
- Entries 1, 2, 4, 5 are well-formed
- A feature pipeline runs

## Action
spec-agent, architect-agents, code-agent, and debug-agent each load the file during Phase 1 / Phase 2.

## Expected Outcome
- Each consumer logs: `"Memory file parse error: dark-factory/memory/invariants.md:<line> — skipping malformed entry, proceeding with remaining entries"`.
- Each consumer processes entries 1, 2, 4, 5 normally.
- Entry 3 is treated as non-existent — not referenced, not probed, not cross-referenced.
- architect-agent (the domain that would have owned entry 3) emits a SUGGESTION in its review: `"Memory file contains malformed entry at dark-factory/memory/invariants.md:<line>; recommend /df-cleanup or manual fix."`
- No consumer crashes or blocks.
- Review Status is NOT BLOCKED on malformed entry alone.

## Failure Mode
If a consumer crashes on malformed YAML, a single bad entry anywhere in any memory file brings down the entire pipeline for every future feature. The skip-and-continue pattern is the safety net.

## Notes
Validates EC-3 and the error handling table entry. The robustness here is important because memory files are manually editable; typos happen.
