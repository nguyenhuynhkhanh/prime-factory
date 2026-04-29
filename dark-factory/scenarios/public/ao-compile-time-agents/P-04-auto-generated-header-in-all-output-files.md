# Scenario: P-04 — Auto-generated header comment appears as first line in every output file

## Type
feature

## Priority
high — the header is the primary mechanism that warns developers not to edit assembled output directly

## Preconditions
- Build has run successfully
- All 9 agents have been assembled

## Action
Read each of the 9 files in `.claude/agents/`. Check the first line of each.

## Expected Outcome
- The first line of every assembled file is exactly: `<!-- AUTO-GENERATED — edit src/agents/{name}.src.md then run: npm run build:agents -->`
- Where `{name}` is the agent name (e.g., `spec-agent`, `code-agent`, etc.)
- The second line (or after any blank lines) begins the YAML frontmatter with `---`
- The auto-generated header is present in BOTH `.claude/agents/*.md` AND `plugins/dark-factory/agents/*.md`

## Failure Mode (if applicable)
N/A.

## Notes
Exercises FR-3 and BR-1. The test-agent setup test addition checks for this (FR-10). Verify all 9 agents, not just a sample.
