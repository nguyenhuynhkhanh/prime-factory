# Feature: factory-redesign-v2

## Context

Dark Factory's current design has four structural problems that compound across a project's lifecycle:

1. **Implicit orchestration.** The main Claude conversation context acts as the orchestrator. Lifecycle state is scattered across skill scripts. No single agent is accountable for pipeline health, gate enforcement, or handoff correctness.

2. **Blurred role boundaries.** The spec-agent reads code (architect work). The architect reviews QA scenario completeness (QA work). There is no dedicated QA-agent. Agents bleed into each other's domains, producing inconsistent output and unclear accountability.

3. **Intent drift with no traceability.** The architect approves a spec, then exits. The code-agent implements in isolation. Nothing verifies that architectural decisions made during spec review actually appear in the implementation. Drift is invisible until production.

4. **Flat memory that doesn't scale.** All project decisions live in undifferentiated memory files. Every agent loads everything. Context grows unbounded across a project's lifecycle. There is no mechanism for decisions to be superseded, change-propagated, or domain-scoped.

This spec redesigns the factory process — orchestration, intent system, role boundaries, and communication protocol — as a cohesive whole.

---

## Scope

### In Scope (this spec)

1. **Explicit Orchestrator** — A dedicated orchestrator agent with a defined state machine, lifecycle record, gate enforcement, retry logic, and bidirectional communication protocol.
2. **Hierarchical Intent System** — Layered memory with domain sharding, decision versioning (supersession), and change event propagation. Replaces the current flat memory model.
3. **Clean Role Boundaries** — Spec-agent (requirements only, no code access), Architect (code-aware, owns ADRs, owns drift check), QA-agent (scenarios and coverage map), Code-agent (implementation only), Test-agent (holdout execution only).
4. **Iterative Spec Drafting** — Spec-agent produces a partial draft immediately after initial input and refines it through a structured question loop, not a single long pass.
5. **Onboarding as Factory Prerequisite** — Orchestrator checks for project-profile at INTAKE and routes to onboarding before allowing any feature work.
6. **Communication Protocol** — Defined task packet and result packet schemas for all agent handoffs. Coverage map schema for QA-to-architect handoff.

### Out of Scope (explicitly deferred — see Deferred Drafts)

- **Draft A — Factory Operations**: learning loop, conflict detection, dependency ordering, parallel pipeline health, release awareness, developer feedback loop
- **Draft B — Specialist Quality Gates**: dedicated security reviewer agent, performance gate, QA coverage map depth protocol
- **Draft C — Pipeline Complexity Tiering**: lightweight pipeline for simple features and bug fixes, auto-classification by orchestrator, tiered gate sets

---

## Design

### 1. Orchestrator

The orchestrator is the factory's coordination brain. It holds no domain knowledge, writes no code, and forms no opinions about implementation. Its only job is: maintain state, route work, enforce gates, and handle failures.

#### Lifecycle Record

Each feature or bug fix gets a lifecycle record created at INTAKE and archived at DONE:

```json
{
  "spec_id": "auth-token-refresh",
  "type": "feature",
  "state": "ARCH_SPEC_REVIEW",
  "round_counts": {
    "spec_revision": 2,
    "drift_check": 0,
    "testing": 0
  },
  "gates": {
    "gate_1_arch_spec": null,
    "gate_2_arch_scenario": null,
    "gate_3_drift_check": null,
    "gate_4_holdout": null
  },
  "decision_log": [
    { "state": "INTERVIEW", "timestamp": "...", "note": "developer confirmed: no breaking API changes" },
    { "state": "ARCH_SPEC_REVIEW", "round": 1, "timestamp": "...", "note": "architect requested scope reduction" }
  ],
  "intent_refs": {
    "layer1_domains": ["auth", "api"],
    "layer2_adrs": ["AUTH-011", "API-023"]
  },
  "created_at": "...",
  "updated_at": "..."
}
```

The lifecycle record is the single source of truth for a feature in flight. It is not stored in memory (memory is for long-lived project knowledge). It lives in `dark-factory/manifest.json` under the feature's key during active lifecycle, then archived to `dark-factory/archive/` at DONE.

#### State Machine

