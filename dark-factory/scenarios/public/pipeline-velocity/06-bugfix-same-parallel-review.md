# Scenario: Bugfix debug report gets the same parallel domain review as features

## Type
feature

## Priority
high -- validates that bugfixes are not treated differently

## Preconditions
- A bugfix debug report exists at `dark-factory/specs/bugfixes/auth-token-leak.spec.md`
- Public and holdout scenarios exist for the bugfix
- No previous review files exist

## Action
Run `/df-orchestrate auth-token-leak`

## Expected Outcome
- The orchestrator detects this is a bugfix (debug report in `specs/bugfixes/`)
- Three architect-agents are spawned in parallel with domain parameters, identical to the feature path:
  1. Security and data integrity domain
  2. Architecture and performance domain
  3. API design and backward compatibility domain
- Each produces a domain-specific review file in `dark-factory/specs/bugfixes/`:
  - `auth-token-leak.review-security.md`
  - `auth-token-leak.review-architecture.md`
  - `auth-token-leak.review-api.md`
- Synthesis produces `auth-token-leak.review.md` in the same format as feature reviews
- Findings are forwarded to code-agents on approval
- There is NO special gating, reduced review, or different process for bugfixes

## Notes
Risk is risk regardless of pipeline mode. A bugfix that introduces a new security vulnerability is just as dangerous as a feature that does so.
