# Feature: onboard-improvement

## Context

The Dark Factory project profile (`dark-factory/project-profile.md`) is the shared context that all agents reference before doing work. Currently, the profile is underutilized:

1. **Incomplete template**: The onboard-agent's profile template lacks sections for API conventions, auth model, environment/config, business domain entities, and common gotchas -- all critical context that agents need and currently have to rediscover from scratch on every spawn.
2. **Agents don't know what to read**: Agents are told "read project-profile.md if it exists" with no guidance on WHICH sections are relevant to their role. This leads to either reading the whole file (wasteful context) or skipping it (missed context).
3. **Critical gaps**: The test-agent does NOT reference project-profile.md at all. The promote-agent has only a vague reference ("read project-profile.md if it exists for test setup details"). The df-intake and df-debug lead/investigator prompts never mention the profile.
4. **No developer sign-off**: The onboard-agent writes the profile without presenting it for confirmation, so errors in the profile propagate silently to all downstream agents.
5. **No incremental refresh**: Re-running onboard overwrites the entire profile without showing what changed, making developers reluctant to refresh.

**Business value**: A thorough, well-consumed project profile reduces rework across the entire pipeline. Agents make fewer mistakes when they have good context upfront, leading to fewer architect review rounds, fewer holdout test failures, and faster cycle times.

## Scope

### In Scope (this spec)

- Enrich the onboard-agent's profile template with 5 new sections (API Conventions, Auth Model, Environment & Config, Business Domain Entities, Common Gotchas)
- Add a "How This Profile Is Used" preamble mapping sections to consuming agents
- Add developer sign-off step (present profile for confirmation before writing)
- Add incremental refresh (show diff when re-running on existing profile, allow per-section accept/reject)
- Add broader codebase sampling (one file per top-level module/directory, flag inconsistencies)
- Add explicit no-secrets constraint
- Add section-targeted reading instructions to all 6 consuming agents (spec-agent, architect-agent, code-agent, test-agent, debug-agent, promote-agent)
- Add project profile reading to df-intake lead prompts (Leads A, B, C)
- Add project profile reading to df-debug investigator prompts (Investigators A, B, C)
- Mirror all changes to `plugins/dark-factory/agents/` and `plugins/dark-factory/skills/`
- Update `tests/dark-factory-setup.test.js` to verify test-agent and promote-agent reference project-profile.md with section-specific instructions

### Out of Scope (explicitly deferred)

- **Automatic staleness detection / fingerprinting** -- adds complexity without clear value at current project scale
- **Per-agent profile files** -- single file with section targeting achieves the same goal without file proliferation
- **Monorepo-specific profile support** -- no monorepo users yet; can be added when needed
- **Profile versioning schema** -- the "last updated" timestamp is sufficient for now
- **Runtime compliance verification** -- tests verify structural presence of instructions, not runtime behavior
- **Changes to init-dark-factory.js** -- this script will be deleted by the pipeline-velocity feature. The pipeline-velocity spec is already approved and will run in a separate worktree. This spec must NOT touch `scripts/init-dark-factory.js`

### Scaling Path

- If profiles become too large for certain projects, section targeting already enables agents to read only relevant portions. The preamble documents which agent reads which section, making it easy to extract into per-agent files later.
- If staleness becomes a problem, a hash-based fingerprint of key files (package.json, tsconfig, etc.) could trigger automatic re-onboard prompts.

## Requirements

### Functional

