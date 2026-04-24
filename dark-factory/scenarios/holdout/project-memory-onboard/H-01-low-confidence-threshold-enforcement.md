# Scenario: H-01 — Low-confidence gating threshold is enforced at the UX layer, not just documented

## Type
edge-case

## Priority
critical — INV-TBD-b. Documentation alone is insufficient if the sign-off UX presents low-confidence as "default accept".

## Preconditions
- Phase 3.7a and Phase 7 Memory Sign-Off are both present.

## Action
Structural test performs a more aggressive assertion than P-05:
1. Within Phase 7 Memory Sign-Off, verify the UX description explicitly states how the **default action** is presented for each confidence level:
   - `high` → default `accept`
   - `medium` → default `accept` or neutral (phrasing is acceptable so long as it is not `reject`)
   - `low` → default MUST be `reject` (look for phrases like `default rejected`, `pre-selected reject`, `unchecked by default`, or equivalent)
2. The documentation must forbid a "skip-all" shortcut that would bulk-accept low-confidence candidates (e.g., no phrase permitting "accept everything including low-confidence").
3. The `[LOW CONFIDENCE]` visual marker is documented as the tag shown next to the candidate during sign-off.

## Expected Outcome
- Default-action for each confidence tier is unambiguously documented.
- No phrase exists that could be interpreted as "bulk-accept includes low-confidence".
- Visual marker `[LOW CONFIDENCE]` is present.

## Failure Mode (if applicable)
If the documentation is ambiguous about what happens when the developer hits "accept all", test fails with a message naming the ambiguity. The language MUST make the exclusion of low-confidence from bulk-accept explicit.

## Notes
This is the hardest part of the quality gate to get right in prose — it is easy to write "accept all" and accidentally include low-confidence. The test enforces the exclusion explicitly.
