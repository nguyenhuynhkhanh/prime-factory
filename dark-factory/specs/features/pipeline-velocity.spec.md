# Feature: pipeline-velocity

## Context

The Dark Factory pipeline currently enforces a mandatory 3-round sequential architect review for every spec. This means one architect-agent covers security, architecture, and API concerns across 3 serial rounds — a slow process that doesn't leverage parallelism. Additionally, architect review findings (key decisions and constraints) are discarded after review — the code-agent starts implementation with only the spec and public scenarios, missing valuable architectural context that was already established during review.

Finally, the legacy `scripts/init-dark-factory.js` duplicates all agent/skill content as template literals, creating a dual-source-of-truth maintenance burden. This script has been superseded by `bin/cli.js` + `template/` directory.

**Business value**: Faster cycle time through parallel reviews (same depth, less wall-clock time). Better implementation quality by forwarding architect decisions to code-agents (fewer rework cycles). Reduced maintenance burden by eliminating the legacy init script.

**Core principle**: Quality is never reduced. Every spec gets full-depth review. Velocity gains come from parallelism and better context flow, not from skipping or shortcutting.

## Scope

### In Scope (this spec)
- Parallel domain-focused architect review for ALL specs (replacing sequential 3-round model)
- Forwarding architect review findings to code-agents as supplementary context
- Deleting the legacy `scripts/init-dark-factory.js`
- Post-hoc file count comparison (estimated vs actual)
- Updating tests to reflect the new review model
- Mirroring all agent/skill/rule changes into `template/` directory

### Out of Scope (explicitly deferred)
- Review gating or scope-based tiering (every spec gets full review — no skipping)
- Automated scope estimation tooling
- Caching or memoization of architect reviews across features
- Per-domain architect agent files (we keep a single `architect-agent.md` with domain parameterization)
- Changes to the spec-agent, debug-agent, or intake pipeline
- Changes to the promote or archive lifecycle
- CI/CD integration for review automation

### Scaling Path
- If domain-focused reviews prove valuable, individual domain agents could be extracted to separate files with specialized prompts
- The domain list could be made configurable via project profile

## Requirements

### Functional

- FR-1: **Parallel domain architect review** — For every spec (regardless of size), spawn 3 architect-agents in parallel, each focused on one domain:
  - Security and data integrity (auth, sanitization, data exposure, migrations, concurrent writes)
  - Architecture and performance (module boundaries, patterns, N+1 queries, caching, scalability)
  - API design and backward compatibility (contracts, versioning, error handling, observability)
  Rationale: same review depth as 3 sequential rounds, but in 1/3 the wall-clock time. Each domain goes deeper than a generalist doing one pass per round.

- FR-2: **Single architect-agent with domain parameter** — The existing `architect-agent.md` gains a domain parameter that narrows its review focus. When given a domain, the agent focuses ONLY on that domain's evaluation criteria and defers all other concerns to the other domain reviewers. No new agent files are created. Rationale: avoids agent sprawl and keeps the agent list predictable.

- FR-3: **Architects report only** — In parallel review mode, architect-agents produce domain-specific review files but do NOT spawn spec-agents or write to the spec. Only the orchestrator synthesizes and spawns a single spec-agent for all changes. Rationale: prevents conflicting spec edits from concurrent agents.

- FR-4: **Strictest-wins aggregation** — Any BLOCKED from any domain results in overall BLOCKED. Contradictions between domain reviews are escalated to the developer. Rationale: security and architecture concerns must not be overridden by other domains.

- FR-5: **Follow-up verification** — After the spec-agent addresses all findings, an optional verification round checks the updated spec. Maximum 3 total passes (initial parallel + up to 2 follow-ups). Only triggered if new blockers are found. Rationale: caps review cycles while allowing necessary iteration.

- FR-6: **Domain review file naming** — Individual domain reviews written to `{name}.review-security.md`, `{name}.review-architecture.md`, `{name}.review-api.md` in the appropriate specs directory. Final synthesized review written to `{name}.review.md` (backward compatible). Rationale: preserves existing review file contract.

- FR-7: **Review findings forwarded to code-agent** — After architect review completes (APPROVED or APPROVED WITH NOTES), the orchestrator extracts "Key Decisions Made" and "Remaining Notes" sections from the review file and passes them to code-agents as supplementary context. Round-by-round discussion is stripped to protect the information barrier. Rationale: code-agents benefit from architectural constraints without seeing test-adjacent discussion.

