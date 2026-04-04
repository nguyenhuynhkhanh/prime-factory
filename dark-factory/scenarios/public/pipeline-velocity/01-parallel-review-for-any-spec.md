# Scenario: Every spec gets parallel domain review regardless of size

## Type
feature

## Priority
critical -- validates the core principle that every spec gets full parallel review

## Preconditions
- A feature spec exists with Implementation Size Estimate: `Scope size: small`, `Estimated file count: 2`
- Public and holdout scenarios exist
- No previous review files exist

## Action
Run `/df-orchestrate test-feature`

## Expected Outcome
- Three architect-agents are spawned in parallel, each with a domain parameter:
  1. Security and data integrity domain
  2. Architecture and performance domain
  3. API design and backward compatibility domain
- Each architect-agent produces a domain-specific review file:
  - `test-feature.review-security.md`
  - `test-feature.review-architecture.md`
  - `test-feature.review-api.md`
- Architect-agents do NOT spawn spec-agents or modify the spec directly
- After all three complete, the orchestrator synthesizes findings into `test-feature.review.md` (backward-compatible format)
- If all three domains are APPROVED, overall status is APPROVED
- The orchestrator spawns ONE spec-agent (if any findings need addressing) or proceeds to implementation (if all clean)
- There is NO scope-based gating, tiering, or skipping logic -- the spec size is irrelevant to review behavior
- The manifest entry includes `"estimatedFiles": 2`

## Notes
This scenario explicitly uses a small spec to prove that no review is ever skipped. The parallel spawn pattern mirrors the existing parallel code-agent pattern in df-orchestrate.
