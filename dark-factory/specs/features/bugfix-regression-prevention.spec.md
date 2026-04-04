# Feature: bugfix-regression-prevention

## Context

The Dark Factory bugfix pipeline currently has a gap between investigation and regression prevention. Investigator C already searches for systemic patterns, but the debug report template has no structured sections to capture those findings. Pattern intelligence is gathered then discarded before it reaches the code-agent and architect. As a result:

1. Fixes address symptoms rather than root causes because the code-agent never receives root-cause-depth analysis.
2. Regression tests are too narrow — they test the exact symptom reproduction but not variant paths that exercise the same root cause.
3. Promoted tests lack context about what they guard, making them opaque to future developers.

The debug report is a shared contract read by 4 consumers (developer, architect, code-agent, orchestrator). The fix is primarily additive: add structured sections to the report template so pattern findings flow through the entire pipeline, and add corresponding requirements to the code-agent, architect-agent, debug-agent scenario writing, and promote-agent.

**Business value**: Bugs stay fixed. Regression tests catch reintroduction through variant paths, not just exact reproductions. Future developers understand why promoted tests exist.

## Scope

### In Scope (this spec)

- Add "Systemic Analysis" section to the debug report template (debug-agent.md) with similar patterns, classification, risk assessment
- Add "Regression Risk Assessment" section to the debug report template with risk level, reintroduction vectors, variant paths, recommended coverage
- Add "Root Cause Depth" explicit distinction (immediate cause vs deeper enabling pattern) to the debug report template
- Make Investigator C's pattern search output more structured and mandatory in the df-debug SKILL.md
- Bound Investigator C's search scope: module-first, expand to codebase-wide only for shared/core code
- Require file:line references in Investigator C output
- Ensure proportional output: simple typo = "No systemic patterns, isolated incident"; complex logic bug = full pattern search
- Carry forward regression risk findings from all 3 investigators as a first-class synthesis dimension in df-debug SKILL.md
- Require code-agent (red phase) to target root cause CLASS, not exact symptom; test names reference root cause
- Require variant test coverage proportional to regression risk (HIGH=multiple variants, LOW=just reproduction with justification), capped at 3-5 variants per bugfix
- Require debug-agent to write variant scenarios exercising the same root cause through different paths (both public AND holdout), with discretion to write zero for trivially isolated bugs with justification, capped at 3-5
- Add explicit regression risk evaluation to architect-agent bugfix review, with power to BLOCK symptom-only fixes (proportional to risk)
- Add structured annotation to promoted tests (root cause pattern, guarded code locations, related bug name)
- Mirror all agent changes to `plugins/dark-factory/agents/`
- Mirror skill changes to `plugins/dark-factory/skills/`
- Update `tests/dark-factory-setup.test.js` for new required sections/phrases

### Out of Scope (explicitly deferred)

- Adding manifest fields for variant tracking — variant counts are not tracked in the manifest
- Changing the pipeline structure (no new agents, no new pipeline stages)
- Touching `scripts/init-dark-factory.js` (being deleted by pipeline-velocity feature)
- Automated systemic pattern detection tooling (Investigator C uses manual codebase search)
- Cross-bugfix pattern aggregation (each bugfix is independent)
- Changes to the feature pipeline (df-intake, spec-agent)
- Changes to test-agent, onboard-agent, df-orchestrate SKILL.md, df-cleanup

### Scaling Path

- If systemic pattern data proves valuable across bugfixes, a cross-bug pattern database could be built from promoted test annotations
- If variant coverage consistently hits the 3-5 cap, the cap could become configurable per-project via project-profile.md
- Investigator C's structured output format could be extracted into a reusable "pattern search protocol" for other agents

## Requirements

### Functional

- FR-1: **Systemic Analysis section in debug report** — The debug report template must include a "Systemic Analysis" section with: (a) Similar Patterns Found (file:line references, description, risk assessment for each), (b) Classification of whether this is an isolated incident or systemic pattern. These are listed for awareness only — the developer decides whether to fix similar patterns as separate features. Rationale: pattern intelligence must survive from investigation through to the code-agent.

- FR-2: **Regression Risk Assessment section in debug report** — The debug report template must include a "Regression Risk Assessment" section with: (a) Risk level (high/medium/low), (b) What future changes could reintroduce this bug (concrete code references, not abstract categories), (c) Variant paths that exercise the same root cause, (d) Recommended regression coverage. Rationale: guides the code-agent and debug-agent on how many variant tests/scenarios to write.

