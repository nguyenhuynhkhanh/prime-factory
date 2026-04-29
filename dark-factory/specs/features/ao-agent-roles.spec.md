# Feature: ao-agent-roles

## Context

The Dark Factory pipeline spawns agents at different points in the lifecycle. Some agents — like code-agent and spec-agent — are primarily **generators**: they produce artifacts (specs, code, analysis) and benefit from high-accuracy, broad-knowledge models. Others — like architect-agent and test-agent — are primarily **judges**: they evaluate artifacts for correctness and benefit from calibrated uncertainty, knowing when to flag "I'm not sure" rather than guessing.

Without explicit role declarations, the `ao-pipeline-mode` feature has no principled way to assign models at spawn time. It would either apply a single model to all agents (sacrificing quality) or require a hard-coded lookup table in implementation-agent (coupling concerns and making it hard to update).

This spec adds a `model-role` field to the YAML frontmatter of all 9 agent files. The field is a documentation-level annotation that also serves as a machine-readable hint for the `ao-pipeline-mode` feature. The `implementation-agent` reads this field at spawn time to select the appropriate model — `generator` agents use the high-accuracy model (Opus in quality mode), `judge` agents always use the calibrated model (Sonnet).

The annotation is purely additive: Claude Code ignores unknown frontmatter fields, so existing installations are fully backward compatible. The `npx dark-factory update` command will distribute the updated agent files to target projects as expected.

## Design Intent

The `model-role` annotation encodes a fundamental distinction in the agent lifecycle:

- **Generators** produce artifacts from context. Their failure mode is low-recall (missing edge cases, shallow reasoning). High-accuracy models reduce that failure mode.
- **Judges** evaluate artifacts against criteria. Their failure mode is false confidence — approving a flawed plan or passing a broken test. Calibrated models reduce that failure mode by expressing uncertainty more accurately.

The field is a **hint**, not an enforcement. `implementation-agent` is free to override it based on mode, budget, or other factors. The spec for `ao-pipeline-mode` defines the actual routing logic; this spec only defines the annotations.

Role assignment rationale (all 9 agents):

| Agent | Role | Rationale |
|-------|------|-----------|
| spec-agent | generator | Produces specs from raw input — needs broad knowledge and high accuracy to cover all edge cases |
| code-agent | generator | Implements code from spec — needs high accuracy; errors become bugs |
| debug-agent | generator | Investigates bugs via forensic reasoning — needs deep recall, not caution |
| onboard-agent | generator | Extracts and synthesizes codebase knowledge — needs comprehensive recall |
| codemap-agent | generator | Maps module dependencies and call chains — needs comprehensive coverage |
| architect-agent | judge | Reviews plans for production-readiness — needs calibrated uncertainty to know when to flag "I don't know" |
| test-agent | judge | Validates implementations against scenarios — deterministic pass/fail assessment |
| promote-agent | judge | Assigns permanent memory IDs and adapts tests — needs caution over speed; errors are hard to reverse |
| implementation-agent | judge | Orchestrates the pipeline — coordinates and routes, does not generate artifacts |

## Scope

### In Scope (this spec)
- Add `model-role: generator` or `model-role: judge` to the YAML frontmatter of all 9 agent files under `.claude/agents/`
- Add the same field to all 9 mirrored agent files under `plugins/dark-factory/agents/`
- Add test assertions to `tests/dark-factory-setup.test.js` verifying: field presence on all 9 agents, valid value (only `generator` or `judge`), and correct per-agent assignment
- Add test assertions to `tests/dark-factory-contracts.test.js` verifying: plugin mirror parity for all 9 agent files includes the `model-role` field

### Out of Scope (explicitly deferred)
- The spawn-time routing logic that reads `model-role` — that is `ao-pipeline-mode`'s responsibility
- Enforcing `model-role` at runtime (Claude Code ignores unknown frontmatter fields; enforcement is via tests only)
- Adding `model-role` to skill files (`SKILL.md`) — skills are not directly spawnable as agents with model overrides
- Expanding the valid values beyond `generator` and `judge` — any future third value is a separate spec change
- Any UI, documentation page, or help text changes — the field is self-documenting via the spec

