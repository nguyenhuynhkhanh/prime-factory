# Scenario: Go import blocks and package declarations correctly detected

## Type
feature

## Priority
medium -- Go is a supported language; import detection must cover its patterns

## Preconditions
- Go project containing:
  - Single import: `import "myproject/pkg/utils"`
  - Import block: `import (\n\t"myproject/pkg/auth"\n\t"myproject/internal/db"\n)`
  - Package declarations: `package main`, `package handlers`
  - Standard library imports: `import "fmt"`, `import "net/http"`
  - vendor/ directory with vendored dependencies

## Action
Scanner agent processes the Go project chunk.

## Expected Outcome
- Both single and block import statements detected
- Package declarations used to identify module boundaries
- Standard library imports distinguished from project imports
- vendor/ directory excluded from scanning
- Dependency graph shows correct inter-package relationships

## Notes
Validates FR-15 for Go. Import blocks with multiple entries must be parsed correctly.
