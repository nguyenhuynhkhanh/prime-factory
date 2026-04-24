# Scenario: Every TEMPLATE heading matches the machine-parseable regex

## Type
edge-case

## Priority
critical — architect-agent's future invariant probe will grep headings without LLM help. If the format drifts, the probe silently returns zero matches.

## Preconditions
- All three memory files exist.

## Action
Read each memory file. Find every line that starts with `## ` (second-level heading). For each such line, test it against the regex:
```
^## (INV|DEC|FEAT)-(\d{4}|TEMPLATE|TBD-[a-z0-9-]+): .+$
```

## Expected Outcome
- In `invariants.md`: every `## ` heading that is a memory entry matches `^## INV-(\d{4}|TEMPLATE|TBD-[a-z0-9-]+): .+$`.
- In `decisions.md`: every matching heading uses `DEC-` prefix.
- In `ledger.md`: every matching heading uses `FEAT-` prefix.
- Shipped skeletons use only the `TEMPLATE` form (e.g., `## INV-TEMPLATE: ...`) — no `0001` entries exist yet (those are reserved for promote-agent per FR-12).
- Headings that are prose section titles (e.g., `## How to use this file`) are either structured below level-2 (use `### `) OR are explicitly allowed by the test (e.g., excluded by content — they do NOT match the entry regex but still produce valid markdown).

## Notes
Validates FR-3, FR-4, FR-5, NFR-4. The regex is load-bearing because later sub-specs rely on it.
