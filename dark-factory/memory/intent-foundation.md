# Layer 0 — Foundation Intent

Layer 0 contains project-wide, non-negotiable constraints that apply to all agents at all times. These are the "always-loaded" decisions — every agent reads this file at the start of every task.

**Size constraint: maximum 20 decisions.** Keep this file small. If you need more than 20 decisions, promote the less fundamental ones to Layer 1 domain shards.

## Decision Node Schema

Every decision in Layer 0 follows this schema:

```markdown
## {DOMAIN}-{NNN}: {Short title}

- **Status**: active | superseded | deprecated
- **Superseded-by**: {DOMAIN}-{NNN}  (if applicable, otherwise omit)
- **Domain**: auth | api | data | ui | infra | testing
- **Layer**: 0
- **Statement**: One precise sentence describing the decision.
- **Rationale**: Why this decision was made (constraint, incident, tradeoff).
- **Impact**: Which parts of the codebase this decision governs.
- **Effective**: {YYYY-MM-DD}
```

Agents always filter by `Status: active`. Superseded and deprecated nodes are preserved for history but never injected into agent context.

## Query Protocol

Agents load this file completely (it is always small — max 20 decisions). They query only `Status: active` entries. They never load the full history of superseded decisions into working context.

## Supersession Protocol

When a foundation decision must change:
1. Write the new decision node with `Status: active`
2. Update the old node: `Status: superseded`, `Superseded-by: {new ID}`
3. Never delete old nodes — history is preserved but filtered out of active context

---

## Example Decisions

## INFRA-001: All external requests go through the API gateway

- **Status**: active
- **Domain**: infra
- **Layer**: 0
- **Statement**: All external HTTP requests to backend services must be routed through the API gateway — no direct service-to-service calls from clients.
- **Rationale**: Centralized auth enforcement, rate limiting, and observability. Services discovered this was missing during a security audit in Q1.
- **Impact**: All API endpoints, all client integrations, all new service additions.
- **Effective**: 2026-01-01

## INFRA-002: No PII in logs

- **Status**: active
- **Domain**: infra
- **Layer**: 0
- **Statement**: Log entries must never contain personally identifiable information — use anonymized IDs or hashed values instead.
- **Rationale**: GDPR compliance. PII in logs creates a secondary data store with different retention controls.
- **Impact**: All logging calls across all services and agents.
- **Effective**: 2026-01-01
