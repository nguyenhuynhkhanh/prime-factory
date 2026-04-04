# Scenario: Circular dependencies do not corrupt hotspot scores

## Type
edge-case

## Priority
medium -- circular deps could cause double-counting in fan-in/fan-out calculations

## Preconditions
- Modules A, B, C form a cycle: A -> B -> C -> A
- Module A is also imported by 4 non-cyclic modules (D, E, F, G)
- Expected fan-in for A: 5 (B via cycle + C via cycle... but each module should be counted once)

## Action
Synthesizer calculates hotspot scores for the project.

## Expected Outcome
- Module A's fan-in is calculated correctly without double-counting cycle members
- Each importing module counted exactly once regardless of cycles
- Module A appears in Hotspots with accurate fan-in = 5 (C, D, E, F, G import it -- B is the cycle source that A imports from, not an importer of A unless B also imports A)
- Circular Dependencies section lists the cycle separately
- Graph traversal for hotspot calculation terminates (no infinite loop)

## Notes
Validates BR-5 and EC-5. The key risk is that cycle traversal inflates or corrupts fan-in counts.
