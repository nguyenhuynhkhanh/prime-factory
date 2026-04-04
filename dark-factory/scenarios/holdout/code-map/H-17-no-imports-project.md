# Scenario: Project with config files and no imports produces empty dependency graph

## Type
edge-case

## Priority
medium -- unusual but valid project state

## Preconditions
- Project has 10 config files (YAML, JSON, .env, .toml)
- No source files with import/require/use statements
- Files exist in proper project directories (not node_modules or vendor)

## Action
Scanner processes the files and the synthesizer builds the graph.

## Expected Outcome
- Module Dependency Graph section shows an empty or near-empty graph
- A note explains: "No import relationships detected -- project may consist primarily of configuration files"
- Hotspot section is empty (no imports = no fan-in)
- Entry Point Traces section is empty or notes no entry points found
- Code map is still valid and writable -- emptiness is not an error
- Output is well under 40 lines

## Notes
Validates EC-12 and EH-5. An empty graph is a valid result, not a failure.
