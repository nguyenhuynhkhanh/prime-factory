# Scenario: Architect-agent per-domain probe emits Memory Findings block in each domain review

## Type
feature

## Priority
critical — the probe IS the enforcement mechanism

## Preconditions
- Memory registry contains entries in all three domains:
  - `INV-0002` (domain: security)
  - `INV-0004` (domain: architecture)
  - `INV-0006` (domain: api)
- A spec exists that scopes into `src/auth/` and `src/api/routes/`
- implementation-agent spawns three architect-agents in parallel, each with a `domain` parameter

## Action
Each domain-parameterized architect-agent performs Step 1 Deep Review, including the memory probe, and writes its domain review file.

## Expected Outcome
- `dark-factory/specs/features/{name}.review-security.md` contains a `### Memory Findings (Security)` block.
- `dark-factory/specs/features/{name}.review-architecture.md` contains a `### Memory Findings (Architecture)` block.
- `dark-factory/specs/features/{name}.review-api.md` contains a `### Memory Findings (API)` block.
- Each block contains all five categories (even if empty-line "none"):
  - `Preserved`
  - `Modified (declared in spec)`
  - `Potentially violated (BLOCKER)`
  - `New candidates declared`
  - `Orphaned (SUGGESTION only)`
- The security review discusses `INV-0002` only (or no memory entries if none apply). It does NOT discuss `INV-0004` (architecture) or `INV-0006` (api).
- The architecture review discusses `INV-0004` only.
- The api review discusses `INV-0006` only.
- No cross-domain duplication.

## Notes
Validates FR-6, FR-7, AC-4, BR-2, BR-3. This is the core per-domain discipline. The holdout suite will verify contradiction cases and default-to-security edge cases.
