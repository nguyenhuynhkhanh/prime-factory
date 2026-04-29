# Scenario: P-01 — Happy path: build all 9 agents

## Type
feature

## Priority
critical — this is the core operation of the entire feature

## Preconditions
- `src/agents/` directory exists with all 9 `.src.md` files
- `src/agents/shared/` exists with all 4 shared block files
- Each `.src.md` file has at least one `<!-- include: shared/... -->` directive (for agents that use shared blocks) or is a verbatim passthrough (for agents with no shared blocks)
- `.claude/agents/` directory exists
- `plugins/dark-factory/agents/` directory exists

## Action
Run: `node bin/build-agents.js` from the project root.

## Expected Outcome
- Exit code 0
- 9 agent files written to `.claude/agents/` (one per `.src.md`)
- 9 agent files written to `plugins/dark-factory/agents/` (same content)
- Each file begins with `<!-- AUTO-GENERATED — edit src/agents/{name}.src.md then run: npm run build:agents -->`
- Each file is valid Markdown with correct YAML frontmatter following the header comment
- No `<!-- include: ... -->` directives remain in any output file (all resolved)
- Files in `.claude/agents/` and `plugins/dark-factory/agents/` have byte-for-byte identical content for each agent

## Failure Mode (if applicable)
If any source file is unreadable, the build exits with code 1 and names the file. No partial writes to output files.

## Notes
This scenario exercises FR-1, FR-2, FR-12, and BR-2 together. The test should verify both output locations match and that no include comments are left in the assembled output.