- FR-3: **Root Cause Depth distinction** — The debug report's Root Cause section must explicitly distinguish between the immediate cause (the specific code that fails) and the deeper enabling pattern (the design assumption, missing abstraction, or structural issue that allows this class of bug). The test should target the deeper pattern. Rationale: tests targeting the deeper pattern catch variants, not just reproductions.

- FR-4: **Structured Investigator C output** — Investigator C's prompt in df-debug SKILL.md must require structured output with mandatory sections: (a) Similar Patterns Found (with file:line references for each), (b) Search Scope (which directories/modules were searched and why), (c) Classification (isolated incident / systemic pattern / shared-code risk), (d) Regression Risk Assessment (risk level + reintroduction vectors). Rationale: prevents findings from being vague or discarded.

- FR-5: **Bounded pattern search scope** — Investigator C must search the same module/directory first, then expand to codebase-wide only if the pattern exists in shared/core code. The search scope must be stated in the output. Rationale: prevents unbounded search that returns noise.

- FR-6: **Mandatory file:line references** — Investigator C must provide file:line references for every similar pattern found, not just descriptions. Rationale: concrete references are actionable; descriptions are not.

- FR-7: **Proportional output** — Every bug gets systemic search, but output is proportional to complexity: simple typo or obvious error = "No systemic patterns found. Classification: isolated incident." with brief justification; complex logic bug = full pattern search with file refs and risk assessment. Rationale: prevents overhead on trivial bugs while ensuring thorough analysis of complex ones.

- FR-8: **Regression risk as first-class synthesis dimension** — The df-debug SKILL.md synthesis step (Step 2) must explicitly carry forward regression risk findings from ALL 3 investigators and merge them into the unified summary. Regression risk is a named dimension alongside root cause, evidence, and impact analysis. Rationale: prevents regression intelligence from being lost during synthesis.

- FR-9: **Root-cause-class test targeting** — The code-agent's Red Phase must require the failing test to target the root cause CLASS (the deeper enabling pattern), not the exact symptom. The test name must reference the root cause, not the symptom (e.g., `test_unbounded_query_without_limit` not `test_api_returns_500`). Rationale: tests that target root cause classes catch reintroduction through different paths.

- FR-10: **Variant test coverage proportional to risk** — The code-agent's Red Phase must include variant test coverage proportional to the regression risk level from the debug report: HIGH risk = 3-5 variant tests exercising the root cause through different paths; MEDIUM risk = 1-2 variants; LOW risk = just the reproduction case with explicit written justification for no variants. Maximum 3-5 variant tests per bugfix. Rationale: balances thoroughness with implementation cost.

- FR-11: **Variant scenarios in debug-agent** — The debug-agent must write variant scenarios that exercise the same root cause through different paths. Variants appear in BOTH public scenarios (so the code-agent knows what variants to test) AND holdout scenarios (for validation). The debug-agent has discretion to write zero variants for trivially isolated bugs with explicit written justification. Maximum 3-5 variant scenarios. Rationale: variant scenarios prevent narrow regression tests.

- FR-12: **Architect regression risk evaluation** — The architect-agent's bugfix review must explicitly evaluate: (a) regression risk depth — does the debug report reach the actual root cause or just a symptom? (b) root-cause vs symptom distinction — is the proposed fix targeting the deeper enabling pattern? (c) whether similar patterns in the codebase are flagged. The architect can BLOCK if the fix is clearly symptom-level only, but evaluation is proportional — a simple typo does not need the same scrutiny as a shared utility logic bug. Rationale: prevents symptom-level fixes from reaching implementation.

- FR-13: **Promoted test annotation** — The promote-agent must add structured annotations to promoted tests as comments: (a) root cause pattern (what class of bug this guards against), (b) guarded code locations (file:line references that, if changed, should trigger this test), (c) related bug name (the Dark Factory bugfix name for traceability). Rationale: future developers understand why the test exists and what it protects.

- FR-14: **Plugin mirrors** — All changes to agent files in `.claude/agents/` must be mirrored to `plugins/dark-factory/agents/`. All changes to skill files in `.claude/skills/` must be mirrored to `plugins/dark-factory/skills/`. Rationale: plugin directory is the distribution channel for target projects.

- FR-15: **Test updates** — The test file `tests/dark-factory-setup.test.js` must be updated to verify the new required sections and phrases exist in the modified agents and skills. Rationale: structural tests are the quality gate for agent definitions.

### Non-Functional