### Scaling Path
If the project adds new agent types, each new agent file must include a `model-role` field. The test assertions in `dark-factory-setup.test.js` that validate per-agent values serve as a checklist — adding a new agent without a `model-role` will fail the test suite. No architectural changes are needed.

## Requirements

### Functional
- FR-1: All 9 `.claude/agents/*.md` files must have a `model-role` field in YAML frontmatter — establishes the machine-readable annotation that `ao-pipeline-mode` reads at spawn time
- FR-2: The `model-role` field must have exactly one of two values: `generator` or `judge` — any other value is invalid and must be caught by tests
- FR-3: Each agent must carry the specific role defined in the role assignment table above — the assignment is a design decision, not a free choice per implementation
- FR-4: All 9 `plugins/dark-factory/agents/*.md` files must have identical content to their `.claude/agents/` counterparts, including `model-role` — maintains the plugin mirror parity contract that `dark-factory-contracts.test.js` already enforces
- FR-5: `tests/dark-factory-setup.test.js` must include assertions covering: (a) all 9 agents have a `model-role` field, (b) the value is one of the two valid values, (c) each specific agent has the correct assigned role
- FR-6: `tests/dark-factory-contracts.test.js` must include assertions verifying that plugin mirrors for all 9 agents include the `model-role` field and match the source

### Non-Functional
- NFR-1: The change must be purely additive — no existing frontmatter fields are modified, removed, or renamed. Claude Code silently ignores unknown frontmatter fields, so backward compatibility is guaranteed
- NFR-2: `model-role` must appear as the last field in the frontmatter block, after `tools` (and after any comment-style fields like `# Token cap:`) — preserves readability and avoids diff noise in fields that are currently last
- NFR-3: The test assertions must use the existing `parseFrontmatter()` helper already defined in `dark-factory-setup.test.js` — no new parsing logic or dependencies required

## Data Model

No database schema, collections, or external data stores are involved. The only "data" is the YAML frontmatter field added to agent `.md` files.

YAML frontmatter addition (all 9 agents):
```yaml
---
name: {agent-name}
description: "..."
tools: ...
model-role: generator   # or: judge
---
```

The field is a plain string, not quoted, following the existing style in these files (none of the existing fields use quoting for single-word values).

## Migration & Deployment

N/A — no existing data affected.

This change adds a new frontmatter field to text files. There is no database, cache, config store, or API contract involved. Claude Code ignores unknown frontmatter fields, so existing installations that have not yet received the updated files will continue to function exactly as before. The `npx dark-factory update` command propagates the updated agent files to target projects — this is the expected and documented update path.

## API Endpoints

N/A — this feature does not add, modify, or remove any API endpoints.

## Business Rules

- BR-1: Every agent file must have exactly one `model-role` value — the absence of the field or presence of an empty value is treated as a validation failure in tests
- BR-2: The only valid values are `generator` and `judge` — no plurals, no capitalization variants, no aliases
- BR-3: Plugin mirrors must be identical to source — the `model-role` field must be included in the mirror exactly as it appears in the source; the contracts test enforces this at the file-content level
- BR-4: Role assignments are fixed per agent as specified in the role assignment table — the test assertions check for the exact expected value per agent, so any deviation is a test failure

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Agent file missing `model-role` field | `dark-factory-setup.test.js` assertion fails with clear message identifying the agent | Test run fails; implementation is blocked by CI |
| `model-role` has an invalid value (not `generator` or `judge`) | `dark-factory-setup.test.js` assertion fails identifying the agent and the bad value | Test run fails |
| Agent has wrong role assignment (e.g., `architect-agent` marked `generator`) | Per-agent assertion in `dark-factory-setup.test.js` fails identifying the expected vs actual value | Test run fails |
| Plugin mirror does not include `model-role` or differs from source | `dark-factory-contracts.test.js` mirror parity assertion fails | Test run fails |