```
INTAKE
  │  always
  ▼
[ONBOARDING] ──── only if project-profile.md missing
  │  onboarding complete
  ▼
INTERVIEW
  │  spec-agent signals: enough information gathered
  ▼
SPEC_DRAFT ◄────────────────────────────────────────────┐
  │  spec-agent signals: draft ready for architect       │
  ▼                                                      │
ARCH_INVESTIGATE                                         │
  │  architect signals: code reality report complete     │
  ▼                                                      │
ARCH_SPEC_REVIEW ──── architect: CHANGES_NEEDED ────► SPEC_REVISION ───┘
  │  architect: APPROVED  (gate 1, max 5 rounds)
  ▼
QA_SCENARIO
  │  QA-agent signals: scenarios + coverage map ready
  ▼
QA_SELF_REVIEW
  │  QA-agent signals: self-review complete
  ▼
ARCH_SCENARIO_REVIEW ──── architect: GAPS_FOUND ────► [QA revises, back to QA_SCENARIO]
  │  architect: APPROVED  (gate 2, coverage-map-only check)
  ▼
APPROVED
  │  always (no human gate here — developer confirmed spec at SPEC_DRAFT)
  ▼
IMPLEMENTING
  │  code-agent signals: implementation complete
  ▼
ARCH_DRIFT_CHECK ──── architect: DRIFT_FOUND ────► IMPLEMENTING (max 2 retries)
  │  architect: CLEAN  (gate 3)
  ▼
TESTING ──── test-agent: FAIL ────► IMPLEMENTING (max 3 rounds total)
  │  test-agent: PASS  (gate 4)
  ▼
PROMOTING
  │  promote-agent signals: complete
  ▼
DONE
  └── archive lifecycle record, remove from manifest
```

**Terminal states:**

- `BLOCKED` — max retries exceeded at any gate, orchestrator escalates to developer
- `STALE` — no activity for 48h, cleanup-agent flags it

#### Gate Definitions

| Gate | Enforced At | Condition | Max Rounds |
|------|------------|-----------|------------|
| Gate 1 | ARCH_SPEC_REVIEW | Architect marks spec APPROVED | 5 |
| Gate 2 | ARCH_SCENARIO_REVIEW | Architect marks ADR coverage APPROVED | 3 |
| Gate 3 | ARCH_DRIFT_CHECK | Architect marks implementation CLEAN | 2 |
| Gate 4 | TESTING | Test-agent reports all holdout scenarios PASS | 3 |

If a gate's max rounds are exhausted, the orchestrator sets state to BLOCKED and surfaces a detailed escalation to the developer with the last round's output.

#### Failure Handling

```
Agent returns BLOCKED result
  → orchestrator logs to decision_log
  → increments round_count
  → if round_count < max: re-route with failure context appended to task packet
  → if round_count >= max: set state = BLOCKED, escalate to developer

Agent returns no result (timeout)
  → orchestrator marks STALE after 48h
  → cleanup-agent picks up on next /df-cleanup run
```

---

### 2. Intent System

The intent system replaces flat memory files with a four-layer hierarchy. Each layer has a different scope, lifetime, load strategy, and owner.

#### Layers

```
Layer 0 — Foundation
  Scope:    project-wide, non-negotiable constraints
  Lifetime: permanent until explicitly retired
  Load:     always, by all agents, at start of every task
  Owner:    architect (with developer sign-off for changes)
  Size:     kept small — max ~20 decisions, each one sentence
  Examples: "all external requests go through the API gateway",
            "no PII in logs", "TypeScript strict mode enforced"
  File:     dark-factory/memory/intent-foundation.md

Layer 1 — Architecture
  Scope:    domain-specific long-lived decisions
  Lifetime: months — changes are versioned, not deleted
  Load:     lazy — agent loads only the domain(s) relevant to their task
  Owner:    architect
  Domains:  auth, api, data, ui, infra, testing (extensible)
  Files:    dark-factory/memory/intent-arch-{domain}.md

Layer 2 — Feature ADRs
  Scope:    decisions made during a specific spec's architect review
  Lifetime: active during feature lifecycle; archived after promotion
  Load:     code-agent loads all Layer 2 ADRs for their spec_id
  Owner:    architect (writes during ARCH_SPEC_REVIEW)
  Files:    dark-factory/memory/intent-adr-{spec_id}.md (deleted after DONE)

Layer 3 — Task Context
  Scope:    ephemeral implementation notes, in-progress state
  Lifetime: dies with the agent
  Load:     never persisted
  Owner:    code-agent (internal only)
  Files:    none
```

#### Decision Node Schema

Every decision in Layer 0, 1, or 2 follows this schema:

