# Scenario: Two concurrent specs in separate worktrees each declare INV-TBD-a with no conflict

## Type
concurrency

## Priority
high — spec-local ID contract verification

## Preconditions
- Memory contains no entry matching either declaration
- Worktree A: spec-agent drafts `feature-alpha.spec.md` declaring `INV-TBD-a: request-tracing-required`
- Worktree B: spec-agent drafts `feature-beta.spec.md` declaring `INV-TBD-a: password-entropy-minimum` (unrelated to alpha's rule)
- Both specs are in parallel architect review (implementation-agent runs them through distinct pipelines)

## Action
Both spec-agents write their respective specs. Both architect-agents run probes independently.

## Expected Outcome
- `feature-alpha.spec.md` contains `INV-TBD-a` for request tracing.
- `feature-beta.spec.md` contains `INV-TBD-a` for password entropy.
- Each architect sees only its own spec's candidate. Neither architect references the other's `INV-TBD-a`.
- Neither review raises a "duplicate candidate" BLOCKER — TBD IDs are spec-local.
- At promotion time (handled by project-memory-lifecycle, OUT OF SCOPE here), promote-agent assigns two distinct sequential IDs (e.g., INV-0041 for alpha, INV-0042 for beta). For THIS spec, only the pre-promotion invariant matters: concurrent TBD declarations do not conflict during architect review.
- spec-agent prompt language confirms TBD IDs are spec-local (search for "spec-local" or "TBD IDs are unique within a single spec").

## Notes
Validates BR-6, EC-7. The parallel-worktree architecture must not create false conflicts at architect time.
