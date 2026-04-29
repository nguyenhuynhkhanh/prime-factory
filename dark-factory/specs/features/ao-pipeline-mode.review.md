# Architect Review: ao-pipeline-mode

## Overall Status: APPROVED

## Domains Reviewed
- Security & Data Integrity
- Architecture & Performance
- API Design & Backward Compatibility

## Key Decisions Made

1. **`--body-file` for `gh pr create`** — Using a temp file (not shell interpolation) for PR body is the correct approach. Prevents shell injection from spec content containing backticks, `$`, or quotes. Temp file must be cleaned up after PR creation attempt (success or failure).

2. **Judge agents hardcoded to `claude-sonnet`** — architect-agent and test-agent always receive `claude-sonnet` regardless of `--mode`. This is an invariant (INV-TBD-a). No override path exists.

3. **Best-of-N gating: Tier 3 + quality mode only** — Both conditions must be true. Neither condition alone triggers Best-of-N. This constraint is absolute and must be documented in implementation-agent.

4. **Round counting for Best-of-N** — A Best-of-N attempt counts as exactly 1 round against the 3-round max. This is intentional by design (DEC-TBD-b).

5. **Model IDs without version suffixes** — Write `claude-opus` and `claude-sonnet` without version suffixes (e.g., not `claude-opus-4-5`). The runtime resolves the current version automatically (DEC-TBD-a).

6. **`--mode` default is `balanced`** — Preserves existing behavior. Omitting `--mode` is identical to `--mode balanced`. Must be explicitly documented.

7. **Manifest `mode` field is additive** — Backward-compatible. Existing entries without `mode` treated as `balanced`. Field recorded at spec start, before architect review, even if spec fails.

## Remaining Notes

- Ensure `--afk` spec content capture happens inside cleanup phase, BEFORE spec file deletion (FR-14, BR-8).
- The `--best-of-n` standalone flag must be treated as an unknown flag with error directing to `--mode quality` (BR-3).
- Ensure mutual-exclusivity block in df-orchestrate does NOT list `--mode` + `--skip-tests` as mutually exclusive (they are orthogonal).
- Plugin mirror consistency required: both `.claude/` and `plugins/dark-factory/` files must be updated for every change.
- The `bestOfN` object is only written to manifest when Best-of-N actually ran.
