# Scenario: promote-agent.md documents itself as the sole runtime writer of memory

## Type
feature

## Priority
critical — single-writer is the core concurrency mitigation.

## Preconditions
- promote-agent.md edited per this spec.

## Action
Read promote-agent.md.

## Expected Outcome
- File contains an explicit statement like "promote-agent is the sole runtime writer of `dark-factory/memory/*.md`" (or semantically equivalent).
- File names the onboard-agent bootstrap exception explicitly ("the only other writer is onboard-agent at bootstrap").
- The phrase "single-writer" (or "sole writer") appears in the prose.
- The Constraints section documents this as a hard rule.

## Notes
Structural assertion — the invariant is enforced by documentation + test assertion, not by runtime check (no sandbox).
