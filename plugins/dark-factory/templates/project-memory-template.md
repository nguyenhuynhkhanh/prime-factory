# Project Memory Template

> Referenced by Dark Factory onboard-agent and promote-agent when writing entries to `dark-factory/memory/`.
> This file is the canonical schema definition for the index, all shard files, and the ledger.
> Do not embed output formats in agent markdown — reference this template instead.

---

## Overview

The `dark-factory/memory/` directory contains eleven files that together form the Project Memory layer:

| File | Purpose | Write cadence |
|------|---------|--------------|
| `index.md` | Always-loaded compact index — one heading row per real entry | Updated by promote-agent or onboard-agent each time entries are added |
| `invariants-security.md` | Security domain invariants | Appended by promote-agent at promotion or onboard-agent at onboarding |
| `invariants-architecture.md` | Architecture domain invariants | Appended by promote-agent at promotion or onboard-agent at onboarding |
| `invariants-api.md` | API domain invariants | Appended by promote-agent at promotion or onboard-agent at onboarding |
| `decisions-security.md` | Security domain decisions | Appended by promote-agent at promotion or onboard-agent at onboarding |
| `decisions-architecture.md` | Architecture domain decisions | Appended by promote-agent at promotion or onboard-agent at onboarding |
| `decisions-api.md` | API domain decisions | Appended by promote-agent at promotion or onboard-agent at onboarding |
| `design-intent-security.md` | Security domain design intents | Appended by promote-agent at promotion or onboard-agent at onboarding |
| `design-intent-architecture.md` | Architecture domain design intents | Appended by promote-agent at promotion or onboard-agent at onboarding |
| `design-intent-api.md` | API domain design intents | Appended by promote-agent at promotion or onboard-agent at onboarding |
| `ledger.md` | Append-only record of every promoted feature/bugfix | Appended once per promotion, never edited |

**ID assignment**: permanent zero-padded 4-digit sequential IDs (`INV-0001`, `DEC-0001`, `DI-0001`, `FEAT-0001`) are assigned exclusively by promote-agent at promotion time. IDs are **never reused** — even superseded or deprecated entries keep their ID forever. Until promotion, specs carry placeholder IDs (`INV-TBD-*`, `DEC-TBD-*`, `DI-TBD-*`). DI IDs are assigned from a global sequential counter shared across all three `design-intent-{domain}.md` shard files.

**Single-writer protocol**: only promote-agent writes to these files after the foundation phase. Parallel code-agents running in worktrees must not write to memory files directly.

**Missing files**: if any memory file is absent, agents warn and proceed (non-blocking), treating the file as having zero entries. This matches the existing pattern for a missing `project-profile.md`.

**Token budget (soft limits)**:
- `index.md` SHOULD NOT exceed approximately 4,000 tokens at steady state (~500 entries at ~8 tokens/row).
- Each domain shard SHOULD NOT exceed approximately 8,000 tokens at steady state.
- These are monitoring targets, not hard enforced caps. Exceeding them is a signal to split a shard.

---

## File Schema: index.md (always-loaded compact index)

Agents load only this file for memory context from the context rule. Shard loading is consumer-driven.

### index.md frontmatter

```
---
version: 1
lastUpdated: <ISO date>
generatedBy: onboard-agent | promote-agent | df-cleanup | bootstrap
gitHash: <git SHA at last write>
entryCount: <N>
shardCount: <N>
---
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `version` | integer | yes | Schema version. Currently `1`. |
| `lastUpdated` | ISO date string | yes | Date the file was last written. |
| `generatedBy` | string | yes | Which agent last wrote the file, or `bootstrap` for the foundation skeleton. |
| `gitHash` | string | yes | Git commit SHA at the time of the last write, or `TBD` for bootstrap. |
| `entryCount` | integer | yes | Number of `## ` heading rows in the body. MUST equal the actual row count. |
| `shardCount` | integer | yes | Number of distinct shard filenames referenced by entries in the body. |

### index.md entry row format

Each real entry is represented as a single heading row:

```
## {ID} [type:{type}] [domain:{domain}] [tags:{csv}] [status:{status}] [shard:{filename}]
{one-line summary of the entry}
```

