# Scenario: Architect BLOCKS on supersession with insufficient (one-word) rationale

## Type
edge-case

## Priority
high — prevents low-quality supersessions that would silently retire invariants

## Preconditions
- Memory contains `INV-0001` (domain: api, `title: response-envelope-required`, status: active)
- A spec declares:
  ```
  ## Invariants > Supersedes
  INV-TBD-a supersedes INV-0001
  Rationale: refactor
  ```
- api-domain architect-agent is spawned

## Action
api-domain architect performs the probe and reviews the supersession declaration.

## Expected Outcome
- api domain review contains under `### Memory Findings (API)`:
  ```
  Modified (declared in spec): INV-0001 → BLOCKER (supersession rationale insufficient — must explain why the invariant no longer holds and what replaces it)
  ```
- Review Status: `BLOCKED`.
- implementation-agent respawns spec-agent with the BLOCKER. spec-agent expands the rationale (e.g., explains the new response contract and why the envelope is no longer valuable for clients).
- Round 2: rationale now complete; supersession is accepted; status moves from BLOCKED to APPROVED or APPROVED WITH NOTES.

## Notes
Validates FR-8, EC-15. Defines the threshold: "one word" or clearly superficial rationale triggers a BLOCKER. The architect-agent should have language that says rationale must "explain why the invariant no longer holds and what replaces it" — anything less is insufficient.
