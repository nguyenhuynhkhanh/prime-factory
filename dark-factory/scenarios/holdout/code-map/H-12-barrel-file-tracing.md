# Scenario: Barrel files traced through to actual source modules

## Type
edge-case

## Priority
high -- barrel files are ubiquitous in JS/TS and create misleading dependency graphs if not traced

## Preconditions
- Project has a barrel file pattern:
  - src/modules/users/index.ts re-exports: `export { UserService } from './user.service'` and `export { UserController } from './user.controller'`
  - src/modules/orders/orders.service.ts imports: `import { UserService } from '../users'` (resolves to the barrel)
  - The actual source is in user.service.ts, not index.ts

## Action
Scanner agent processes these files and the synthesizer builds the dependency graph.

## Expected Outcome
- Dependency graph shows orders.service.ts -> users/user.service.ts (the actual source)
- NOT orders.service.ts -> users/index.ts (the barrel intermediary)
- The barrel file (index.ts) is flagged as a "re-export hub" in the Interface/Contract Boundaries section
- The barrel file's export count reflects the number of re-exported items, not its own exports
- Fan-in calculation counts against the actual source module, not the barrel

## Notes
Validates BR-9 and EC-4. This is critical for accurate hotspot scoring -- barrels would otherwise appear as false hotspots.