- FR-1: **Enriched profile template** -- The onboard-agent's profile template must include 5 new sections: API Conventions, Authentication & Authorization Model, Environment & Configuration, Key Business Domain Entities, and Common Gotchas. Rationale: these are the most common context gaps that cause agents to produce wrong output.
- FR-2: **Profile preamble** -- The profile must begin with a "How This Profile Is Used" section that maps each profile section to the agent(s) that consume it. Rationale: helps developers understand what matters and gives agents a quick reference for which sections to read.
- FR-3: **Developer sign-off** -- After generating the profile, the onboard-agent must present it to the developer and ask "Does this look right?" before writing to disk. Rationale: catches errors early, before they propagate to all downstream agents.
- FR-4: **Incremental refresh** -- When re-running on an existing profile, the onboard-agent must show what changed (section by section) and let the developer accept or reject each change before overwriting. Rationale: developers are reluctant to re-onboard if it might destroy manual corrections.
- FR-5: **Broader codebase sampling** -- The onboard-agent must sample at least one file per top-level module/directory (not just 3-5 files total). When patterns are inconsistent across modules, it must flag them and ask the developer which is canonical. Rationale: a profile based on a small sample may miss important patterns.
- FR-6: **No-secrets constraint** -- The onboard-agent must include an explicit instruction: "NEVER include actual secret values, API keys, passwords, or connection strings. Reference env var NAMES only." Rationale: prevents accidental secret leakage into markdown files that may be committed to git.
- FR-7: **Business domain conditional** -- The Business Domain Entities section must only be included when the project has domain-specific constraints that affect implementation (e.g., multi-tenant, compliance). The onboard-agent decides based on what it finds. Rationale: avoids empty boilerplate sections in simple projects.
- FR-8: **Section-targeted agent instructions** -- Each of the 6 consuming agents must receive explicit instructions on WHICH profile sections to read, not "read the whole profile." Rationale: reduces context waste and ensures agents read the sections most relevant to their role.
  - spec-agent: Overview, Tech Stack, Architecture, API Conventions, Auth Model, Business Domain Entities
  - architect-agent: Overview, Tech Stack, Architecture, Structural Notes, API Conventions, Auth Model, Common Gotchas
  - code-agent: Tech Stack, Architecture (Patterns to Follow), For New Features, Testing, Environment & Config
  - test-agent: Testing, Tech Stack, Environment & Config
  - debug-agent: Tech Stack, Architecture, Structural Notes, For Bug Fixes, Common Gotchas, Environment & Config
  - promote-agent: Testing, Tech Stack
- FR-9: **df-intake lead prompts** -- All 3 lead prompts (Lead A, B, C) must instruct spec-agents to read the project profile FIRST (before codebase research), specifying which sections are relevant to their perspective. Rationale: leads currently start from scratch on every feature.
- FR-10: **df-debug investigator prompts** -- All 3 investigator prompts (A, B, C) must instruct debug-agents to read the project profile FIRST, specifying relevant sections. Rationale: investigators currently start from scratch on every bug.
- FR-11: **Mirror all changes** -- Every change to `.claude/agents/*.md` must be mirrored to `plugins/dark-factory/agents/*.md`. Every change to `.claude/skills/*/SKILL.md` must be mirrored to `plugins/dark-factory/skills/*/SKILL.md`. Rationale: the plugins directory is the distribution copy; it must stay in sync.
- FR-12: **Test updates** -- The test file must verify that test-agent and promote-agent reference project-profile.md with section-specific reading instructions. Rationale: these two agents are the critical gap discovered during investigation.

### Non-Functional