| Component | Values | Notes |
|-----------|--------|-------|
| `{ID}` | `INV-\d{4}`, `DEC-\d{4}`, `DI-\d{4}`, `FEAT-\d{4}` | Permanent ID only. No TEMPLATE or TBD entries. |
| `[type:{type}]` | `invariant`, `decision`, `design-intent`, `feature` | Required. `design-intent` is used for DI-NNNN entries. |
| `[domain:{domain}]` | `security`, `architecture`, `api`, `—` | Use `—` (em-dash) for FEAT entries. |
| `[tags:{csv}]` | comma-separated lowercase keywords | Optional; use `[tags:]` for empty. |
| `[status:{status}]` | `active`, `superseded`, `deprecated`, `—` | Use `—` for FEAT entries. |
| `[shard:{filename}]` | e.g., `invariants-architecture.md` | Required. Points to the shard that holds the full entry. |

**Rules:**
- TEMPLATE entries are NEVER written to the index.
- TBD-placeholder entries (`INV-TBD-*`) from spec authoring are NOT written to the index.
- `entryCount` in frontmatter MUST equal the number of `## ` heading rows in the body.
- `shardCount` in frontmatter MUST equal the number of distinct shard filenames referenced.

### Complete example index entries

```
## INV-0001 [type:invariant] [domain:architecture] [tags:spec,compliance] [status:active] [shard:invariants-architecture.md]
Every spec must declare the invariants it touches

## DEC-0001 [type:decision] [domain:architecture] [tags:schema,single-writer] [status:active] [shard:decisions-architecture.md]
Memory files are single-writer, written only by promote-agent at promotion time

## DI-0001 [type:design-intent] [domain:architecture] [tags:information-barrier,pipeline] [status:active] [shard:design-intent-architecture.md]
Code-agent MUST NOT read holdout scenarios — information barrier protects test validity

## FEAT-0001 [type:feature] [domain:—] [tags:] [status:—] [shard:ledger.md]
project-memory-foundation
```

---

## File Schema: invariant shard files

### Shard frontmatter (invariants-security.md, invariants-architecture.md, invariants-api.md)

```
---
version: 1
lastUpdated: <ISO date>
generatedBy: onboard-agent | promote-agent | bootstrap
gitHash: <git SHA at last write>
---
```

Same four base fields as all memory files. Shard files do NOT include `entryCount` or `shardCount`.

### Invariant entry format

```
## INV-NNNN: <title>

- **id**: INV-NNNN
- **title**: <title>
- **rule**: <markdown — the invariant stated as a testable rule>
- **scope.modules**: [<list of directory or file paths>]
- **scope.entities**: [<list of domain entity names>]
- **source**: derived-from-code | declared-by-spec | declared-by-developer
- **sourceRef**: <path to file, spec name, or git SHA>
- **status**: active | superseded | deprecated
- **supersededBy**: <INV-ID or "">
- **introducedBy**: <spec name or "baseline">
- **introducedAt**: <ISO date>
- **rationale**: <markdown — why this rule exists>
- **domain**: security | architecture | api
- **tags**: [<up to 5 lowercase keywords>]
- **shard**: invariants-{domain}.md
- **enforced_by**: <path to test file>      # OR use enforcement below
- **enforcement**: runtime | manual          # escape hatch when no test exists
- **guards**: [<file:line>, ...]
- **referencedBy**: [<list of spec names>]
```

**Enforcement requirement**: every invariant entry MUST carry either an `enforced_by` path OR an explicit `enforcement: runtime|manual` field. `manual` is a legitimate escape hatch for rules that cannot be automatically verified (e.g., human-review requirements). An invariant with neither field is considered malformed.

### Invariant entry field definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Format `INV-NNNN`. Assigned by promote-agent. |
| `title` | string | yes | Short, noun-phrase title matching the heading. |
| `rule` | markdown string | yes | The invariant stated as a testable, falsifiable rule. |
| `scope.modules` | list of strings | yes | Directory or file paths. Use `[]` if global. |
| `scope.entities` | list of strings | yes | Domain entity names. Use `[]` if structural. |
| `source` | enum | yes | One of: `derived-from-code`, `declared-by-spec`, `declared-by-developer`. |
| `sourceRef` | string | yes | Path, spec name, or commit SHA. |
| `status` | enum | yes | One of: `active`, `superseded`, `deprecated`. |
| `supersededBy` | string | yes | INV-ID of superseding entry, or `""`. |
| `introducedBy` | string | yes | Spec name or `"baseline"`. |
| `introducedAt` | ISO date | yes | When this invariant was first recorded. |
| `rationale` | markdown string | yes | Why this rule exists. |
| `domain` | enum | yes | One of: `security`, `architecture`, `api`. Must match the shard file the entry is stored in. |
| `tags` | list of strings | no | Up to 5 lowercase keywords for grep-based filtering. |
| `shard` | string | yes | The shard filename (e.g., `invariants-architecture.md`). Computed by writers. |
| `enforced_by` | string | conditional | Path to test file. Required unless `enforcement` is set. |
| `enforcement` | enum | conditional | One of: `runtime`, `manual`. Required unless `enforced_by` is set. |
| `guards` | list of strings | no | List of `file:line` references where the rule is checked. |
| `referencedBy` | list of strings | no | Spec names that declare or touch this invariant. |