- FR-8: **Findings forwarding for cached reviews** — When re-running orchestration and an APPROVED review already exists, the orchestrator still reads and forwards the review findings to code-agents. Rationale: cached reviews should not degrade implementation quality.

- FR-9: **No findings for new specs without review yet** — If no review file exists yet (first run), code-agent behavior is unchanged. Rationale: no-op path must be explicit.

- FR-10: **Post-hoc file count comparison** — After implementation completes, the orchestrator compares estimated file count from the spec against actual files modified, logging the delta in the manifest. Rationale: improves future estimation accuracy and catches scope creep.

- FR-11: **Delete legacy init script** — Remove `scripts/init-dark-factory.js`. The `bin/cli.js` + `template/` directory is the canonical installation path. Rationale: eliminates dual-source-of-truth maintenance burden.

- FR-12: **Applies to both features and bugfixes** — The parallel review and findings forwarding apply identically to feature specs and bugfix debug reports. Rationale: risk is risk regardless of pipeline mode.

### Non-Functional

- NFR-1: **No new dependencies** — All changes must use only Node.js built-ins and existing Claude Code tools. Rationale: zero-dependency constraint is a core project principle.

- NFR-2: **Backward compatibility of review files** — The synthesized `{name}.review.md` must maintain the same format (Status, Key Decisions Made, Remaining Notes, Blockers) so that existing orchestration logic for reading cached reviews continues to work. Rationale: in-flight features should not break.

- NFR-3: **Information barrier preservation** — The findings forwarded to code-agents must NOT contain any content that could hint at holdout scenario themes. Only "Key Decisions Made" and "Remaining Notes" sections are safe to forward. Rationale: this is the project's core integrity constraint.

## Data Model

### Manifest Schema Changes

Add the following fields to each feature entry in `dark-factory/manifest.json`:

```json
{
  "features": {
    "example-feature": {
      "status": "active",
      "estimatedFiles": 2,
      "actualFiles": null,
      "created": "...",
      "passed": null,
      "promoted": null,
      "archived": null
    }
  }
}
```

- `estimatedFiles`: integer from spec's Implementation Size Estimate. Null if not present.
- `actualFiles`: integer, set after implementation completes (post-hoc check). Null until then.

These fields are additive — existing manifest entries without them continue to work (treated as null).

### Review File Structure

New domain-specific review files alongside the existing review file:

```
dark-factory/specs/features/
  {name}.spec.md          (existing)
  {name}.review.md        (existing format — now synthesized from domain reviews)
  {name}.review-security.md      (new — Security & data integrity domain)
  {name}.review-architecture.md  (new — Architecture & performance domain)
  {name}.review-api.md           (new — API design & backward compat domain)
```

Each domain review file follows this format:

```md
## Domain Review: {Security & Data Integrity | Architecture & Performance | API Design & Backward Compatibility}

### Feature: {name}
### Status: APPROVED / APPROVED WITH NOTES / BLOCKED

### Findings
- **Blockers**: ...
- **Concerns**: ...
- **Suggestions**: ...

### Key Decisions
- {decision}: {rationale}
```

## API Endpoints

N/A — This feature modifies agent/skill definitions (markdown prompt files) and a test file. There are no HTTP APIs.

## Business Rules

- BR-1: **Every spec gets parallel domain review** — No gating, no skipping, no tiering. Every spec goes through 3 parallel domain-focused architect reviews. Quality is non-negotiable.

- BR-2: **Contradiction escalation is blocking** — If two domain architects produce contradictory recommendations (e.g., Security says "add field encryption" and Architecture says "keep schema simple"), the orchestrator presents both positions to the developer and waits for a decision. Neither recommendation is silently dropped. Why: domain expertise should inform, not decide.

- BR-3: **Findings extraction is whitelist-based** — Only "Key Decisions Made" and "Remaining Notes" sections are forwarded. Any other section (including round discussion if present in older reviews) is stripped. Why: defense-in-depth for information barrier.

- BR-4: **Post-hoc file count uses git diff** — Actual file count is determined by counting distinct files modified in the implementation (not files read or created temporarily). Why: accurate measurement of implementation scope.

