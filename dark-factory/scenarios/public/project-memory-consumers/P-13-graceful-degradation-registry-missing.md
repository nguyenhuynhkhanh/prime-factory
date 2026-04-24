# Scenario: All consumers gracefully degrade when memory directory is missing

## Type
feature

## Priority
critical — decouples foundation rollout from consumer rollout

## Preconditions
- `dark-factory/memory/` directory does NOT exist (fresh project, or pre-foundation deployment)
- `dark-factory/project-profile.md` exists
- `dark-factory/code-map.md` exists
- A feature spec pipeline is triggered end-to-end

## Action
Spawn each consumer agent in turn on the same project:
1. spec-agent for a new feature
2. architect-agent (with domain parameter) for the produced spec
3. code-agent for implementation
4. debug-agent for an unrelated bug (parallel pipeline)

## Expected Outcome
- **spec-agent**: logs `"Memory registry not found at dark-factory/memory/ — proceeding with empty set"`, produces a valid spec with `## Invariants` and `## Decisions` sections populated with "None —" prose. Does NOT crash or block.
- **architect-agent (per-domain)**: each domain reviewer emits in its domain review file: `Memory probe skipped — registry missing.` No BLOCKER is issued on memory grounds. Review Status can still be APPROVED.
- **code-agent**: logs the same warning, implements normally, treats constraint set as empty. Does NOT crash.
- **debug-agent**: logs the warning, produces a debug report with no invariant cross-reference. Does NOT crash.
- The entire pipeline completes without any memory-related blocker.

## Notes
Validates FR-17, FR-18, EC-1 (in the degenerate case), and INV-TBD-a. This is the critical decoupling guarantee: consumer rollout can ship BEFORE foundation rollout lands the directory, and nothing breaks.
