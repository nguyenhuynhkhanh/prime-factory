# Scenario: project-memory-template.md documents every required field

## Type
feature

## Priority
critical — the template is the source of truth for onboard-agent and promote-agent.

## Preconditions
- `dark-factory/templates/project-memory-template.md` exists.

## Action
Read the template file. Verify it documents the schema for all three memory file types and lists every required field.

## Expected Outcome
- The template contains a section for each of the three file types: invariants, decisions, ledger.
- For each file type the template lists every field from FR-8 / FR-9 / FR-10 respectively.
- Invariants fields documented: `id`, `title`, `rule`, `scope.modules`, `scope.entities`, `source`, `sourceRef`, `status`, `supersededBy`, `introducedBy`, `introducedAt`, `rationale`, `domain`, `enforced_by` or `enforcement`, `guards`, `referencedBy`.
- Decisions fields documented: `id`, `title`, `context`, `decision`, `rationale`, `alternatives`, `status`, `supersededBy`, `introducedBy`, `introducedAt`, `domain`, `referencedBy`.
- Ledger fields documented: `id`, `name`, `summary`, `promotedAt`, `introducedInvariants`, `introducedDecisions`, `promotedTests`, `gitSha`.
- The template includes one complete valid example entry per file type.

## Notes
Validates FR-7, FR-8, FR-9, FR-10. If any field is missing from the template, downstream agents will emit malformed memory when this sub-spec's consumers ship.
