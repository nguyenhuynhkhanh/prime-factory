# Scenario: H-05 — Step 0.5 finds Implementation Size Estimate when it appears on line 1 (EC-4)

## Type
edge-case

## Priority
low — A terse spec or a spec with the size estimate as the very first line must not trigger the "not found" fallback. The limit:40 read should find fields anywhere in the first 40 lines, including line 1.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated.
- The Step 0.5 description does not imply the field must be on a specific line — only that it must be within the first 40 lines.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that the compiled `implementation-agent.md` Step 0.5 description does not imply a minimum line number — i.e., it does not say "Implementation Size Estimate is on line N" or "skip the first N lines." The limit:40 read should search the entire returned content for the field.

## Expected Outcome
- The Step 0.5 description applies limit:40 and then searches for the field in the returned content — no assumption about which specific line it appears on.
- The fallback (defaulting to medium) is only triggered when the field is absent from the 40-line read, not when it is present early.

## Failure Mode (if applicable)
If the implementation hardcodes a line number (e.g., "read line 35"), a spec with the field on line 1 would not be found and would incorrectly trigger the medium default.

## Notes
EC-4: in practice, with the current spec template, `Implementation Size Estimate` appears around line 80–85. But the spec template could change, and a test that verifies the search is content-based (not line-number-based) protects against template evolution.