- NFR-1: **Profile size** -- The enriched profile template should produce profiles that remain under ~250 lines for a medium-complexity project. Section targeting means agents read subsets, but the overall file should stay manageable. Rationale: excessively large profiles waste developer review time during sign-off.
- NFR-2: **Backward compatibility** -- The enriched template must remain compatible with existing profiles. An existing profile generated by the old template should still be readable by agents with the new section-targeted instructions (they just won't find the new sections). Rationale: existing projects should not break when agents are updated.

## Data Model

N/A -- this feature modifies markdown prompt files and a JavaScript test file. There are no database schemas, data stores, or persistent state changes.

## Migration & Deployment

N/A -- no existing data affected. The changes are to agent/skill prompt files and test assertions. Existing project profiles generated by the old template will continue to work; agents with new section-targeted instructions will simply not find the new sections and will fall back to reading what exists. The onboard-agent's incremental refresh feature (FR-4) provides the path for updating existing profiles.

**Mirror sync note**: The `.claude/agents/` and `plugins/dark-factory/agents/` directories currently have 2 agents that are already out of sync (architect-agent, debug-agent). The `.claude/skills/` and `plugins/dark-factory/skills/` have 1 skill out of sync (df-orchestrate). This feature must sync the files it touches but should NOT attempt to fix pre-existing drift in files it does not touch -- that is a separate concern.

## API Endpoints

N/A -- no API endpoints. This feature modifies agent prompts, skill prompts, and test assertions.

## Business Rules

- BR-1: **Section targeting is additive** -- Adding section-reading instructions to agents must not remove any existing profile-reading behavior. If an agent currently says "read project-profile.md if it exists", the new instruction should be more specific (listing sections) but not less permissive. Rationale: agents should never lose access to context they currently have.
- BR-2: **Sign-off is blocking** -- The onboard-agent must NOT write the profile to disk until the developer confirms. If the developer rejects, the agent must revise and re-present. Rationale: the whole point of sign-off is to prevent bad data from propagating.
- BR-3: **Incremental refresh preserves manual edits** -- When showing changes during incremental refresh, sections the developer rejects must be preserved as-is from the existing profile. Rationale: developers sometimes manually edit profiles; those edits should not be silently overwritten.
- BR-4: **No-secrets is absolute** -- The no-secrets constraint must use the word "NEVER" and be in the constraints section (not buried in a template comment). Rationale: this is a security rule, not a suggestion.
- BR-5: **Code examples are conditional** -- The onboard-agent should only include inline code examples in the profile when the project has unusual patterns that cannot be described in prose alone. Default is prose descriptions with file path references. Rationale: code examples bloat the profile and become stale quickly.
- BR-6: **Mirror must be exact copy** -- Files in `plugins/dark-factory/agents/` and `plugins/dark-factory/skills/` must be byte-for-byte identical to their `.claude/` counterparts after this feature is implemented. Rationale: any divergence causes confusion about which is the source of truth.
- BR-7: **Test-agent profile reference is mandatory** -- The test-agent must reference project-profile.md with specific section instructions. This is the critical gap fix. Rationale: the test-agent currently has zero project context, which means it writes tests that don't match project conventions.
- BR-8: **Lead/investigator profile reading is "FIRST"** -- The df-intake lead prompts and df-debug investigator prompts must instruct agents to read the profile BEFORE codebase research, not after. Rationale: the profile provides a map that makes codebase research more efficient.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| Developer rejects sign-off | Onboard-agent revises based on feedback, re-presents | No file written |
| Developer rejects all sections in incremental refresh | Existing profile preserved unchanged | None |
| Profile section referenced by agent does not exist | Agent proceeds without that section's context (graceful degradation) | None |
| Codebase has no files to sample for a top-level directory | Onboard-agent notes the empty directory, skips it | None |
| Inconsistent patterns found across modules | Onboard-agent flags them and asks developer which is canonical | Profile notes the inconsistency |

## Acceptance Criteria

- [ ] AC-1: The onboard-agent's profile template includes all 5 new sections (API Conventions, Auth Model, Environment & Config, Business Domain Entities, Common Gotchas)
- [ ] AC-2: The profile begins with a "How This Profile Is Used" preamble mapping sections to agents
- [ ] AC-3: The onboard-agent presents the profile to the developer for confirmation before writing
- [ ] AC-4: Re-running onboard on an existing profile shows changes per-section and allows accept/reject
- [ ] AC-5: The onboard-agent samples at least one file per top-level module/directory
- [ ] AC-6: The onboard-agent's constraints section includes an explicit no-secrets rule with "NEVER"
- [ ] AC-7: The Business Domain Entities section is conditional (only included when relevant)
- [ ] AC-8: All 6 consuming agents have section-targeted profile reading instructions
- [ ] AC-9: The test-agent references project-profile.md with specific sections (Testing, Tech Stack, Environment & Config)
- [ ] AC-10: The promote-agent references project-profile.md with specific sections (Testing, Tech Stack)
- [ ] AC-11: All 3 df-intake lead prompts instruct reading the profile FIRST
- [ ] AC-12: All 3 df-debug investigator prompts instruct reading the profile FIRST
- [ ] AC-13: All changes are mirrored to `plugins/dark-factory/agents/` and `plugins/dark-factory/skills/`
- [ ] AC-14: Tests verify test-agent and promote-agent profile references with section specificity
- [ ] AC-15: Existing tests still pass (no regression)

## Edge Cases

- EC-1: **Greenfield project with no code** -- The onboard-agent should produce a minimal profile with only Overview and Tech Stack sections filled. New sections (API Conventions, Auth, etc.) should be marked as "Not yet established" rather than omitted entirely. This preserves the template structure for future updates.
- EC-2: **Project with no API** (library, CLI tool) -- API Conventions and Auth Model sections should be marked "N/A -- this project is a {library/CLI/etc.}" rather than omitted. Rationale: an explicit "N/A" is different from a missing section.
- EC-3: **Very large project with 50+ top-level directories** -- The broader sampling should cap at a reasonable limit (e.g., 20 directories) and note that sampling was partial. Rationale: sampling 50 files would produce an unwieldy profile.
- EC-4: **Profile already has sections the new template doesn't define** (e.g., "Developer Notes") -- Incremental refresh must preserve sections that exist in the old profile but not in the new template. Rationale: custom sections are intentional developer additions.
- EC-5: **Re-onboard after business domain becomes relevant** -- A project that initially had no Business Domain section should gain one on re-onboard if domain-specific constraints are now present. The incremental refresh shows this as a new section addition.
- EC-6: **Agent reads profile but referenced section doesn't exist** -- The agent must proceed without error, using whatever context is available. Section targeting is advisory, not mandatory. Rationale: profiles generated by the old template will lack the new sections.
- EC-7: **Developer accepts some sections and rejects others during incremental refresh** -- The final profile must be a merge: accepted sections from the new analysis, rejected sections from the existing profile, in correct order.
- EC-8: **plugins/ mirror files are already out of sync with .claude/ before this feature runs** -- The code-agent must overwrite plugins/ files to match .claude/ for ALL files this feature touches, regardless of pre-existing drift. It must NOT attempt to fix drift in files it does not modify.

## Dependencies

- **Depends on**: None -- this spec is independently implementable
- **Depended on by**: None currently
- **Group**: standalone
- **Sequencing note**: This spec must NOT modify `scripts/init-dark-factory.js`. The pipeline-velocity feature will delete that file. If pipeline-velocity lands first, this spec has no conflict. If this spec lands first, it simply does not touch the init script, and pipeline-velocity deletes it later.

## Implementation Size Estimate

- **Scope size**: x-large (14 files changed)
- **Suggested parallel tracks**: 3 code-agents

**Track 1: Onboard Agent Enhancement** (2 files, no overlap with other tracks)
- `.claude/agents/onboard-agent.md` -- enriched template, sign-off step, incremental refresh, broader sampling, no-secrets constraint, conditional business domain
- `plugins/dark-factory/agents/onboard-agent.md` -- exact mirror

**Track 2: Agent Consumption Hardening** (10 files, no overlap with other tracks)
- `.claude/agents/spec-agent.md` -- section-targeted profile reading
- `.claude/agents/architect-agent.md` -- section-targeted profile reading
- `.claude/agents/code-agent.md` -- section-targeted profile reading
- `.claude/agents/test-agent.md` -- section-targeted profile reading (critical fix)
- `.claude/agents/debug-agent.md` -- section-targeted profile reading
- `.claude/agents/promote-agent.md` -- section-targeted profile reading
- `plugins/dark-factory/agents/spec-agent.md` -- mirror
- `plugins/dark-factory/agents/code-agent.md` -- mirror
- `plugins/dark-factory/agents/test-agent.md` -- mirror
- `plugins/dark-factory/agents/promote-agent.md` -- mirror

**Note on architect-agent and debug-agent mirrors**: These two agents already have divergence between `.claude/agents/` and `plugins/dark-factory/agents/`. Track 2 must:
1. Make changes to the `.claude/agents/` version (the source of truth for this project)
2. Copy the ENTIRE updated `.claude/agents/` file to `plugins/dark-factory/agents/` (resolving pre-existing drift)

**Track 3: Skill Prompts + Tests** (4 files, no overlap with other tracks)
- `.claude/skills/df-intake/SKILL.md` -- add profile reading to lead prompts
- `.claude/skills/df-debug/SKILL.md` -- add profile reading to investigator prompts
- `plugins/dark-factory/skills/df-intake/SKILL.md` -- mirror
- `plugins/dark-factory/skills/df-debug/SKILL.md` -- mirror
- `tests/dark-factory-setup.test.js` -- add tests for test-agent and promote-agent profile references

## Implementation Notes

### Patterns to follow

- **Agent modification pattern**: Each agent file has a clear structure: YAML frontmatter, role description, process phases, templates, constraints. Section-targeted reading instructions should go in the earliest relevant phase (e.g., Phase 1 for spec-agent, Step 0 or early in the process for test-agent).
- **Existing profile reading instructions**: See how spec-agent (line 31-33), architect-agent (line 55-60), code-agent (line 68), and debug-agent (line 40-43) currently reference the profile. Replace these vague references with section-specific instructions.
- **Test pattern**: The test file uses `readAgent(name)` helper and `assert.ok(content.includes(...))` for string matching. The existing test at line 452-460 checks that "all key agents reference project-profile.md" but only checks spec-agent, debug-agent, architect-agent, and code-agent. This test must be updated to also check test-agent and promote-agent, AND to verify section-specific language.
- **Mirror pattern**: After modifying any `.claude/agents/*.md` or `.claude/skills/*/SKILL.md`, the identical content must be written to the corresponding path under `plugins/dark-factory/`.

### Specific guidance for Track 2 (Agent Consumption Hardening)

For each agent, locate the existing profile-reading instruction and replace it. Examples:

**spec-agent** (currently line 31-33):
```
Read `dark-factory/project-profile.md` if it exists — focus on these sections:
- **Overview**: project type, stage, scale
- **Tech Stack**: languages, frameworks, dependencies
- **Architecture**: structure, patterns, shared abstractions
- **API Conventions**: URL patterns, versioning, response format, error shape
- **Auth Model**: authentication mechanism, roles, guard patterns
- **Business Domain Entities**: core domain model, entity relationships (if present)
```

**test-agent** (currently has NO profile reference -- add before Step 0):
```
Read `dark-factory/project-profile.md` if it exists — focus on these sections:
- **Testing**: framework, config, run command, location, naming, quality bar
- **Tech Stack**: language, runtime, test framework
- **Environment & Config**: how config is loaded, env var patterns
```

### Specific guidance for Track 3 (Skill Prompts)

In df-intake, each lead prompt (Lead A, B, C) currently starts with "Research the codebase, then output your findings." Prepend profile reading before that:

```
> Before researching the codebase, read `dark-factory/project-profile.md` if it exists -- it provides a map of the project's architecture, conventions, and patterns. Focus on sections relevant to your perspective.
```

Same pattern for df-debug investigator prompts.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, H-01 |
| FR-2 | P-02 |
| FR-3 | P-03, H-06 |
| FR-4 | P-04, H-07, H-08 |
| FR-5 | P-05, H-03 |
| FR-6 | P-06 |
| FR-7 | P-07, H-04 |
| FR-8 | P-08, P-09, H-05 |
| FR-9 | P-10 |
| FR-10 | P-11 |
| FR-11 | P-12, H-09 |
| FR-12 | P-13 |
| BR-1 | H-05 |
| BR-2 | P-03, H-06 |
| BR-3 | H-07 |
| BR-4 | P-06 |
| BR-5 | H-01 |
| BR-6 | P-12, H-09 |
| BR-7 | P-09 |
| BR-8 | P-10, P-11 |
| EC-1 | H-01 |
| EC-2 | H-02 |
| EC-3 | H-03 |
| EC-4 | H-08 |
| EC-5 | H-04 |
| EC-6 | H-05 |
| EC-7 | H-07 |
| EC-8 | H-09 |