```markdown
## {DOMAIN}-{NNN}: {Short title}

- **Status**: active | superseded | deprecated
- **Superseded-by**: {DOMAIN}-{NNN}  (if applicable)
- **Domain**: auth | api | data | ui | infra | testing
- **Layer**: 0 | 1 | 2
- **Statement**: One precise sentence describing the decision.
- **Rationale**: Why this decision was made (constraint, incident, tradeoff).
- **Impact**: Which parts of the codebase this decision governs.
- **Effective**: {date}
```

Agents always filter by `Status: active`. History is preserved but not injected into context.

#### Supersession Protocol

When an architectural decision must change:

1. Architect writes the new decision node with `Status: active`
2. Architect updates the old node: `Status: superseded`, `Superseded-by: {new ID}`
3. Architect writes a change event to the orchestrator's decision_log for the project
4. Orchestrator scans manifest for features in flight that reference the superseded decision
5. Orchestrator flags those features: appends a note to their lifecycle record, surfaces it at next routing step

No retroactive reopening of completed features unless developer explicitly requests a re-review.

#### Query Protocol

Agents receive a list of domains and layers to load in their task packet. They load only those files. They query only `Status: active` decisions. They never load the full history.

---

### 3. Roles

#### Orchestrator
- Maintains lifecycle records
- Routes work via task packets
- Enforces gates and retry limits
- Handles failures and escalations
- Detects stale features
- Checks for project-profile at INTAKE
- **Does not**: write requirements, read code, write scenarios, implement

#### Spec-agent (BA)
- Gathers requirements from developer via iterative draft loop
- No code access — reads project-profile.md and Layer 0 intent only
- Revises spec in response to architect feedback (during SPEC_REVISION)
- **Does not**: investigate codebase, write ADRs, write scenarios, make architecture calls
- **Produces**: requirements document, acceptance criteria, scope boundary

#### Architect
- Reads codebase, produces code reality report (ARCH_INVESTIGATE)
- Writes Layer 2 ADRs during ARCH_SPEC_REVIEW
- Reviews spec against code reality (up to 5 rounds with spec-agent)
- Reviews QA coverage map — not scenario internals (ARCH_SCENARIO_REVIEW)
- Reviews implementation diff against Layer 2 ADRs (ARCH_DRIFT_CHECK)
- **Does not**: write requirements, write scenarios, implement code
- **Reads**: full codebase, Layer 0 + Layer 1 (relevant domains) + Layer 2 (current spec)

#### QA-agent
- Writes public and holdout scenarios from the approved spec
- Produces a coverage map (ADR ID → scenario IDs)
- Runs a self-review pass for completeness: edge cases, negative paths, boundary conditions, security surface
- **Does not**: read the codebase, write ADRs, implement code, review architecture decisions
- **Reads**: approved spec, Layer 0, Layer 2 ADRs (to derive coverage map)

#### Code-agent
- Implements from the approved spec
- No questions back to orchestrator — all ambiguity resolved before this state
- If blocked, returns a BLOCKED result packet with specific blocker details
- **Does not**: write specs, write scenarios, make architecture decisions
- **Reads**: approved spec, Layer 0 + Layer 1 (relevant domains) + Layer 2 ADRs, public scenarios

#### Test-agent
- Executes holdout scenarios against the implementation
- Returns pass/fail with evidence (output, errors, diffs)
- **Does not**: read the spec, read public scenarios, modify code
- **Reads**: holdout scenarios only

#### Onboarding-agent
- Runs once per project before any feature work
- Produces: `dark-factory/project-profile.md`, `dark-factory/code-map.md`
- Writes initial Layer 1 decisions (pre-existing architectural patterns discovered in the codebase)
- **Triggered by**: orchestrator detecting missing project-profile at INTAKE

---

### 4. Iterative Spec Drafting

The spec-agent never does a long silent pass. The loop:

```
1. Developer provides raw input (any length, any form)
2. Spec-agent immediately produces a partial draft:
   "Here's what I understood — [draft]. Is this right?"
3. Spec-agent asks 1-3 targeted questions about what's unclear or missing
4. Developer answers
5. Spec-agent updates draft in place, repeats from step 2
6. Loop ends when developer confirms: "yes, that's it"
7. Spec-agent emits completed spec to orchestrator
```

Rules:
- Maximum 3 questions per round (avoid interrogation feel)
- Draft is updated in place — developer always sees the current understanding, not a changelog
- The draft acts as a task tracker: developer can stop at any point and the current draft captures what was agreed
- Spec-agent must ask about: scope boundary (what's explicitly out), acceptance criteria (how will we know it's done), constraints (performance, security, backward compatibility)

---

