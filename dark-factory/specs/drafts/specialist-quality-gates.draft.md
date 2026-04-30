# Draft B: specialist-quality-gates

## Status
Raw draft — not yet specced. Come back when ready.

## Problem
The current quality gate chain (spec → architect → QA → code → drift check → holdout) has no
dedicated coverage for security or performance concerns. These are cross-cutting and require
specialist perspective that the architect and QA-agent are not optimally positioned to provide.

## Scope (when specced)

### Dedicated security reviewer agent
A security-reviewer agent inserted as an additional gate between ARCH_SCENARIO_REVIEW and APPROVED.
Reviews the approved spec and ADRs specifically for: injection surface, authentication/authorization
gaps, data exposure risks, dependency vulnerabilities implied by the design. Returns APPROVED or
SECURITY_CONCERNS with specific findings. Does not review code — spec-level only.

### Performance gate
An optional gate (triggered by spec signals: "high throughput", "large dataset", "real-time",
"latency-sensitive") where either the architect or a dedicated perf-reviewer assesses performance
implications before implementation begins. Prevents designing-in bottlenecks that are expensive
to fix post-implementation.

### QA coverage map depth protocol
Currently the architect checks ADR coverage only. A depth protocol would define what "enough"
looks like for QA scenarios: minimum scenario counts per requirement, required negative path
coverage, security surface coverage checklist. Gives the QA self-review pass a concrete rubric
rather than best-effort judgment.

## Notes
Security reviewer is the highest priority of the three — it addresses a real gap in production
readiness. Performance gate is the most context-dependent. Coverage depth protocol is the most
mechanical and likely easiest to implement.
