> Slim map — generated from code-map.md. For full context read code-map.md.
> Git hash: 46ea99c4fd591721961b5cbb4b11b1d2bb4ff3a2

## Shared Dependency Hotspots

| Module | Fan-in | Imported by |
|--------|--------|-------------|
| `dark-factory/project-profile.md` | 10 | architect-agent, code-agent, codemap-agent, debug-agent, implementation-agent, onboard-agent, promote-agent, spec-agent, test-agent, df-orchestrate |
| `dark-factory/code-map.md` | 9 | architect-agent, code-agent, debug-agent, promote-agent, spec-agent, test-agent, df-intake, df-debug, df-orchestrate |
| `dark-factory/manifest.json` | 6 | df-intake, df-debug, df-orchestrate, df-cleanup, implementation-agent, dark-factory-context rule |
| `dark-factory/memory/index.md` | 5 | dark-factory-context rule (loads), spec-agent (index-first), debug-agent (index-first), onboard-agent (writes), promote-agent (updates) |
| `codemap-agent.md` | 4 | df-intake, df-debug, df-orchestrate, onboard-agent |
| `spec-agent.md` | 5 | df-intake, architect-agent, implementation-agent (blockers + flaky-E2E bugfix), contracts test, setup test |
| `debug-agent.md` | 4 | df-debug, architect-agent, implementation-agent, contracts test |
| `promote-agent.md` | 4 | implementation-agent, df-cleanup, contracts test, setup test |
| `architect-agent.md` | 3 | implementation-agent (spawns tier-aware), contracts test, setup test |
| `dark-factory/promoted-tests.json` | 3 | promote-agent (writes), df-cleanup (reads for health check), setup test (validates structure) |
| `dark-factory/project-profile-slim.md` | 3 | architect-agent (Tier 1/2 reviews), onboard-agent (writes), df-cleanup (regenerates) |
| `dark-factory/code-map-slim.md` | 3 | architect-agent (Tier 1/2 reviews), codemap-agent (writes), df-cleanup (regenerates) |
| `templates/project-profile-slim-template.md` | 3 | onboard-agent (Phase 7.2), df-cleanup (Step 1.5), setup test (validates structure) |
| `templates/project-memory-template.md` | 3 | onboard-agent (Phase 3.7 schema), promote-agent (schema), contracts test (mirror parity + schema completeness) |
| `dark-factory/memory/` (domain shards) | 3 | onboard-agent (bootstrap writes), promote-agent (ongoing writes), spec-agent + debug-agent (selective reads) |

## Module Dependency Graph

### bin/
- `bin/cli.js` -> [plugins/dark-factory/]

### .claude/agents/
- `architect-agent.md` -> [project-profile.md OR project-profile-slim.md, code-map.md OR code-map-slim.md, spec-agent.md, debug-agent.md]
- `code-agent.md` -> [project-profile.md, code-map.md, spec, public scenarios]
- `codemap-agent.md` -> [project-profile.md, code-map.md, code-map-slim.md, code-map.mermaid]
- `debug-agent.md` -> [project-profile.md, code-map.md, memory/index.md, invariants-{domain}.md (selective), templates/debug-report-template.md]
- `implementation-agent.md` -> [project-profile.md, manifest.json, architect-agent.md, code-agent.md, test-agent.md, promote-agent.md, spec-agent.md, debug-agent.md]
- `onboard-agent.md` -> [project-profile.md, project-profile-slim.md, templates/project-profile-template.md, templates/project-profile-slim-template.md, templates/project-memory-template.md, dark-factory/memory/ (8 files), codemap-agent.md, .claude/settings.json, git hooks, package.json]
- `promote-agent.md` -> [project-profile.md, code-map.md, promoted-tests.json, dark-factory/memory/ (appends to shards + index + ledger)]
- `spec-agent.md` -> [project-profile.md, code-map.md, memory/index.md, invariants-{domain}.md + decisions-{domain}.md (selective) + ledger.md, templates/spec-template.md]
- `test-agent.md` -> [project-profile.md, code-map.md, holdout scenarios, playwright.config.*, dark-factory/results/]

### .claude/skills/
- `df/SKILL.md` -> [df-intake/SKILL.md, df-debug/SKILL.md]
- `df-intake/SKILL.md` -> [code-map.md, codemap-agent.md, spec-agent.md, manifest.json]
- `df-debug/SKILL.md` -> [code-map.md, codemap-agent.md, debug-agent.md, manifest.json]
- `df-orchestrate/SKILL.md` -> [code-map.md, codemap-agent.md, manifest.json, project-profile.md, implementation-agent.md]
- `df-onboard/SKILL.md` -> [onboard-agent.md]
- `df-cleanup/SKILL.md` -> [project-profile-slim.md, code-map-slim.md, templates/project-profile-slim-template.md, manifest.json, promoted-tests.json, promote-agent.md]
- `df-spec/SKILL.md` -> []
- `df-scenario/SKILL.md` -> []

### .claude/rules/
- `dark-factory.md` -> []
- `dark-factory-context.md` -> [project-profile.md, code-map.md, manifest.json, dark-factory/memory/index.md]

### tests/
- `dark-factory-setup.test.js` -> [.claude/agents/*.md (all 9), .claude/skills/*/SKILL.md (all 8), dark-factory/ (structure), templates/project-profile-template.md, templates/project-profile-slim-template.md, templates/project-memory-template.md, promoted-tests.json, dark-factory/memory/ (8 files), CLAUDE.md]
- `dark-factory-contracts.test.js` -> [.claude/agents/*.md (all 9), .claude/skills/*/SKILL.md (all 8), plugins/dark-factory/, .claude/rules/dark-factory.md]

### scripts/
- `scripts/deploy.sh` -> []

### plugins/dark-factory/
Mirror of `.claude/agents/`, `.claude/skills/`, `.claude/rules/`, `dark-factory/templates/` (including project-memory-template.md).
