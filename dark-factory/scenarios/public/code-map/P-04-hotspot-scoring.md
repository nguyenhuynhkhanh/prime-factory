# Scenario: Hotspot scoring identifies high fan-in and high fan-out modules

## Type
feature

## Priority
high -- hotspot data is the primary value for spec-agent scope estimation and architect blast radius analysis

## Preconditions
- Project has a utility module (e.g., src/common/utils.ts) imported by 7 other modules (high fan-in)
- Project has a controller module (e.g., src/modules/orders/orders.controller.ts) that imports from 8 different modules (high fan-out)
- Project has several modules imported by only 1-2 others (below threshold)

## Action
Synthesizer processes merged scanner reports and calculates hotspot scores.

## Expected Outcome
- Shared Dependency Hotspots section contains the utility module with fan-in = 7
- Shared Dependency Hotspots section contains the controller module flagged for high fan-out = 8
- Modules with fan-in < 3 are NOT listed in hotspots (they are normal)
- Hotspot list is sorted by fan-in count (highest first)
- Each hotspot entry includes: module path, fan-in count, and list of importers

## Notes
Validates FR-4 (hotspot calculation) and BR-4 (threshold of 3+). The fan-out flagging is separate from fan-in sorting -- both should appear in the section.