### Complete example invariant entry

```
## INV-0001: Every spec must declare the invariants it touches

- **id**: INV-0001
- **title**: Every spec must declare the invariants it touches
- **rule**: Every feature spec that introduces or relies on a structural invariant must list it in the spec's `## Invariants` section using the `INV-TBD-*` placeholder format. This ensures promote-agent can assign permanent IDs and add the invariant to this registry at promotion time.
- **scope.modules**: [dark-factory/specs/features/, dark-factory/specs/bugfixes/]
- **scope.entities**: [spec file, invariants registry]
- **source**: declared-by-developer
- **sourceRef**: project-memory-foundation.spec.md
- **status**: active
- **supersededBy**: ""
- **introducedBy**: baseline
- **introducedAt**: 2026-04-24
- **rationale**: Without explicit invariant declarations in specs, the memory registry grows stale — new features can silently break rules that no reviewer remembers declaring.
- **domain**: architecture
- **tags**: [spec, compliance, memory]
- **shard**: invariants-architecture.md
- **enforced_by**: tests/dark-factory-setup.test.js
- **guards**: [dark-factory/memory/invariants-architecture.md:1]
- **referencedBy**: [project-memory-foundation, project-memory-consumers, project-memory-lifecycle]
```

---

## File Schema: decision shard files

### Shard frontmatter (decisions-security.md, decisions-architecture.md, decisions-api.md)

Same four base fields as all memory files. Shard files do NOT include `entryCount` or `shardCount`.

### Decision entry format

```
## DEC-NNNN: <title>

- **id**: DEC-NNNN
- **title**: <title>
- **context**: <markdown — the situation or tension that prompted this decision>
- **decision**: <markdown — what was decided>
- **rationale**: <markdown — why this option was chosen>
- **alternatives**: [{option: <string>, reason_rejected: <string>}, ...]
- **status**: active | superseded
- **supersededBy**: <DEC-ID or "">
- **introducedBy**: <spec name>
- **introducedAt**: <ISO date>
- **domain**: security | architecture | api
- **tags**: [<up to 5 lowercase keywords>]
- **shard**: decisions-{domain}.md
- **referencedBy**: [<spec names>]
```

### Decision entry field definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Format `DEC-NNNN`. Assigned by promote-agent. |
| `title` | string | yes | Short, noun-phrase title matching the heading. |
| `context` | markdown string | yes | The situation, tension, or constraint that prompted the decision. |
| `decision` | markdown string | yes | The decision made, stated clearly. |
| `rationale` | markdown string | yes | Why this option was chosen over alternatives. |
| `alternatives` | list of objects | yes | Each: `{option: string, reason_rejected: string}`. Use `[]` if none. |
| `status` | enum | yes | One of: `active`, `superseded`. |
| `supersededBy` | string | yes | DEC-ID of superseding decision, or `""`. |
| `introducedBy` | string | yes | Spec name. |
| `introducedAt` | ISO date | yes | When this decision was first recorded. |
| `domain` | enum | yes | One of: `security`, `architecture`, `api`. Must match the shard. |
| `tags` | list of strings | no | Up to 5 lowercase keywords. |
| `shard` | string | yes | The shard filename (e.g., `decisions-architecture.md`). Computed by writers. |
| `referencedBy` | list of strings | no | Spec names that cite or build on this decision. |

### Complete example decision entry

```
## DEC-0001: Memory files are single-writer, written only by promote-agent at promotion time

