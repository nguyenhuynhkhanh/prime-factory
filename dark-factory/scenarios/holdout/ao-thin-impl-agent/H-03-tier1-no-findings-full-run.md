# Scenario: Tier 1 spec run completes successfully when no findings file exists

## Type
edge-case

## Priority
high — Tier 1 is the fast-track path for small changes. If it breaks when findings are absent, every small spec fails.

## Preconditions
- Compiled `implementation-agent.md` and `code-agent.md` are current.
- A simulated Tier 1 spec exists at `dark-factory/specs/features/test-tier1.spec.md` with `Architect Review Tier: Tier 1`.
- NO `test-tier1.findings.md` file exists in the spec directory.
- `publicScenariosDir` exists at `dark-factory/scenarios/public/test-tier1/` (may be empty or have 1-2 files).

## Action
Read `.claude/agents/code-agent.md`. Verify the self-load instructions explicitly handle the case where `architectFindingsPath` points to a non-existent file.

Also read `.claude/agents/implementation-agent.md` and verify that Step 0d or Step 0c for Tier 1 specs includes a note about findings file behavior when architect review is minimal or skipped.

## Expected Outcome
- code-agent.md describes: if `architectFindingsPath` does not exist → log "No architect findings file at {path} — proceeding with empty findings" and continue.
- implementation-agent.md does NOT require the findings file to exist before spawning code-agent (the spawn proceeds regardless).
- The scenario flow produces no error about missing findings.

## Notes
Validates FR-6, BR-4, EC-1. This is the Tier 1 fast-path regression guard for the findings mechanism.
