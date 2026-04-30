# Draft A: factory-operations

## Status
Raw draft — not yet specced. Come back when ready.

## Problem
The factory pipeline has no mechanisms for coordinating work across multiple concurrent features,
learning from completed work, or integrating with project release schedules. Each feature runs in
isolation with no awareness of what else is in flight.

## Scope (when specced)

### Learning loop
After a feature is promoted, a retrospective agent writes lessons back to Layer 1 memory:
patterns discovered, scope estimation accuracy, ADR decisions that turned out wrong, test coverage
gaps. Factory gets smarter per project over time.

### Conflict detection
Two specs touching the same files/modules with no coordination. Orchestrator detects overlap at
IMPLEMENTING state and either serializes or flags for developer resolution before both proceed.

### Dependency ordering
Spec B requires Spec A to be done first. Currently manifest supports `dependencies` field but
orchestrator does not enforce ordering across groups or flag specs that are silently blocked by
an unregistered dependency.

### Parallel pipeline health
Multiple features in flight simultaneously with no visibility into collisions, shared-file contention,
or cumulative test load. Needs a health dashboard or at minimum a summary command.

### Release awareness
Factory doesn't know about merge freezes, release windows, or branch cut dates. Orchestrator
should be able to pause or flag non-critical specs during a freeze period.

### Developer feedback loop
No signal back from the developer after a feature ships: was the output good? did it solve the
problem? did it need rework post-promotion? This signal would feed the learning loop.

## Notes
These six concerns are related but separable. They may be specced as one feature or split into
2-3 smaller specs depending on scope assessment.