### 5. Communication Protocol

#### Task Packet (orchestrator → agent)

```json
{
  "spec_id": "...",
  "agent_role": "spec_agent | architect | qa_agent | code_agent | test_agent",
  "state": "INTERVIEW | ARCH_INVESTIGATE | ...",
  "round": 1,
  "max_rounds": 5,
  "inputs": {
    "developer_raw_input": "...",
    "current_spec_draft": "...",
    "code_reality_report": "...",
    "approved_spec": "...",
    "adrs": ["AUTH-011", "API-023"],
    "coverage_map": {...},
    "implementation_diff": "...",
    "previous_round_blockers": [...]
  },
  "intent_load": {
    "layer0": true,
    "layer1_domains": ["auth", "api"],
    "layer2_spec_id": "auth-token-refresh"
  },
  "constraints": [
    "do not access the codebase",
    "ask at most 3 questions this round"
  ]
}
```

Not all fields are populated for every agent. Each agent receives only the inputs relevant to their role and state. The `constraints` field enforces role boundaries explicitly.

#### Result Packet (agent → orchestrator)

```json
{
  "spec_id": "...",
  "agent_role": "...",
  "state": "...",
  "round": 1,
  "status": "COMPLETE | NEEDS_INPUT | BLOCKED | FAILED",
  "output": {
    "spec_draft": "...",
    "code_reality_report": "...",
    "adrs_written": ["AUTH-011"],
    "spec_review_verdict": "APPROVED | CHANGES_NEEDED",
    "spec_review_notes": "...",
    "coverage_map": {...},
    "scenario_review_verdict": "APPROVED | GAPS_FOUND",
    "drift_verdict": "CLEAN | DRIFT_FOUND",
    "drift_notes": "...",
    "test_verdict": "PASS | FAIL",
    "test_evidence": "..."
  },
  "questions_for_developer": [...],
  "blockers": [...]
}
```

#### Coverage Map (QA-agent → architect, via orchestrator)

The architect reviews only the coverage map — never the scenario content itself:

```json
{
  "spec_id": "...",
  "total_public_scenarios": 8,
  "total_holdout_scenarios": 6,
  "adr_coverage": {
    "AUTH-011": {
      "statement": "Use short-lived tokens with server-side session store",
      "covered_by": ["holdout-03", "holdout-05"]
    },
    "API-023": {
      "statement": "All refresh endpoints must be idempotent",
      "covered_by": ["holdout-01", "holdout-06", "public-04"]
    }
  },
  "uncovered_adrs": [],
  "self_review_notes": "Added boundary case for expired token on concurrent request. Added negative path for revoked session mid-flight."
}
```

If `uncovered_adrs` is non-empty, architect will return `GAPS_FOUND` and route back to QA for revision.

---

## Requirements

### Functional

**Orchestrator**
- FR-01: The orchestrator MUST maintain a lifecycle record per feature from INTAKE to DONE and archive it on completion.
- FR-02: The orchestrator MUST enforce gate max-round limits and set state to BLOCKED when limits are exhausted.
- FR-03: The orchestrator MUST detect missing project-profile.md at INTAKE and route to ONBOARDING before proceeding.
- FR-04: The orchestrator MUST check for superseded Layer 2 ADR references in active features when a change event is emitted, and flag affected features.
- FR-05: Task packets MUST include only the inputs and intent layers relevant to the receiving agent's role and current state.

**Spec-agent**
- FR-06: The spec-agent MUST produce a partial draft after the first developer input and update it in place each round.
- FR-07: The spec-agent MUST NOT access the codebase. It reads project-profile.md and Layer 0 intent only.
- FR-08: The spec-agent MUST ask at most 3 questions per round.
- FR-09: The spec-agent MUST explicitly define scope boundary (what is out of scope) and acceptance criteria in the final spec.

**Architect**
- FR-10: The architect MUST produce a code reality report during ARCH_INVESTIGATE before reviewing the spec.
- FR-11: The architect MUST write all Layer 2 ADRs using the defined decision node schema before marking a spec APPROVED at gate 1.
- FR-12: The architect MUST review only the coverage map (not scenario content) during ARCH_SCENARIO_REVIEW.
- FR-13: The architect MUST produce a diff-referenced drift report during ARCH_DRIFT_CHECK, citing specific ADR IDs where drift is found.
- FR-14: The architect MUST NOT write test scenarios, implement code, or write requirements.