- BR-5: **Deduplication during synthesis** — When synthesizing domain reviews into the final review, the orchestrator deduplicates overlapping findings across domains. Duplicated findings reinforce each other but should not appear twice in the final review. Why: cleaner output for developers and code-agents.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| One domain architect fails/times out | Report which domain failed, offer retry or proceed with available reviews | Domain review file not created |
| All three domain architects BLOCK | Overall BLOCKED, present all blockers to developer | Synthesized review written as BLOCKED |
| Domain reviews contradict | Escalate to developer with both positions | Block until developer resolves |
| Review findings extraction finds no Key Decisions | Pass empty findings context to code-agent (no-op) | None |
| Post-hoc file count cannot be determined | Set `actualFiles` to null in manifest | Log warning |
| Legacy init script referenced after deletion | Test suite no longer tests init script scaffold | Tests updated to remove init script assertions |

## Acceptance Criteria

- [ ] AC-1: Every spec (regardless of size) spawns 3 parallel domain-focused architect-agents
- [ ] AC-2: architect-agent.md accepts a domain parameter that narrows review focus to ONLY that domain
- [ ] AC-3: Domain architects produce separate review files (`{name}.review-{domain}.md`)
- [ ] AC-4: Orchestrator synthesizes domain reviews into a single `{name}.review.md` with backward-compatible format
- [ ] AC-5: Synthesis deduplicates overlapping findings across domains
- [ ] AC-6: Any domain BLOCKED = overall BLOCKED
- [ ] AC-7: Contradictions between domains are escalated to developer
- [ ] AC-8: Maximum 3 total review passes (initial parallel + up to 2 follow-ups)
- [ ] AC-9: Code-agent receives "Key Decisions Made" and "Remaining Notes" from review file
- [ ] AC-10: Round-by-round discussion is NOT forwarded to code-agent
- [ ] AC-11: Cached APPROVED reviews still forward findings on re-run
- [ ] AC-12: No review file yet = no findings forwarded (no-op, not error)
- [ ] AC-13: Post-hoc file count logged in manifest after implementation
- [ ] AC-14: `scripts/init-dark-factory.js` is deleted
- [ ] AC-15: Test suite updated: init script scaffold tests removed, new parallel review tests added
- [ ] AC-16: All changes mirrored in `template/` directory
- [ ] AC-17: Bugfixes use identical parallel review as features
- [ ] AC-18: Information barriers remain intact — no holdout content reaches code-agent, no scenario content reaches architect-agent
- [ ] AC-19: README files updated to reflect parallel review model (remove "3+ rounds" language)

## Edge Cases

- EC-1: **Domain architect produces APPROVED WITH NOTES while another produces BLOCKED** — Overall status is BLOCKED. The APPROVED WITH NOTES domain's findings are included in the synthesized review but do not override the block.
- EC-2: **Spec has Implementation Size Estimate but no file list** — Parallel review still runs (every spec gets reviewed). Post-hoc comparison skipped if no estimate baseline.
- EC-3: **Re-run with cached domain review files but missing synthesized review** — Orchestrator re-synthesizes from domain files. Does not re-run architect agents.
- EC-4: **Post-hoc check shows 10 actual files for a 2-estimated spec** — Delta logged in manifest. Informational only for future estimation.
- EC-5: **Review file has no "Key Decisions Made" section** — Empty findings passed to code-agent. This is a no-op, not an error.
- EC-6: **Bugfix debug report** — Same parallel review process as features. No special handling.
- EC-7: **Overlapping findings across domains** — Deduplicated during synthesis. E.g., both Security and API flag the same missing input validation — appears once in final review.

## Dependencies

### Files Modified
1. **`.claude/skills/df-orchestrate/SKILL.md`** — Major changes: replace sequential 3-round review with parallel domain review spawning, add findings forwarding to code-agents, add post-hoc file count check
2. **`.claude/agents/architect-agent.md`** — Major changes: add domain parameter support, add domain-aware focus instructions ("focus ONLY on your assigned domain"), add domain review file format
3. **`.claude/agents/code-agent.md`** — Minor changes: add "Architect Review Findings" as optional input in the Inputs section and Feature/Bugfix Mode sections
4. **`.claude/rules/dark-factory.md`** — Moderate changes: update pipeline descriptions from "3+ rounds" to parallel domain review language
5. **`scripts/init-dark-factory.js`** — DELETE this file
6. **`tests/dark-factory-setup.test.js`** — Update: remove init script scaffold tests (suite 10), update architect review tests (suite 5) for parallel model, add information barrier assertion for findings stripping
7. **`template/.claude/skills/df-orchestrate/SKILL.md`** — Mirror orchestrator changes
8. **`template/.claude/agents/architect-agent.md`** — Mirror architect-agent changes
9. **`template/.claude/agents/code-agent.md`** — Mirror code-agent changes
10. **`template/.claude/rules/dark-factory.md`** — Mirror rules changes
11. **`README.md`** — Update "3+ rounds" language to reflect parallel review model
12. **`dark-factory/README.md`** — Update "3+ rounds" language to reflect parallel review model

