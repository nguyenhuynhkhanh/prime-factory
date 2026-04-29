# Scenario: H-14 — `--mode quality` multi-spec run with mixed tiers: per-spec model selection applies independently

## Type
edge-case

## Priority
high — EC-2. In a real pipeline run, specs often have different tiers. Each spec must get its own model selection and Best-of-N decision independently — not based on the highest-tier spec in the batch.

## Preconditions
- `--mode quality` flag with `--all` or `--group`.
- Batch contains: spec-alpha (Tier 1), spec-beta (Tier 2), spec-gamma (Tier 3).

## Action
Structural test verifies that `implementation-agent.md` documents per-spec independent model selection:
1. Model selection is applied per-spec based on `(mode, tier)` — not per-run based on the highest tier in the batch.
2. For the mixed-tier batch, the execution plan shows per-spec breakdown (e.g., "spec-alpha: Opus (Tier 1 / quality), no Best-of-N" and "spec-gamma: Opus + Best-of-N (Tier 3 / quality)").
3. Only Tier 3 specs in the batch get Best-of-N; Tier 1/2 specs get single code-agent with Opus.

## Expected Outcome
- All three assertions pass.
- Each spec's model and Best-of-N status is determined independently.

## Failure Mode (if applicable)
"implementation-agent.md should document per-spec model selection in multi-spec quality runs."

## Notes
EC-2: the execution plan shows per-spec breakdown so the developer can see exactly what each spec will use before confirming. This is part of FR-3 (mode display in execution plan).