## Acceptance Criteria

- [ ] AC-1: All 9 `.claude/agents/*.md` files have `model-role` in YAML frontmatter with value `generator` or `judge`
- [ ] AC-2: All 9 `plugins/dark-factory/agents/*.md` files are exact content matches to their `.claude/agents/` counterparts
- [ ] AC-3: `spec-agent`, `code-agent`, `debug-agent`, `onboard-agent`, `codemap-agent` all have `model-role: generator`
- [ ] AC-4: `architect-agent`, `test-agent`, `promote-agent`, `implementation-agent` all have `model-role: judge`
- [ ] AC-5: `tests/dark-factory-setup.test.js` has a new describe block asserting: all 9 agents have the field, the value is valid, and each specific agent has the correct role
- [ ] AC-6: `tests/dark-factory-contracts.test.js` has a new describe block asserting plugin mirror parity for all 9 agents specifically including the `model-role` field
- [ ] AC-7: The full test suite passes — no existing tests are broken by this change
- [ ] AC-8: `model-role` is the last field in the frontmatter block (after `tools`, after any comment fields) in all 9 agent files

## Edge Cases

- EC-1: An agent that already has a `model-role` field from an earlier manual edit — the correct behavior is to set the value to the specification-defined role, not preserve whatever value was there before
- EC-2: The `parseFrontmatter()` helper in `dark-factory-setup.test.js` strips surrounding quotes from values — the `model-role` value must not be quoted in the source file, or the parser will strip them and the assertion will still pass. Both `model-role: generator` and `model-role: "generator"` parse to `generator` with the existing parser; the spec mandates unquoted to match the existing style
- EC-3: `implementation-agent.md` has a `# Token cap:` comment line inside its frontmatter block — `model-role` must appear after this comment line, not before it, to preserve existing frontmatter structure and avoid confusing the parser (the comment line is not a valid YAML field and is already present)
- EC-4: The contracts test mirror parity check uses byte-exact string comparison (`assert.equal(source, plugin)`) — even a trailing newline difference will fail the test. The plugin mirror must be written as an exact copy of the source file

## Dependencies

- **Depends on**: `ao-org-context` (onboard-agent must be settled first — if `ao-org-context` modifies onboard-agent's frontmatter, `ao-agent-roles` adds on top of the final version); `ao-pipeline-mode` (implementation-agent must be settled first — if `ao-pipeline-mode` modifies implementation-agent's frontmatter or body, `ao-agent-roles` adds on top of the final version)
- **Depended on by**: `ao-pipeline-mode` consumes the `model-role` field at spawn time. This spec can be implemented and tested independently, but the runtime behavior of `model-role` only activates once `ao-pipeline-mode` is implemented
- **Group**: `ao-pipeline-improvements`

## Implementation Size Estimate

- **Scope size**: medium (3–5 files touched: 9 agent files in `.claude/agents/`, 9 agent files in `plugins/dark-factory/agents/`, 2 test files — but the change per file is 1 line of frontmatter)
- **Suggested parallel tracks**: 2 tracks with zero file overlap:
  - Track A: Add `model-role` to all 9 `.claude/agents/*.md` files + all 9 `plugins/dark-factory/agents/*.md` files
  - Track B: Add test assertions to `tests/dark-factory-setup.test.js` and `tests/dark-factory-contracts.test.js`
  - Track A must complete before Track B can be verified (tests read the agent files), but both can be written in parallel

## Architect Review Tier

- **Tier**: 1
- **Reason**: Purely additive change — adds 1 new frontmatter field to 18 files and 2 test assertion blocks. No logic changes, no migrations, no security/auth domain, no cross-cutting behavioral changes. The `model-role` field is a documentation hint; it does not alter any agent's behavior.
- **Agents**: 1 combined
- **Rounds**: 1

## Implementation Notes