### Breaking Changes
- The architect-agent no longer runs 3 sequential rounds. Tests asserting "minimum 3 rounds" or "at least 3 rounds" must be updated to reflect parallel domain model.
- The init script scaffold test suite (suite 10) must be entirely removed since the script is deleted.
- The `dark-factory.md` rules file pipeline descriptions change from "3+ rounds" to parallel domain review language.

### Modules NOT Affected
- spec-agent.md, debug-agent.md, onboard-agent.md, test-agent.md, promote-agent.md — no changes
- df-intake, df-debug, df-onboard, df-cleanup, df-spec, df-scenario skills — no changes
- manifest.json structure is additive only (new fields are nullable)

## Implementation Notes

### Patterns to Follow
- Agent definitions use YAML frontmatter (`name`, `description`, `tools`). The `name` field must match the filename without `.md`. Tests enforce this.
- Skill definitions use YAML frontmatter (`name`, `description`). The `name` field must match the directory name. Tests enforce this.
- Information barrier constraints are expressed as "NEVER read/modify" blocks in agent markdown. Tests verify these phrases exist.
- Template files in `template/` must be kept in sync with source files in `.claude/`. The `bin/cli.js` copies from `template/` during installation.

### Key Implementation Details
- The domain parameter for architect-agent should be passed via the agent spawn message (natural language instruction), not via frontmatter changes. The frontmatter remains unchanged.
- The parallel review replaces the existing sequential architect review section in df-orchestrate SKILL.md. It is NOT a new section added before it — it replaces it entirely.
- The parallel spawn pattern already exists in df-orchestrate for code-agents (Step 1 of Feature Mode). The same "spawn in parallel, wait for all" pattern applies to architect-agents.
- The findings extraction from review files should be implemented as explicit section parsing in the orchestrator instructions — tell the orchestrator to read only the "Key Decisions Made" and "Remaining Notes" headers and their content.
- Post-hoc file count: the orchestrator already tracks which files code-agents modify. After implementation, count distinct file paths and update the manifest.
- Add domain-aware focus instructions to architect-agent: "When given a domain parameter, focus ONLY on the evaluation criteria listed for your assigned domain. Defer all other concerns to the other domain reviewers."

### Test Update Strategy
- Suite 5 ("Architect review gate"): Update assertions from "minimum 3 rounds" to reflect parallel domain model. Add assertions for domain parameter, parallel review, findings forwarding, and deduplication.
- Suite 6 (Information barriers): Add assertion that findings forwarding strips round discussion.
- Suite 10 ("init-dark-factory.js scaffold"): Remove entirely. The init script is deleted and `bin/cli.js` + `template/` is the canonical path.

## Implementation Size Estimate

- **Scope size**: large (12 files modified/deleted across agents, skills, rules, tests, READMEs, and templates)
- **Estimated file count**: 12
- **Suggested parallel tracks**: 2

  **Track 1 — Core Pipeline Changes** (files 1-4):
  - `.claude/skills/df-orchestrate/SKILL.md` (parallel review, findings forwarding, post-hoc check)
  - `.claude/agents/architect-agent.md` (domain parameterization, domain-focused review)
  - `.claude/agents/code-agent.md` (architect findings input)
  - `.claude/rules/dark-factory.md` (pipeline description updates)

  **Track 2 — Cleanup, Tests, READMEs, and Templates** (files 5-12):
  - `scripts/init-dark-factory.js` (delete)
  - `tests/dark-factory-setup.test.js` (update suites 5, 6, and 10)
  - `README.md` (update "3+ rounds" language)
  - `dark-factory/README.md` (update "3+ rounds" language)
  - `template/.claude/skills/df-orchestrate/SKILL.md` (mirror Track 1)
  - `template/.claude/agents/architect-agent.md` (mirror Track 1)
  - `template/.claude/agents/code-agent.md` (mirror Track 1)
  - `template/.claude/rules/dark-factory.md` (mirror Track 1)

  **Dependency**: Track 2's template mirroring depends on Track 1 completing first. The test updates, README updates, and init script deletion can run in parallel with Track 1. Recommended execution: run Track 1 first, then Track 2.