**QA-agent**
- FR-15: The QA-agent MUST produce a coverage map linking each Layer 2 ADR to the scenario(s) that exercise it.
- FR-16: The QA-agent MUST perform a self-review pass covering: edge cases, negative paths, boundary conditions, and security surface before emitting results.
- FR-17: The QA-agent MUST NOT access the codebase directly.

**Code-agent**
- FR-18: The code-agent MUST NOT ask questions. If blocked, it returns a BLOCKED result packet with specific blocker details.
- FR-19: The code-agent MUST reference the Layer 2 ADR IDs in the implementation where an architectural decision governs the code written.

**Test-agent**
- FR-20: The test-agent MUST NOT read the approved spec or public scenarios. It receives holdout scenarios only.

**Intent System**
- FR-21: Decision nodes MUST include status, superseded-by (if applicable), domain, layer, statement, rationale, impact, and effective date.
- FR-22: Agents MUST query only `Status: active` decisions — they MUST NOT load full history.
- FR-23: When a decision is superseded, the old node MUST be updated to `Status: superseded` with a `Superseded-by` reference — it MUST NOT be deleted.

### Non-Functional

- NFR-01: Layer 0 intent MUST be kept to a maximum of 20 decisions to bound the always-loaded context cost.
- NFR-02: Layer 1 domain shards MUST be loadable independently so an agent working on `auth` does not load `ui` decisions.
- NFR-03: Layer 2 ADR files MUST be deleted after DONE and are not part of long-lived memory.
- NFR-04: Task packets MUST NOT include holdout scenario content when routing to the code-agent.
- NFR-05: Task packets MUST NOT include public scenario content when routing to the test-agent.
- NFR-06: The orchestrator MUST surface a human-readable escalation summary when any feature reaches BLOCKED state.

---

## Data Models

### Lifecycle Record (manifest.json entry)

```json
{
  "spec_id": "string",
  "type": "feature | bugfix",
  "state": "INTAKE | INTERVIEW | SPEC_DRAFT | ARCH_INVESTIGATE | ARCH_SPEC_REVIEW | SPEC_REVISION | QA_SCENARIO | QA_SELF_REVIEW | ARCH_SCENARIO_REVIEW | APPROVED | IMPLEMENTING | ARCH_DRIFT_CHECK | TESTING | PROMOTING | DONE | BLOCKED | STALE",
  "round_counts": {
    "spec_revision": "integer",
    "qa_revision": "integer",
    "drift_check": "integer",
    "testing": "integer"
  },
  "gates": {
    "gate_1_arch_spec": "null | approved | blocked",
    "gate_2_arch_scenario": "null | approved | blocked",
    "gate_3_drift_check": "null | clean | blocked",
    "gate_4_holdout": "null | passed | blocked"
  },
  "decision_log": [
    {
      "state": "string",
      "round": "integer | null",
      "timestamp": "ISO8601",
      "note": "string"
    }
  ],
  "intent_refs": {
    "layer1_domains": ["string"],
    "layer2_adrs": ["string"]
  },
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Decision Node (Layer 0, 1, 2)

```markdown
## {DOMAIN}-{NNN}: {Short title}

- **Status**: active | superseded | deprecated
- **Superseded-by**: {DOMAIN}-{NNN}
- **Domain**: auth | api | data | ui | infra | testing
- **Layer**: 0 | 1 | 2
- **Statement**: {one precise sentence}
- **Rationale**: {why — constraint, incident, tradeoff}
- **Impact**: {which code this governs}
- **Effective**: {YYYY-MM-DD}
```

---

## Deferred Drafts

### Draft A — Factory Operations

Scope: learning loop (post-ship retrospective writes back to Layer 1 memory), conflict detection (two specs touching the same code), dependency ordering (Spec B requires Spec A), parallel pipeline health (multiple features in flight), release awareness (merge freeze, release windows), developer feedback loop (post-ship signal).

### Draft B — Specialist Quality Gates

Scope: dedicated security reviewer agent as an additional gate between ARCH_SCENARIO_REVIEW and APPROVED, performance gate (architect or specialist reviews perf implications before code-agent starts), QA coverage map depth protocol (how much coverage is "enough").

### Draft C — Pipeline Complexity Tiering

Scope: auto-classification of tasks into tiers (Trivial, Simple, Standard, Complex) by the orchestrator at INTAKE based on signals (expected lines of code, number of modules, ADR references, security implications), with a lightweight gate set for Tier 2 (Simple) that skips QA-agent, drift check, and compresses architect review. Goal: make the factory usable for 5-line fixes without fear of a 2-hour wait.
