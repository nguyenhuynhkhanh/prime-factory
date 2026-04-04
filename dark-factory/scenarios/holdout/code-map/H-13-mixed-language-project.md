# Scenario: Mixed-language project handles each language independently

## Type
edge-case

## Priority
medium -- less common but must be handled gracefully

## Preconditions
- Project contains:
  - A TypeScript frontend (src/frontend/) with import statements
  - A Python backend (src/backend/) with from...import statements
  - A Go microservice (services/auth/) with import blocks
  - Cross-language communication via HTTP APIs (not import-level dependencies)

## Action
Scanners process chunks containing different languages.

## Expected Outcome
- Each language's imports detected using language-appropriate patterns
- TypeScript imports resolved within src/frontend/ scope
- Python imports resolved within src/backend/ scope
- Go imports resolved within services/auth/ scope
- No cross-language import edges in the dependency graph (they communicate via APIs, not imports)
- Cross-language boundaries noted in the code map (e.g., "frontend (TypeScript) communicates with backend (Python) via HTTP")
- Module Dependency Graph groups by directory AND notes language per group

## Notes
Validates BR-10 and EC-8. The key risk is applying JS import patterns to Python files or vice versa.