- NFR-1: **Additive changes only to the debug report template** — New sections are added; no existing sections are renamed or removed. Consumers (developer, architect, code-agent, orchestrator) must handle absence of new sections gracefully for backward compatibility with in-flight bugfixes. Rationale: the debug report is a shared contract.

- NFR-2: **No new dependencies** — All changes are to markdown prompt files and the test file. No new npm packages or external tools. Rationale: zero-dependency project constraint.

- NFR-3: **No new agents or pipeline stages** — Changes enhance existing agents within their current roles. Rationale: confirmed scope constraint.

## Data Model

No schema changes. No database. No manifest field additions.

The only structural additions are new markdown sections in agent/skill definition files and new comment annotations in promoted test files.

## Migration & Deployment

N/A — no existing data affected. All changes are to markdown prompt files (agent/skill definitions) and the test file. There are no databases, caches, stored formats, or API contracts that change.

**Backward compatibility note**: In-flight bugfixes that have already-written debug reports will not have the new sections (Systemic Analysis, Regression Risk Assessment, Root Cause Depth distinction). All consumers of the debug report (architect-agent, code-agent, orchestrator) must treat these sections as optional — their absence should not cause errors or block the pipeline. This is enforced by the additive-only constraint (NFR-1) and by the fact that agents process markdown via natural language understanding, not rigid parsing.

## API Endpoints

N/A — This feature modifies agent/skill definitions (markdown prompt files) and a test file. There are no HTTP APIs.

## Business Rules

- BR-1: **Similar patterns are awareness-only** — The Systemic Analysis section lists similar patterns for awareness. The developer decides whether to fix them as separate features. The debug-agent, code-agent, and architect do NOT automatically expand the fix scope to cover similar patterns. Why: each bugfix must remain scoped; expanding scope mid-fix creates unbounded work.

- BR-2: **Variant cap is 3-5 maximum** — Both variant scenarios (debug-agent) and variant tests (code-agent) are capped at 3-5 per bugfix. The cap is a hard maximum, not a target. LOW risk bugs may have zero variants. Why: prevents variant explosion for complex bugs while ensuring meaningful coverage.

- BR-3: **Pattern search is module-first** — Investigator C searches the same module/directory as the bug first, then expands to codebase-wide ONLY if the bug's root cause is in shared/core code (utilities, middleware, base classes, shared services). The search scope must be stated in the output. Why: bounded search prevents noise and wasted investigation time.

- BR-4: **Every bug gets systemic search** — No bug is exempt from Investigator C's systemic search. But the output is proportional: trivial bugs get a brief "isolated incident" classification. Why: the cost of checking is low; the cost of missing a systemic pattern is high.

- BR-5: **Root cause depth drives test targeting** — The test must target the deeper enabling pattern, not the immediate cause. If the debug report identifies only an immediate cause with no deeper pattern, the test targets the immediate cause and documents "No deeper enabling pattern identified." Why: tests targeting deeper patterns catch more variants.

- BR-6: **Architect BLOCK for symptom-only fixes is proportional** — The architect can BLOCK a fix that is clearly symptom-level only (e.g., adding a null check without addressing why the data is null). But the threshold is proportional to the bug's complexity: a simple typo fix does not need deep root cause analysis. The architect uses the Regression Risk Assessment to calibrate. Why: prevents both over-engineering trivial fixes and under-engineering critical ones.

- BR-7: **Variant scenarios appear in both public AND holdout** — Variant scenarios are split between public (so the code-agent knows what variants to implement) and holdout (for validation that the implementation actually handles variants). Why: the code-agent needs visibility into expected variants to design for them, while holdout variants verify robustness.

- BR-8: **Promoted test annotations are structured comments** — Annotations use a consistent comment format that is human-readable and grep-searchable. Format: `// Root cause: {pattern description}`, `// Guards: {file:line, file:line, ...}`, `// Bug: {dark-factory-bugfix-name}`. These are added by the promote-agent as a header block. Why: structured format enables tooling and manual searchability.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Debug report missing Systemic Analysis section | Architect and code-agent proceed without it (backward compat) | None — section is treated as optional for in-flight bugs |
| Debug report missing Regression Risk Assessment | Code-agent defaults to writing just the reproduction test (no variants) | Architect may flag this as a concern |
| Investigator C finds no similar patterns | Output: "No systemic patterns found. Classification: isolated incident." with brief justification | Normal path, not an error |
| Investigator C's similar patterns are outside search scope | Investigator C notes "Additional patterns may exist outside {module} but were not searched (root cause is module-local)" | None |
| Regression risk level missing from debug report | Code-agent treats as LOW risk (reproduction only, no variants) | None |
| Debug-agent writes zero variant scenarios without justification | Architect flags as concern during review | May result in BLOCK if bug is not trivially isolated |
| Code-agent exceeds variant test cap (>5 variants) | Not enforced programmatically — cap is stated in prompt as "maximum 3-5" | Architect may flag during review if excessive |
| Promote-agent cannot determine root cause from debug report | Annotation: `// Root cause: see debug report {name}` (fallback) | None |
| Promote-agent cannot determine guarded code locations | Annotation: `// Guards: see debug report {name}` (fallback) | None |

