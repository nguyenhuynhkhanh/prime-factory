# Scenario: H-16 — Existing manifest entries without `mode` field are handled gracefully

## Type
edge-case

## Priority
medium — EC-10. Legacy manifest entries from before this feature was implemented lack the `mode` field. Any code that reads `mode` from the manifest must handle its absence without crashing.

## Preconditions
- `dark-factory/manifest.json` contains one or more entries from before this feature (no `mode` field present).
- df-orchestrate is invoked with the new version that supports `--mode`.

## Action
Structural test verifies that `implementation-agent.md` and/or `df-orchestrate/SKILL.md` document:
1. Existing manifest entries without `mode` are treated as `"mode": "balanced"` (the default).
2. The `mode` field is NOT retroactively written to existing entries — only new runs add it.
3. No code path reads `manifest.mode` in a way that would throw or crash on undefined.

## Expected Outcome
- All three assertions pass: backward-compatible default, no retroactive writes, no crash on missing field.

## Failure Mode (if applicable)
"Manifest entries without 'mode' field should default to 'balanced', not crash."

## Notes
EC-10 is a migration scenario: the manifest.json in this repo already has 6 active entries without `mode`. After implementation, those entries must remain valid and must not be modified by df-orchestrate until they are re-run.
