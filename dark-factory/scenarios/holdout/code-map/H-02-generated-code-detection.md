# Scenario: Generated code detected and excluded from scan

## Type
edge-case

## Priority
high -- generated code inflates dependency graphs with non-human-authored connections

## Preconditions
- Project contains:
  - A `prisma/client/` directory with auto-generated Prisma client code
  - A `__generated__/` directory with GraphQL codegen output
  - A source file with `// @generated` comment at the top
  - A source file with `/* eslint-disable */ // This file was automatically generated` comment
  - Regular project source files alongside these

## Action
Scanner agent processes a chunk containing both generated and regular code.

## Expected Outcome
- prisma/client/ contents are excluded from scanning
- __generated__/ contents are excluded from scanning
- Files with "@generated" or "automatically generated" comments are excluded
- Regular source files in the same directories ARE scanned
- Code map header or notes section mentions that generated code was excluded
- Dependency graph does not contain edges from/to generated files

## Notes
Validates FR-14 (generated code detection), EC-7, and EH-8. The detection must use comment patterns and known directory names.