## Acceptance Criteria

- [ ] AC-1: debug-agent.md contains a "Systemic Analysis" section in the debug report template with Similar Patterns Found and Classification subsections
- [ ] AC-2: debug-agent.md contains a "Regression Risk Assessment" section in the debug report template with risk level, reintroduction vectors, variant paths, and recommended coverage
- [ ] AC-3: debug-agent.md's Root Cause section explicitly distinguishes immediate cause from deeper enabling pattern
- [ ] AC-4: df-debug SKILL.md's Investigator C prompt requires structured output with Similar Patterns Found (with file:line refs), Search Scope, Classification, and Regression Risk Assessment
- [ ] AC-5: df-debug SKILL.md's Investigator C prompt specifies module-first search scope with expansion only for shared/core code
- [ ] AC-6: df-debug SKILL.md's Investigator C prompt mandates file:line references for all similar patterns
- [ ] AC-7: df-debug SKILL.md's Investigator C prompt requires proportional output (brief for trivial, full for complex)
- [ ] AC-8: df-debug SKILL.md's synthesis step (Step 2) includes regression risk as a named dimension alongside root cause, evidence, and impact analysis
- [ ] AC-9: code-agent.md's Red Phase requires test to target root cause CLASS and test name to reference root cause, not symptom
- [ ] AC-10: code-agent.md's Red Phase requires variant test coverage proportional to regression risk level with explicit cap of 3-5
- [ ] AC-11: debug-agent.md's scenario writing section requires variant scenarios in both public and holdout, with discretion for zero variants with justification, capped at 3-5
- [ ] AC-12: architect-agent.md's bugfix review section explicitly evaluates regression risk depth, root-cause vs symptom distinction, and similar pattern flagging
- [ ] AC-13: architect-agent.md allows BLOCK for symptom-only fixes, proportional to bug complexity
- [ ] AC-14: promote-agent.md requires structured annotation comments (root cause pattern, guarded locations, bug name) on promoted tests
- [ ] AC-15: All agent changes mirrored to `plugins/dark-factory/agents/`
- [ ] AC-16: All skill changes mirrored to `plugins/dark-factory/skills/`
- [ ] AC-17: `tests/dark-factory-setup.test.js` updated with assertions for new required phrases
- [ ] AC-18: New debug report sections are additive — no existing sections renamed or removed
- [ ] AC-19: Consumers handle absence of new sections gracefully (backward compat with in-flight bugfixes)

## Edge Cases

- EC-1: **In-flight bugfix with old-format debug report** — A bugfix started before this feature is implemented will have a debug report without the new sections. All consumers (architect, code-agent, orchestrator) must proceed normally. The code-agent writes just the reproduction test (no variants). The architect reviews without regression risk data.

- EC-2: **Trivially isolated bug (typo, off-by-one in isolated function)** — Investigator C outputs "No systemic patterns found. Classification: isolated incident." Debug-agent writes zero variant scenarios with justification. Code-agent writes just the reproduction test. Architect does not demand deep root cause analysis.

- EC-3: **Bug in shared/core code with many similar patterns** — Investigator C's module-first search finds the bug, then expands codebase-wide because the code is shared. Multiple similar patterns are found. Similar patterns are listed for awareness only — they are NOT automatically fixed. Debug-agent writes 3-5 variant scenarios. Code-agent writes 3-5 variant tests.

- EC-4: **Bug where immediate cause and deeper pattern are the same** — Some bugs have no deeper enabling pattern; the immediate cause IS the root cause (e.g., wrong operator). Root Cause Depth section states: "Immediate cause and deeper pattern are identical — no deeper structural issue." Test targets the immediate cause.

- EC-5: **Regression risk level disagreement between investigators** — Investigator A might see the bug as low-risk while Investigator C sees systemic patterns making it high-risk. Synthesis step takes the HIGHEST risk assessment with rationale from the investigator who identified it.

