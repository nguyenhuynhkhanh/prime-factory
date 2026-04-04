# Scenario: Very large project (500+ files) output still bounded by summarization

## Type
edge-case

## Priority
medium -- stress test for output bounding; ensures agents don't get context-flooded

## Preconditions
- Project has 500+ source files across 25+ directories
- Complex dependency graph with many cross-module imports
- Multiple hotspots, several circular dependencies

## Action
Synthesizer processes merged reports from 5 scanners.

## Expected Outcome
- Code map output is under 200 lines despite 500+ input files
- Module Dependency Graph uses directory-level grouping (not file-level listing)
- Only top 5-10 entry point traces included (not all routes)
- Hotspots section shows only modules above the fan-in >= 3 threshold
- Interface boundaries are module-level summaries, not function-level
- No information is silently dropped -- the summarization makes explicit what was aggregated

## Notes
Validates FR-7, BR-2, and EC-11. The key constraint is that analysis depth is unlimited but output is bounded.
