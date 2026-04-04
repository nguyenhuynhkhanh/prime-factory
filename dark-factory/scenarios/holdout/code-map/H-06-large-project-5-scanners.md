# Scenario: Large project (100+ files) spawns 5 scanners

## Type
feature

## Priority
high -- validates the upper end of scanner scaling

## Preconditions
- Project has 150 source files across 12 top-level directories
- Mix of modules with varying sizes (some dirs have 2 files, others have 30+)

## Action
Run Phase 3.5 of onboard-agent.

## Expected Outcome
- Project classified as "large" (100+ source files)
- Exactly 5 scanner agents spawned
- Files distributed across scanners by directory (no directory split across scanners)
- All 150 files analyzed (no files dropped due to chunking)
- Code map output stays under 200 lines (large project bound)

## Notes
Validates FR-2 (5 scanners for large) and FR-7 (output bounding).