- EC-6: **Variant count at cap boundary** — Debug-agent identifies 7 potential variant paths but can only write 3-5 scenarios. Must prioritize by risk and coverage breadth. Document which variants were deferred and why.

- EC-7: **Promote-agent processing a pre-existing test (before this feature)** — Promote-agent encounters a holdout test from a bugfix that was written before this feature. No regression risk data exists in the debug report. Promote-agent uses fallback annotation: `// Root cause: see debug report {name}`.

- EC-8: **Architect sees HIGH regression risk but symptom-level fix** — Architect BLOCKs. The debug-agent must be re-spawned to deepen the root cause analysis and update the proposed fix to target the enabling pattern. This is the proportional BLOCK mechanism — it only triggers when risk and fix depth are mismatched.

## Dependencies

### Files Modified

1. **`.claude/agents/debug-agent.md`** — Major: add Systemic Analysis, Regression Risk Assessment, Root Cause Depth sections to debug report template; add variant scenario requirements to scenario writing section
2. **`.claude/agents/code-agent.md`** — Moderate: update Red Phase to require root-cause-class targeting, variant tests proportional to risk, test naming convention
3. **`.claude/agents/architect-agent.md`** — Moderate: add explicit regression risk evaluation criteria to bugfix review section, proportional BLOCK power
4. **`.claude/agents/promote-agent.md`** — Minor: add structured annotation requirements for promoted tests
5. **`.claude/skills/df-debug/SKILL.md`** — Moderate: restructure Investigator C prompt for structured mandatory output with bounded scope; add regression risk as synthesis dimension in Step 2
6. **`plugins/dark-factory/agents/debug-agent.md`** — Mirror of file 1
7. **`plugins/dark-factory/agents/code-agent.md`** — Mirror of file 2
8. **`plugins/dark-factory/agents/architect-agent.md`** — Mirror of file 3
9. **`plugins/dark-factory/agents/promote-agent.md`** — Mirror of file 4
10. **`plugins/dark-factory/skills/df-debug/SKILL.md`** — Mirror of file 5
11. **`tests/dark-factory-setup.test.js`** — Add assertions for new required sections/phrases in debug-agent, code-agent, architect-agent, promote-agent, and df-debug skill

### Breaking Changes

None. All changes are additive to existing markdown content. No existing sections are renamed or removed. No existing test assertions need to change (only new assertions are added).

### Coordination with pipeline-velocity

The pipeline-velocity feature is modifying `architect-agent.md`, `code-agent.md`, and `tests/dark-factory-setup.test.js`. This feature also modifies those files but in non-overlapping sections:
- **architect-agent.md**: pipeline-velocity changes domain parameterization and review rounds; this feature adds bugfix-specific regression risk evaluation criteria. Different sections.
- **code-agent.md**: pipeline-velocity adds architect findings input; this feature modifies the Red Phase for root-cause-class targeting. Different sections.
- **tests/dark-factory-setup.test.js**: both add new test assertions. No overlap in what they assert.

If these features are implemented in parallel worktrees, merge conflicts are unlikely but possible in architect-agent.md and code-agent.md. Recommend implementing sequentially or in separate waves.

### Modules NOT Affected

- spec-agent.md, onboard-agent.md, test-agent.md — no changes
- df-intake, df-onboard, df-orchestrate, df-cleanup, df-spec, df-scenario skills — no changes
- scripts/init-dark-factory.js — explicitly excluded (being deleted by pipeline-velocity)
- manifest.json — no schema changes
- CLAUDE.md, .claude/rules/dark-factory.md — no changes

## Implementation Size Estimate

- **Scope size**: large (11 files modified across agents, skills, plugin mirrors, and tests)
- **Estimated file count**: 11
- **Suggested parallel tracks**: 2

  **Track 1 -- Agent and Skill Changes** (files 1-5):
  - `.claude/agents/debug-agent.md` (Systemic Analysis, Regression Risk Assessment, Root Cause Depth, variant scenarios)
  - `.claude/agents/code-agent.md` (root-cause-class targeting, variant tests, test naming)
  - `.claude/agents/architect-agent.md` (regression risk evaluation, proportional BLOCK)
  - `.claude/agents/promote-agent.md` (structured annotation)
  - `.claude/skills/df-debug/SKILL.md` (Investigator C restructuring, synthesis dimension)

  **Track 2 -- Mirrors and Tests** (files 6-11):
  - `plugins/dark-factory/agents/debug-agent.md` (mirror Track 1)
  - `plugins/dark-factory/agents/code-agent.md` (mirror Track 1)
  - `plugins/dark-factory/agents/architect-agent.md` (mirror Track 1)
  - `plugins/dark-factory/agents/promote-agent.md` (mirror Track 1)
  - `plugins/dark-factory/skills/df-debug/SKILL.md` (mirror Track 1)
  - `tests/dark-factory-setup.test.js` (new assertions for all modified agents/skills)

  **Dependency**: Track 2 depends on Track 1 completing first. Mirror files copy from Track 1 output, and test assertions verify Track 1 content. Recommended execution: Track 1 first, then Track 2.

