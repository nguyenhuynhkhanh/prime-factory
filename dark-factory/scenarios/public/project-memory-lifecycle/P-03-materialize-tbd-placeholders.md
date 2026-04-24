# Scenario: promote-agent materializes INV-TBD / DEC-TBD placeholders with full schema

## Type
feature

## Priority
critical — materialization is the point of the TBD placeholder mechanism.

## Preconditions
- Spec declares `## Invariants > Introduces > INV-TBD-a` with all fields populated.
- `.claude/agents/promote-agent.md` edited.

## Action
Read promote-agent.md's Introduces-handler documentation.

## Expected Outcome
- Agent documents reading each INV-TBD-* / DEC-TBD-* from the spec's `## Invariants` / `## Decisions > Introduces` subsection.
- For each, assigns a permanent ID and writes a full entry in the target memory file.
- Every schema field from the spec declaration is copied (rule, scope, rationale, domain, enforced_by OR enforcement, guards, referencedBy, etc.).
- `introducedBy: <spec-name>` and `introducedAt: <ISO now>` are set automatically.

## Notes
Asserts the materialization step covers all foundation-defined fields.