- **id**: DEC-0001
- **title**: Memory files are single-writer, written only by promote-agent at promotion time
- **context**: Multiple agents running in parallel worktrees could write to the same memory files simultaneously, causing merge conflicts and inconsistent state. The memory registry must remain coherent across all concurrent feature implementations.
- **decision**: promote-agent is the sole writer to `dark-factory/memory/` after the foundation phase. Specs carry `INV-TBD-*` and `DEC-TBD-*` placeholder IDs. At promotion time, promote-agent assigns zero-padded sequential permanent IDs and appends entries. IDs are never reused.
- **rationale**: Centralizing writes in promote-agent eliminates worktree merge conflicts and guarantees monotonically increasing IDs. The promote phase runs on the main branch, so file contention cannot occur.
- **alternatives**: [{option: "any agent may write", reason_rejected: "parallel worktrees cause merge conflicts and ID collisions"}, {option: "onboard-agent owns entries permanently", reason_rejected: "onboard-agent writes the initial extraction but promotion is the ongoing write path"}]
- **status**: active
- **supersededBy**: ""
- **introducedBy**: project-memory-foundation
- **introducedAt**: 2026-04-24
- **domain**: architecture
- **tags**: [schema, single-writer, worktree]
- **shard**: decisions-architecture.md
- **referencedBy**: [project-memory-foundation, project-memory-lifecycle]
```

---

## File Schema: design-intent shard files

### Shard frontmatter (design-intent-security.md, design-intent-architecture.md, design-intent-api.md)

Same four base fields as all memory files. Shard files do NOT include `entryCount` or `shardCount`.

### Design intent entry format

```
## DI-NNNN: <title>

- **id**: DI-NNNN
- **title**: <short descriptive title>
- **intent**: <the survival criterion — what pattern must survive and why it is fragile>
- **drift_risk**: <what aspect is most vulnerable to silent erosion by future AI edits>
- **protection**: <how it is protected: naming convention | test | invariant entry | architectural encapsulation>
- **scope.modules**: [<list of file paths or module names>]
- **domain**: security | architecture | api
- **status**: active | superseded | deprecated
- **supersededBy**: <DI-ID or "">
- **introducedBy**: <spec name>
- **introducedAt**: <ISO date>
- **rationale**: <why this design intent must be recorded>
- **shard**: design-intent-{domain}.md
- **enforced_by**: <path to test file>   # OR use enforcement below
- **enforcement**: runtime | manual      # escape hatch when no test exists
- **tags**: [<up to 5 lowercase keywords>]
- **guards**: [<file:line>, ...]
- **referencedBy**: [<list of spec names>]
```

**Enforcement requirement**: every DI entry MUST carry either an `enforced_by` path OR an explicit `enforcement: runtime|manual` field. Same policy as invariant entries.

**`guards` field and information barrier**: The `guards` field in a DI entry MUST NOT be used by code-agent to infer test coverage or holdout scenario content. DI entries are for authoring-time and review-time use only — not implementation-time constraint enforcement.

### Design intent entry field definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Format `DI-NNNN`. Assigned by promote-agent from a global sequential counter. |
| `title` | string | yes | Short, noun-phrase title matching the heading. |
| `intent` | markdown string | yes | The survival criterion — what pattern must survive and why it is fragile. |
| `drift_risk` | markdown string | yes | What aspect is most vulnerable to silent erosion by future AI edits. |
| `protection` | markdown string | yes | How it is protected: naming convention, test, invariant entry, or architectural encapsulation. |
| `scope.modules` | list of strings | yes | File paths or module names. Use `[]` if global. |
| `domain` | enum | yes | One of: `security`, `architecture`, `api`. Must match the shard file. |
| `status` | enum | yes | One of: `active`, `superseded`, `deprecated`. |
| `supersededBy` | string | yes | DI-ID of superseding entry, or `""`. |
| `introducedBy` | string | yes | Spec name. |
| `introducedAt` | ISO date | yes | When this design intent was first recorded. |
| `rationale` | markdown string | yes | Why this design intent must be recorded. |
| `shard` | string | yes | The shard filename (e.g., `design-intent-architecture.md`). Computed by writers. |
| `enforced_by` | string | conditional | Path to test file. Required unless `enforcement` is set. |
| `enforcement` | enum | conditional | One of: `runtime`, `manual`. Required unless `enforced_by` is set. |
| `tags` | list of strings | no | Up to 5 lowercase keywords. |
| `guards` | list of strings | no | List of `file:line` references. opaque to code-agent (information barrier) — same policy as INV entry guards. |
| `referencedBy` | list of strings | no | Spec names that reference this design intent. |

### Complete example design intent entry

```
## DI-0001: Code-agent information barrier — holdout scenarios must never be read by code-agent

