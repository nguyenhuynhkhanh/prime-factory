# Draft C: pipeline-complexity-tiering

## Status
Raw draft — not yet specced. Come back when ready.

## Problem
The full factory pipeline (interview → spec → architect investigation → architect review → QA
scenarios → scenario review → implementation → drift check → holdout validation → promote →
learning loop) takes hours. Developers bypass it entirely for small changes, and are skeptical
of its quality for very large changes. Neither extreme is good.

## Scope (when specced)

### Auto-classification by orchestrator
At INTAKE, the orchestrator classifies the task into a tier based on signals in the spec or
developer input: expected file count, number of modules, ADR references needed, presence of
security/performance implications, cross-team dependencies.

### Tier definitions

**Tier 1 — Trivial** (current direct-implementation bypass)
Single file, no logic change, self-evident correctness. No pipeline. Implemented directly.
Examples: typo fix, config value, comment.

**Tier 2 — Simple** (lightweight pipeline, ~15-20 min)
Small feature or bug, ≤ ~50 lines, single module. Abbreviated pipeline:
- Spec-agent: quick draft, 1-2 questions max, no code access
- Architect: light review (no deep investigation), ADRs optional
- Code-agent: implement
- Test-agent: holdout validation
Skips: QA-agent, drift check, learning loop.

**Tier 3 — Standard** (full pipeline, compressed, ~45-60 min)
Medium feature, 1-3 modules, some complexity. Full pipeline but architect investigation is
focused (not deep), single spec-agent (not 3 perspectives).
Skips: parallel spec-agents, security reviewer, performance gate.

**Tier 4 — Complex** (full pipeline, all agents, all gates, ~2-3 hrs async)
Large feature, cross-cutting, multiple modules, architectural impact.
Everything: architect deep investigation, QA-agent, security reviewer, drift check, learning loop.

### Developer override
Developer can bump a tier up ("treat this as Tier 4") or down ("I know this is simple, Tier 2").
Orchestrator warns but respects the override.

## Notes
The key insight: the orchestrator auto-classifies — the developer does not have to choose a tier.
Wrong classification is recoverable (developer overrides). The fear of a 2-hour wait for a 5-line
fix is the primary adoption blocker for DF on small tasks. Tiering fixes this without compromising
quality on complex work.
