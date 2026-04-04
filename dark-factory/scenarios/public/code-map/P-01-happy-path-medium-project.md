# Scenario: Happy path -- medium-sized JS/TS project produces complete code map

## Type
feature

## Priority
critical -- this is the primary use case; if this fails, the entire feature is broken

## Preconditions
- Project has 40+ source files across 6+ top-level directories (e.g., src/modules/users, src/modules/orders, src/common/, src/middleware/, src/config/, src/db/)
- Project uses JS/TS with import/require statements
- node_modules/ exists and contains thousands of files
- .gitignore exists and includes node_modules/
- No existing code-map.md
- project-profile.md exists (Phase 1-3 already completed)

## Action
Run `/df-onboard` (or the Phase 3.5 step within onboard-agent).

The onboard-agent should:
1. Glob all source files, group by top-level directory
2. Apply smart exclusions (skip node_modules/, dist/, build/, .git/, .claude/worktrees/)
3. Determine project size as "medium" (20-100 source files) and spawn 3 scanner agents
4. Each scanner gets a non-overlapping chunk of directories
5. Each scanner outputs structured report: imports, exports, entry points, cross-cutting patterns per file
6. Synthesizer merges reports into dependency graph, hotspots, entry point traces, etc.
7. Present code map to developer for confirmation
8. Write dark-factory/code-map.md

## Expected Outcome
- 3 scanner agents spawned (medium project)
- node_modules/ and other excluded directories NOT scanned
- `dark-factory/code-map.md` created with all 7 sections:
  1. Module Dependency Graph (adjacency list grouped by directory)
  2. Entry Point Traces (top 5-10 call chains)
  3. Shared Dependency Hotspots (modules with fan-in >= 3, sorted)
  4. Interface/Contract Boundaries (module-level export summaries)
  5. Cross-Cutting Concerns (middleware, base classes, etc.)
  6. Circular Dependencies (list or "None detected")
  7. Dynamic/Runtime Dependencies (flagged as runtime-only)
- Output is between 40-100 lines (medium project bound)
- Developer was prompted for confirmation before write
- All analysis done via regex/grep/glob (no external dependencies)

## Notes
This scenario validates FR-1 through FR-5, FR-7, FR-8, FR-14, FR-17, BR-1, and BR-2.
