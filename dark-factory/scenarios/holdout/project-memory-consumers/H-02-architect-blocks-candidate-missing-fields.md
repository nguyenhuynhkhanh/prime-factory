# Scenario: Architect BLOCKS on INV-TBD-* candidate missing required schema fields

## Type
edge-case

## Priority
critical — malformed candidates pollute the registry at promotion

## Preconditions
- Memory registry is populated normally
- A spec declares `INV-TBD-a` with `title`, `rule`, `rationale` — but OMITS `scope`, `domain`, and the `enforced_by | enforcement` field
- Architect-agents run in the three parallel domains

## Action
The spec declares INV-TBD-a without a `domain` field. Per BR-7, it defaults to `security`. The security-domain architect runs the probe.

## Expected Outcome
- Security domain review contains under `### Memory Findings (Security)`:
  ```
  New candidates declared: INV-TBD-a (reviewed: missing fields — BLOCKER)
    Missing: scope, domain, enforced_by | enforcement
  ```
- Review Status: `BLOCKED`
- The BLOCKER message explicitly names EACH missing field.
- Architecture and API reviewers do NOT also raise the candidate (it defaulted to security; no cross-restatement).
- implementation-agent respawns spec-agent. spec-agent adds the missing fields (including `domain`) and the round 2 probe reassigns the candidate to its proper domain reviewer if `domain != security`.

## Notes
Validates FR-3, FR-8, BR-7. The default-to-security rule means malformed candidates always have ONE reviewer responsible for catching them.
