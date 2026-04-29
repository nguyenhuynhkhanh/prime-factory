# Feature: {name}

## Context
Why is this needed? What problem does it solve? What is the business value?

## Design Intent

> **Tier conditionality**: OPTIONAL for Tier 1 specs. SUGGESTED (non-blocking) for Tier 2/3 specs. Architect emits a SUGGESTION (never CONCERN or BLOCKER) if this section is absent on a Tier 3 spec. Architect emits a CONCERN (not BLOCKER) if `Drift risk` is empty on a spec with cross-cutting keywords ("all agents", "pipeline", "system-wide").
>
> *(Spec-agent auto-populates this section during Phase 4 using data from loaded DI/INV/DEC memory shards, then presents it to the developer at scope sign-off for confirmation, editing, or removal. If no DI shards exist yet, leave the placeholder text below.)*

**Intent introduced**: What new design intent does this spec establish? Describe the survival criterion — what pattern must survive and why it is fragile. Use `DI-TBD-a`, `DI-TBD-b`, ... as placeholder IDs for new intents (promote-agent assigns permanent `DI-NNNN` IDs at promotion). If this spec introduces no new design intent, write "None."

**Existing intents touched**: List any active `DI-NNNN` entries from the loaded memory shards that this spec modifies, erodes, or deliberately supersedes. If none, write "None."

**Drift risk**: What aspect of this spec is most vulnerable to silent erosion by future AI edits? If this spec has cross-cutting keywords ("all agents", "pipeline", "system-wide"), this field MUST be populated to avoid an architect CONCERN. If there is no meaningful drift risk, explain why briefly.

## Scope
### In Scope (this spec)
- Concrete list of what will be built

### Out of Scope (explicitly deferred)
- What is NOT being built and why

### Scaling Path
How this feature grows if the business need grows. Not a commitment — a direction.

## Requirements
### Functional
- FR-1: {requirement} — {rationale}
- FR-2: ...

### Non-Functional
- NFR-1: {requirement} — {rationale}

## Data Model
Schema changes, new collections, field additions.

## Migration & Deployment (MANDATORY for production systems)
**Any change that alters how data is stored, formatted, keyed, or queried MUST have a migration plan.**
This applies to: schema changes, field renames, format changes, cache key changes, config restructuring, API contract changes, behavioral changes to shared queries.

- **Existing data**: What happens to rows/documents/cache entries that already exist in the old format? Specify: migrate in-place, backfill, dual-read, or invalidate.
- **Rollback plan**: If the deployment fails, can we revert without data loss? If not, what's the recovery procedure?
- **Zero-downtime**: Can this be deployed without downtime? If not, what's the maintenance window?
- **Deployment order**: If there are multiple changes (schema + code + config), what order must they deploy in?
- **Stale data/cache**: If cached values or derived data use the old format/keys, how are they invalidated or migrated?

If this feature does NOT touch existing data, stored formats, or cached values, write "N/A — no existing data affected" with a brief justification.

## API Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/v1/... | ... | role |

## Business Rules
- BR-1: {rule} — {why this rule exists}
- BR-2: ...

## Error Handling
| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Invalid input | 400 + details | None |
| Unauthorized | 403 | Audit log |

## Acceptance Criteria
- [ ] AC-1: ...
- [ ] AC-2: ...

## Edge Cases
- EC-1: {case} — {expected behavior}

## Dependencies
Other modules/services affected. Breaking changes to existing behavior.
If this is a sub-spec of a decomposed feature:
- **Depends on**: list of sub-spec names that must complete before this one
- **Depended on by**: list of sub-spec names that need this to complete first
- **Group**: parent feature name

## Implementation Size Estimate
- **Scope size**: small (1-2 files) | medium (3-5 files) | large (6-10 files) | x-large (10+ files)
- **Suggested parallel tracks**: how many code-agents and what each implements. ZERO file overlap between tracks.

## Architect Review Tier
- **Tier**: {1 | 2 | 3 | Unset — architect self-assesses}
- **Reason**: {primary classification signal that drove this tier}
- **Agents**: {1 combined | 3 domain agents}
- **Rounds**: {1 | 2 | 3+}

Classification signals:
- Tier 1: ≤ 2 files, no migration section, no security/auth domain, no cross-cutting keywords
- Tier 2: 3–4 files, OR some cross-cutting concerns, not Tier 3 triggers
- Tier 3: 5+ files, OR populated migration section, OR cross-cutting keywords ("all agents", "pipeline", "system-wide"), OR shared templates/test contracts, OR security/auth domain

## Implementation Notes
Patterns to follow from the existing codebase. Specific files/modules to extend.
NOT a design doc — just enough guidance for the code-agent to stay consistent.

## Invariants

### Preserves
*None — this spec neither preserves nor references existing invariants.*
<!-- List IDs of active invariants whose rules continue to hold under this spec.
Example:
- INV-0001 — auth tokens must be signed with the production secret; confirmed: this spec does not change token signing.
-->

### References
*None — no existing registered invariants in scope for this spec.*
<!-- List IDs of relevant invariants that are not directly enforced by this spec.
Example:
- INV-0004 — relevant context; this spec does not modify its scope modules.
-->

### Introduces
*None — this spec introduces no new cross-cutting rules.*
<!-- If this spec introduces new invariants, list them with all required fields:
- **INV-TBD-a**
  - **title**: {short descriptive title}
  - **rule**: {the rule that must hold — precise and testable}
  - **scope.modules**: {list of file paths or module names this rule governs}
  - **domain**: security | architecture | api
  - **enforced_by**: {test file path} OR **enforcement**: runtime | manual
  - **rationale**: {why this rule must exist and survive cleanup}

INV-TBD IDs are spec-local (letters, sequential). promote-agent assigns permanent INV-NNNN IDs.
-->

### Modifies
*None.*
<!-- If this spec narrows/adjusts an existing invariant, declare it here with mandatory rationale:
- INV-NNNN — {what changes and why}
  - **rationale**: {why the existing rule needed adjustment}
-->

### Supersedes
*None.*
<!-- If this spec replaces an existing invariant entirely, declare it here:
- INV-TBD-X supersedes INV-NNNN
  - **rationale**: {why the old rule no longer holds and what this spec's new rule provides instead}
-->

## Decisions

### References
*None — no existing decisions in scope.*
<!-- List IDs of existing decisions that informed this spec.
Example:
- DEC-0002 — design decision to use shard-selective loading; this spec follows it.
-->

### Introduces
*None — this spec introduces no new architectural decisions.*
<!-- If this spec makes architectural choices worth recording as decisions, list them:
- **DEC-TBD-a**
  - **title**: {short descriptive title}
  - **decision**: {the decision made}
  - **rationale**: {why this option was chosen}
  - **alternatives**: {alternatives considered and why they were rejected}
  - **scope.modules**: {modules this decision governs}
  - **domain**: security | architecture | api
  - **enforced_by**: {test file path} OR **enforcement**: runtime | manual
-->

### Supersedes
*None.*
<!-- If this spec replaces an existing decision, declare it:
- DEC-TBD-X supersedes DEC-NNNN
  - **rationale**: {why the old decision no longer holds}
-->
