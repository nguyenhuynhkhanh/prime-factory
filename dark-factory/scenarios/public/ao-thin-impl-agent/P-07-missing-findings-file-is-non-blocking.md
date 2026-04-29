# Scenario: code-agent handles missing architectFindingsPath gracefully without error

## Type
feature

## Priority
high — Tier 1 specs skip or produce no findings file; if code-agent errors on missing findings, Tier 1 implementations break entirely.

## Preconditions
- `src/agents/code-agent.src.md` (or compiled `code-agent.md`) has been modified per this spec.

## Action
Read `.claude/agents/code-agent.md`. Look for instructions about what code-agent should do when `architectFindingsPath` points to a file that does not exist.

## Expected Outcome
- The agent text explicitly states that a missing findings file is not an error.
- The agent text includes language to log a warning (e.g., "No architect findings file at {path} — proceeding with empty findings") and continue.
- The agent text does NOT say to stop, report failure, or request a retry when findings are absent.

## Notes
Validates FR-6, BR-4, EC-1. This grace behavior is critical for Tier 1 specs in the standard pipeline.
