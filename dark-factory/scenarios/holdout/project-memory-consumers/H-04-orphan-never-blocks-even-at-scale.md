# Scenario: Multiple orphaned invariants in one probe still SUGGESTION only, never BLOCKER

## Type
edge-case

## Priority
medium — tests the SUGGESTION ceiling

## Preconditions
- Memory contains 5 active invariants across all three domains whose `scope.modules` reference files that no longer exist:
  - INV-0020 (security, scope: `["src/legacy/auth-v1.js"]`)
  - INV-0021 (architecture, scope: `["src/legacy/worker.js"]`)
  - INV-0022 (architecture, scope: `["src/deprecated/queue.js"]`)
  - INV-0023 (api, scope: `["src/api/v1/*"]`) — v1 API has been removed
  - INV-0024 (security, scope: `["src/legacy/sessions.js"]`)
- A new spec under review does NOT touch any of these paths
- All three domain architect-agents run the probe

## Action
Each domain architect performs the probe.

## Expected Outcome
- Security review: `Orphaned (SUGGESTION only): INV-0020, INV-0024 — referenced entities removed; consider retiring in a future spec`
- Architecture review: `Orphaned (SUGGESTION only): INV-0021, INV-0022 — referenced entities removed; consider retiring in a future spec`
- API review: `Orphaned (SUGGESTION only): INV-0023 — referenced entities removed; consider retiring in a future spec`
- NONE of the three reviews are BLOCKED on account of orphans alone.
- Review Status can be `APPROVED` or `APPROVED WITH NOTES` depending on other findings.
- The orphan count never crosses a threshold that would "escalate" to BLOCKER — there is no such threshold. Orphan is always SUGGESTION.

## Notes
Validates FR-9, BR-2, EC-4. The ceiling property is important: no N-orphan escalation rule exists. Test-agent should verify that even a spec with 50 orphans never gets BLOCKED purely on orphan grounds.
