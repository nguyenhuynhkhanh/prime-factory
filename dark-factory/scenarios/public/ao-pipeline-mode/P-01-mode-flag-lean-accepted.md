# Scenario: P-01 — `--mode lean` flag is accepted and propagated

## Type
feature

## Priority
critical — FR-1. The `--mode` flag is the primary entry point for this feature; if it fails to parse, everything else fails.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` has been updated with `--mode` flag support.
- `plugins/dark-factory/skills/df-orchestrate/SKILL.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the ao-pipeline-mode assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `df-orchestrate/SKILL.md` contains:
1. A `## Trigger` section that lists `--mode lean|balanced|quality` as an accepted flag.
2. The string `--mode` appears in the argument parsing section.
3. The string `lean` appears as a valid mode value.

## Expected Outcome
- All three assertions pass.
- The `--mode` flag documentation is present in the trigger section alongside existing flags (`--force`, `--skip-tests`, `--group`, `--all`).

## Failure Mode (if applicable)
If `--mode` is absent from the trigger section, the test should fail with: "df-orchestrate SKILL.md should document --mode flag in Trigger section."

## Notes
This tests documentation/presence only, not runtime behavior. The trigger section is the canonical reference for all supported flags (NFR-5).