## Implementation Notes

### Patterns to Follow

- **Debug report template**: The template is a markdown code block inside `debug-agent.md`. New sections should be inserted in a logical position within the existing template structure. Place "Systemic Analysis" and "Regression Risk Assessment" after the existing "Impact Analysis" section and before "Proposed Fix". Place "Root Cause Depth" as a subsection under the existing "Root Cause" section.
- **Investigator prompts**: The Investigator C prompt in `df-debug/SKILL.md` already has an output format directive ("output your findings as a structured report with these sections: Similar Patterns Found, Edge Cases, Systemic Issues, Root Cause Hypothesis, Evidence"). Restructure this to add the new required sections while preserving the existing ones.
- **Test assertions**: Follow the existing pattern of `content.includes("phrase")` assertions. Each new requirement maps to one or more phrase checks. Group new assertions in a new `describe` block or extend existing suites logically.
- **Plugin mirrors**: The plugin files in `plugins/dark-factory/` are currently identical to (or slightly ahead of) the source files in `.claude/`. After modifying the source files, the mirrors must be updated to match exactly. Note that `plugins/dark-factory/agents/debug-agent.md` currently has migration-related additions that `.claude/agents/debug-agent.md` does not — the mirror is ahead. Both files should end up with the same content after this feature.
- **Additive only**: Never rename or remove existing sections. The `architect-agent.md` plugin mirror has additional migration-gate text that the source does not. Preserve all existing content in both source and mirror.

### Key Implementation Details

- The debug-agent.md has two roles relevant to this feature: (1) the debug report template (Phase 5) and (2) the scenario writing instructions (Phase 6). Both need updates.
- The code-agent.md has a specific "Step 1: PROVE THE BUG (Red Phase)" section that needs the root-cause-class targeting and variant test requirements added.
- The architect-agent.md has a "For bugfixes:" evaluation list that needs the regression risk criteria added.
- The promote-agent.md's "3. Adapt Unit Tests" section needs the annotation requirement added.
- The df-debug SKILL.md's Investigator C prompt block needs restructuring. Keep the `>` blockquote format. The synthesis Step 2 needs a new numbered item for regression risk.
- For tests: add a new describe block "Bugfix regression prevention" or extend the existing "Bugfix red-green integrity" suite. Test that: debug-agent contains "Systemic Analysis", "Regression Risk Assessment", "Root Cause Depth" or "deeper enabling pattern"; code-agent contains "root cause CLASS" or "root cause class"; architect-agent contains "regression risk" in bugfix context; promote-agent contains "Root cause:" or "Guards:" annotation format; df-debug skill contains "Regression Risk" in Investigator C and synthesis.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, H-01 |
| FR-2 | P-02, H-02 |
| FR-3 | P-03, H-03 |
| FR-4 | P-04, H-04 |
| FR-5 | P-04, H-05 |
| FR-6 | P-04, H-04 |
| FR-7 | P-05, H-06 |
| FR-8 | P-06, H-07 |
| FR-9 | P-07, H-08 |
| FR-10 | P-08, H-09, H-10 |
| FR-11 | P-09, H-11, H-12 |
| FR-12 | P-10, H-13, H-14 |
| FR-13 | P-11, H-15, H-16 |
| FR-14 | P-12 |
| FR-15 | P-13 |
| BR-1 | P-01, H-01 |
| BR-2 | P-08, P-09, H-09, H-12 |
| BR-3 | P-04, H-05 |
| BR-4 | P-05, H-06 |
| BR-5 | P-03, H-03 |
| BR-6 | P-10, H-13, H-14 |
| BR-7 | P-09, H-11 |
| BR-8 | P-11, H-15 |
| EC-1 | H-17 |
| EC-2 | P-05, H-06 |
| EC-3 | H-05, H-09 |
| EC-4 | H-03 |
| EC-5 | H-07 |
| EC-6 | H-12 |
| EC-7 | H-16 |
| EC-8 | H-14 |