- Use the existing `parseFrontmatter()` helper in `dark-factory-setup.test.js` for all new test assertions — it is already present and handles quote-stripping
- The mirror parity test pattern for contracts is already established in the `project-memory-consumers` describe block (lines 703–763 of `dark-factory-contracts.test.js`) — follow the same `assert.equal(source, plugin, "...")` pattern
- `model-role` should be inserted as the **last line** in the frontmatter block for each agent file. For `implementation-agent.md`, this means after the `# Token cap:` comment line
- All 9 agents already exist in both locations; this is strictly an addition, not a new file creation
- The new test describe block in `dark-factory-setup.test.js` should be a promoted-test section with the section marker `ao-agent-roles` for the promote-agent to identify

## Invariants

### Preserves
- The existing plugin mirror parity invariant: all `.claude/agents/*.md` files must have exact content matches in `plugins/dark-factory/agents/`. This spec extends that invariant to include the `model-role` field.

### References
*None — no existing registered invariants in scope.*

### Introduces
- **INV-TBD-a**
  - **title**: agent model-role field validity
  - **rule**: Every `.claude/agents/*.md` file must have a `model-role` field in YAML frontmatter with value exactly `generator` or `judge`. No other values are valid.
  - **scope.modules**: `.claude/agents/*.md`, `plugins/dark-factory/agents/*.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-setup.test.js` (ao-agent-roles section)
  - **rationale**: The `ao-pipeline-mode` feature reads this field at spawn time; an absent or invalid value would cause silent fallback to a default model, defeating the purpose of the annotation

- **INV-TBD-b**
  - **title**: agent model-role plugin parity
  - **rule**: For every agent file in `.claude/agents/`, the corresponding file in `plugins/dark-factory/agents/` must be byte-exact, including the `model-role` field.
  - **scope.modules**: `.claude/agents/*.md`, `plugins/dark-factory/agents/*.md`
  - **domain**: architecture
  - **enforced_by**: `tests/dark-factory-contracts.test.js` (ao-agent-roles section)
  - **rationale**: Plugin mirror divergence would cause `npx dark-factory update` to distribute agent files without `model-role`, silently breaking `ao-pipeline-mode` in installed projects

### Modifies
*None.*

### Supersedes
*None.*

## Decisions

### References
*None — no existing decisions directly govern frontmatter field conventions.*

### Introduces
- **DEC-TBD-a**
  - **title**: model-role placement as last frontmatter field
  - **decision**: The `model-role` field is always the last field in the YAML frontmatter block, after `tools` (and after any comment lines like `# Token cap:`)
  - **rationale**: Minimizes diff noise by keeping a stable position; placing it last ensures it is easy to find and does not disrupt the existing field order that tools or humans may scan for
  - **alternatives**: Placing it first (before `name`) — rejected because `name` and `description` are the identity fields and should remain first. Placing it between `description` and `tools` — rejected because `tools` is the last functional field and `model-role` is metadata about the agent, not about its capabilities
  - **scope.modules**: `.claude/agents/*.md`, `plugins/dark-factory/agents/*.md`
  - **domain**: architecture
  - **enforcement**: manual (checked by test assertion AC-8)

### Supersedes
*None.*

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01 |
| FR-2 | P-02, H-01 |
| FR-3 | P-03, P-04, H-02 |
| FR-4 | P-05 |
| FR-5 | P-01, P-02, P-03, P-04 |
| FR-6 | P-05 |
| BR-1 | P-01, H-03 |
| BR-2 | H-01 |
| BR-3 | P-05 |
| BR-4 | P-03, P-04 |
| AC-1 | P-01 |
| AC-2 | P-05 |
| AC-3 | P-03 |
| AC-4 | P-04 |
| AC-5 | P-01, P-02, P-03, P-04 |
| AC-6 | P-05 |
| AC-7 | H-04 |
| AC-8 | H-05 |
| EC-1 | H-02 |
| EC-2 | H-06 |
| EC-3 | H-05 |
| EC-4 | P-05 |
