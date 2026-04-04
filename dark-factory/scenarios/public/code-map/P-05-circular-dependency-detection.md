# Scenario: Circular dependencies detected and flagged without blocking

## Type
edge-case

## Priority
high -- circular deps are common in real projects and the scanner must not hang

## Preconditions
- Module A imports from Module B
- Module B imports from Module C
- Module C imports from Module A (creating a cycle: A -> B -> C -> A)
- Another pair: Module D and Module E import each other (direct cycle: D <-> E)

## Action
Synthesizer builds the module dependency graph from merged scanner reports.

## Expected Outcome
- Circular Dependencies section lists both cycles:
  - A -> B -> C -> A
  - D <-> E
- Graph building completes without infinite loop or timeout
- The circular modules still appear in the Module Dependency Graph (they are real dependencies)
- The circular modules' fan-in/fan-out scores are correctly calculated despite the cycle
- Code map generation is NOT blocked by the cycles

## Notes
Validates FR-4 (circular dependency detection), BR-5 (flagged but not blocking), and EC-5 (no infinite loop).
