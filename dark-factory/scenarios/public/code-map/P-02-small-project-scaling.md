# Scenario: Small project spawns 1 scanner, output under 40 lines

## Type
feature

## Priority
high -- validates scanner count scaling for the most common early-stage project size

## Preconditions
- Project has 12 source files across 3 directories
- JS/TS project with import statements
- No existing code-map.md

## Action
Run Phase 3.5 of onboard-agent.

## Expected Outcome
- Project classified as "small" (<20 source files)
- Exactly 1 scanner agent spawned (not 3 or 5)
- code-map.md produced with all 7 sections
- Total output is under 40 lines (small project bound)
- Module dependency graph covers all 3 directories
- Hotspot section may be empty or minimal (few shared modules in a small project)

## Notes
Validates FR-2 and FR-7 for the small-project path.
