# Scenario: Dynamic/runtime dependencies detected and flagged as runtime-only

## Type
edge-case

## Priority
medium -- dynamic deps are invisible to static analysis but critical for architects

## Preconditions
- Project contains:
  - A DI container config file (e.g., NestJS module with `providers: [UserService]`)
  - Event listener registrations (e.g., `eventBus.on('user.created', handler)`)
  - A plugin manifest (e.g., plugins.json listing plugin module paths)
  - A dynamic require/import (e.g., `require(configPath)` where path is a variable)

## Action
Scanner agent processes files containing dynamic dependency patterns.

## Expected Outcome
- Dynamic/Runtime Dependencies section in code-map.md lists all detected patterns
- Each entry flagged as "runtime-only, not statically traceable"
- DI container registrations listed with provider and consumer
- Event listener registrations listed with event name and handler location
- Plugin manifest entries listed as dynamic module references
- These entries do NOT appear in the static Module Dependency Graph (they are separate)

## Notes
Validates FR-15 (framework-specific heuristics), BR-6 (runtime-only flagging), and EC-6 (dynamic imports).