- **id**: DI-0001
- **title**: Code-agent information barrier — holdout scenarios must never be read by code-agent
- **intent**: The Dark Factory pipeline derives validation power from the code-agent never seeing holdout scenarios. If this barrier is eroded — by any agent, orchestrator change, or tool expansion — the holdout tests stop providing independent validation. The intent is that code-agent implements only from the spec and public scenarios, never from the test oracle.
- **drift_risk**: Future expansions of code-agent tools or orchestrator context passing could silently include holdout paths. The barrier is only as strong as the tool access list and the orchestrator's context-passing discipline.
- **protection**: The `NEVER read dark-factory/scenarios/holdout/` rule is stated explicitly in code-agent's constraint block. INV-NNNN enforces this via test assertion on the agent's constraint language. The implementation-agent's spawn protocol never passes holdout paths to code-agent.
- **scope.modules**: [.claude/agents/code-agent.md, .claude/agents/implementation-agent.md, dark-factory/scenarios/holdout/]
- **domain**: architecture
- **status**: active
- **supersededBy**: ""
- **introducedBy**: ao-design-intent
- **introducedAt**: 2026-04-29
- **rationale**: Without this recorded intent, future changes to the orchestration pipeline might relax the information barrier under the assumption that "code-agent just needs more context." This design intent makes explicit that the barrier is deliberate and load-bearing — not an oversight.
- **shard**: design-intent-architecture.md
- **enforced_by**: tests/dark-factory-setup.test.js
- **tags**: [information-barrier, code-agent, holdout, pipeline]
- **guards**: [.claude/agents/code-agent.md:1]
- **referencedBy**: [ao-design-intent]
```

---

## File Schema: ledger.md (append-only)

The ledger is **append-only**. Entries written by promote-agent are never edited. Frontmatter (`lastUpdated`, `gitHash`) is updated each time a new entry is appended.

### Ledger frontmatter

Same four base fields as all memory files. `ledger.md` does NOT include `entryCount` or `shardCount`.

### Ledger entry format

```
## FEAT-NNNN: <spec-name>

- **id**: FEAT-NNNN
- **name**: <spec name>
- **summary**: <markdown — what this feature/bugfix shipped>
- **promotedAt**: <ISO datetime>
- **introducedInvariants**: [INV-NNNN, ...]
- **introducedDecisions**: [DEC-NNNN, ...]
- **introducedDesignIntents**: [DI-NNNN, ...]
- **promotedTests**: [<test file path>, ...]
- **gitSha**: <cleanup commit SHA>
```

### Ledger entry field definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Format `FEAT-NNNN`. Assigned by promote-agent. |
| `name` | string | yes | The spec name (e.g., `project-memory-foundation`). |
| `summary` | markdown string | yes | One-to-three sentences describing what was shipped. |
| `promotedAt` | ISO datetime | yes | When promote-agent ran for this feature. |
| `introducedInvariants` | list of strings | yes | INV-IDs of invariants first declared by this feature. Use `[]` if none. |
| `introducedDecisions` | list of strings | yes | DEC-IDs of decisions first recorded by this feature. Use `[]` if none. |
| `introducedDesignIntents` | list of strings | yes | DI-IDs of design intents first declared by this feature. Use `[]` if none. Omit field entirely for promotions before this field was introduced — treated as `[]`. |
| `promotedTests` | list of strings | yes | Paths to test files promoted to the permanent suite. Use `[]` if none. |
| `gitSha` | string | yes | SHA of the cleanup commit that archived this feature's artifacts. |

### Complete example ledger entry

```
## FEAT-0001: project-memory-foundation

- **id**: FEAT-0001
- **name**: project-memory-foundation
- **summary**: Structural foundation for Project Memory — creates `dark-factory/memory/` with index + 6 domain shards + ledger, adds `project-memory-template.md`, updates `.claude/rules/dark-factory-context.md` to load the memory index, and adds structural and mirror parity tests. No agent behavior changes.
- **promotedAt**: 2026-04-24T12:00:00Z
- **introducedInvariants**: [INV-0001]
- **introducedDecisions**: [DEC-0001, DEC-0002, DEC-0003, DEC-0004, DEC-0005, DEC-0006]
- **introducedDesignIntents**: []
- **promotedTests**: [tests/dark-factory-setup.test.js]
- **gitSha**: abc1234def5678
```
