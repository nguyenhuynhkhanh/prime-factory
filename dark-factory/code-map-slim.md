> Slim map — generated from code-map.md. For full context read code-map.md.
> Git hash: b0155e986281da115af776292070f46dcff0c355

## Shared Dependency Hotspots

| Module | Fan-in | Imported by |
|--------|--------|-------------|
| `dark-factory/project-profile.md` | 10 | architect-agent, code-agent, codemap-agent, debug-agent, implementation-agent, onboard-agent, promote-agent, spec-agent, test-agent, df-orchestrate |
| `dark-factory/code-map.md` | 9 | architect-agent, code-agent, debug-agent, promote-agent, spec-agent, test-agent, df-intake, df-debug, df-orchestrate |
| `dark-factory/manifest.json` | 6 | df-intake, df-debug, df-orchestrate, df-cleanup, implementation-agent, dark-factory-context rule |
| `dark-factory/memory/index.md` | 5 | dark-factory-context rule (loads), spec-agent (index-first), debug-agent (index-first), onboard-agent (writes), promote-agent (updates) |
| `dark-factory/memory/design-intent-{domain}.md` | 5 | architect-agent (Intent & Drift Check per domain), spec-agent (Phase 2a DI shard load), onboard-agent (Phase 3.7d writes), promote-agent (DI write-through), dark-factory-context rule (on-demand load) |
| `spec-agent.md` | 5 | df-intake, architect-agent, implementation-agent (blockers + flaky-E2E bugfix), contracts test, setup test |
| `dark-factory/memory/intent-adr-{spec_id}.md` | 4 | architect-agent (writes Gate 1; reads Gate 2 + Gate 3), qa-agent (reads Phase 1), implementation-agent (passes path to both) |
| `codemap-agent.md` | 4 | df-intake, df-debug, df-orchestrate, onboard-agent |
| `debug-agent.md` | 4 | df-debug, architect-agent, implementation-agent, contracts test |
| `promote-agent.md` | 4 | implementation-agent, df-cleanup, contracts test, setup test |
| `qa-agent.md` | 4 | df-intake (Step 5 QA_SCENARIO), implementation-agent (spawns after Gate 1), contracts test, setup test |
| `architect-agent.md` | 3 | implementation-agent (spawns tier-aware), contracts test, setup test |
| `dark-factory/promoted-tests.json` | 3 | promote-agent (writes), df-cleanup (reads for health check), setup test (validates structure) |
| `dark-factory/project-profile-slim.md` | 3 | architect-agent (Tier 1/2 reviews), onboard-agent (writes), df-cleanup (regenerates) |
| `dark-factory/code-map-slim.md` | 3 | architect-agent (Tier 1/2 reviews), codemap-agent (writes), df-cleanup (regenerates) |
| `templates/project-profile-slim-template.md` | 3 | onboard-agent (Phase 7.2), df-cleanup (Step 1.5), setup test (validates structure) |
| `templates/project-memory-template.md` | 3 | onboard-agent (Phase 3.7 schema), promote-agent (schema), contracts test (mirror parity + schema completeness) |
| `dark-factory/memory/` (INV/DEC domain shards) | 3 | onboard-agent (bootstrap writes), promote-agent (ongoing writes), spec-agent + debug-agent (selective reads) |
| `src/agents/shared/*.md` | 3 | build-agents.js (reads + resolves), src/*.src.md (includes), setup test (sync check) |
| `dark-factory/memory/intent-foundation.md` | 3 | spec-agent (Phase 2a), qa-agent (Phase 1), architect-agent (Gate 1 memory probe) |

**High fan-out**: `implementation-agent.md` (spawns 7 different agent types including qa-agent; conditionally spawns 2 code-agent tracks for Best-of-N).
**New high fan-in (b0155e9)**: `dark-factory/memory/intent-adr-{spec_id}.md` — new per-spec artifact class with 4 readers/writers; `qa-agent.md` — new agent read by 4 callers.

## Module Dependency Graph

### bin/
- `bin/cli.js` -> [plugins/dark-factory/]
- `bin/build-agents.js` -> [src/agents/*.src.md, src/agents/shared/*.md, .claude/agents/, plugins/dark-factory/agents/]

### src/agents/ (build sources)
- `src/agents/*.src.md` (9 files) -> [src/agents/shared/*.md (via include directives)]
- `src/agents/shared/context-loading.md`, `holdout-barrier.md`, `memory-index-load.md`, `model-role-dispatch.md`

### .claude/agents/ (10 agents)
- `architect-agent.md` [judge] -> [project-profile.md OR project-profile-slim.md, code-map.md OR code-map-slim.md, spec-agent.md, debug-agent.md, memory/design-intent-{domain}.md, memory/intent-foundation.md, memory/intent-adr-{spec_id}.md (writes Gate 1; reads Gates 2/3)]
- `code-agent.md` [generator] -> [project-profile.md, code-map.md, specPath (self-load), publicScenariosDir (self-load), architectFindingsPath (self-load), memory/index.md, domain INV shards]
- `codemap-agent.md` [generator] -> [project-profile.md, code-map.md, code-map-slim.md, code-map.mermaid]
- `debug-agent.md` [generator] -> [project-profile.md, code-map.md, memory/index.md, invariants-{domain}.md (selective), templates/debug-report-template.md]
- `implementation-agent.md` [judge] -> [project-profile.md, manifest.json, architect-agent.md, code-agent.md, test-agent.md, promote-agent.md, qa-agent.md, spec-agent.md, debug-agent.md]
- `onboard-agent.md` [generator] -> [project-profile.md, project-profile-slim.md, templates/*, dark-factory/memory/ (11 files), codemap-agent.md, .claude/settings.json, git hooks]
- `promote-agent.md` [judge] -> [project-profile.md, code-map.md, promoted-tests.json, dark-factory/memory/ (appends to INV/DEC/DI shards + index + ledger)]
- `qa-agent.md` [generator] -> [spec (specPath), memory/intent-adr-{spec_id}.md, memory/intent-foundation.md, results/{name}/coverage-map.json (writes), scenarios/public/{name}/ (writes), scenarios/holdout/{name}/ (writes)]
- `spec-agent.md` [generator] -> [project-profile.md, code-map.md, memory/index.md, INV+DEC+DI domain shards + ledger.md (selective), memory/intent-foundation.md, templates/spec-template.md]
- `test-agent.md` [judge] -> [project-profile.md, code-map.md, holdout scenarios, playwright.config.*, dark-factory/results/]

### .claude/skills/
- `df/SKILL.md` -> [df-intake/SKILL.md, df-debug/SKILL.md]
- `df-intake/SKILL.md` -> [code-map.md, codemap-agent.md, spec-agent.md, qa-agent.md, manifest.json]
- `df-debug/SKILL.md` -> [code-map.md, codemap-agent.md, debug-agent.md, manifest.json]
- `df-orchestrate/SKILL.md` -> [code-map.md, codemap-agent.md, manifest.json, project-profile.md, implementation-agent.md]
- `df-onboard/SKILL.md` -> [onboard-agent.md]
- `df-cleanup/SKILL.md` -> [project-profile-slim.md, code-map-slim.md, templates/project-profile-slim-template.md, manifest.json, promoted-tests.json, promote-agent.md]
- `df-spec/SKILL.md` -> []
- `df-scenario/SKILL.md` -> []

### .claude/rules/
- `dark-factory.md` -> []
- `dark-factory-context.md` -> [project-profile.md, code-map.md, manifest.json, memory/index.md, memory/design-intent-{domain}.md (on demand)]

### tests/
- `dark-factory-setup.test.js` -> [.claude/agents/*.md (all 10 incl. qa-agent), .claude/skills/*/SKILL.md (all 8), dark-factory/ (structure + templates + memory), CLAUDE.md]
- `dark-factory-contracts.test.js` -> [.claude/agents/*.md (all 10), .claude/skills/*/SKILL.md (all 8), plugins/dark-factory/, .claude/rules/dark-factory.md]

### scripts/
- `scripts/deploy.sh` -> []

### plugins/dark-factory/
Mirror of `.claude/agents/`, `.claude/skills/`, `.claude/rules/`, `dark-factory/templates/`. All 10 agents carry model-role frontmatter. Built from `src/agents/*.src.md` by `bin/build-agents.js`; qa-agent.md mirrored directly.

### dark-factory/ (key runtime artifacts)
- `manifest.json` — read/written by skills + implementation-agent
- `project-profile.md`, `project-profile-slim.md` — written by onboard-agent; read by all agents
- `promoted-tests.json` — written by promote-agent
- `memory/intent-foundation.md` — Layer 0 intent; max 20 active decisions
- `memory/intent-adr-{spec_id}.md` — Layer 2 per-spec ADRs; written by architect (Gate 1); read by qa-agent + architect (Gates 2/3)
- `memory/index.md`, `memory/invariants-*.md`, `memory/decisions-*.md`, `memory/design-intent-*.md`, `memory/ledger.md` — 11 memory files; written by onboard-agent + promote-agent
- `results/{name}/coverage-map.json` — written by qa-agent; read by architect (Gate 2)
