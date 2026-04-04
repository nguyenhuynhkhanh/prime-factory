# Scenario: Monorepo maps inter-package dependencies before intra-package

## Type
edge-case

## Priority
medium -- monorepos are increasingly common; package boundaries are the key organizational unit

## Preconditions
- Monorepo with package structure:
  - packages/core/ (shared library)
  - packages/api/ (depends on core)
  - packages/web/ (depends on core and api)
  - Each package has its own package.json
  - packages/api/src/service.ts imports from '@myorg/core'
  - packages/web/src/client.ts imports from '@myorg/api' and '@myorg/core'

## Action
Scanners process the monorepo and the synthesizer builds the graph.

## Expected Outcome
- Module Dependency Graph shows two levels:
  1. Inter-package: web -> api, web -> core, api -> core
  2. Intra-package: detailed module dependencies within each package
- Inter-package dependencies listed first (primary organizational level)
- Package boundary imports (e.g., '@myorg/core') resolved to the correct package
- Hotspot scoring considers inter-package dependencies (core is a hotspot if imported by many packages)
- Each package treated as a module group in the dependency graph

## Notes
Validates BR-11 and EC-9. The inter-package level is what architects care about most.
