# Scenario: Flat script directory produces file-level dependency list

## Type
edge-case

## Priority
medium -- common in utility/scripting projects without module structure

## Preconditions
- Project has 8 Python scripts in a single flat directory (no subdirectories)
- Scripts import from each other: `from utils import parse_data`, `from config import DB_URL`
- No package structure, no __init__.py, no module directories

## Action
Scanner processes the flat directory and synthesizer builds the graph.

## Expected Outcome
- Dependency graph uses file-level granularity (not module/directory-level)
- Each file listed with its imports from other files in the directory
- No artificial module grouping applied
- Entry point traces show script execution paths (e.g., main.py -> utils.py -> config.py)
- Standard library imports excluded from the file-level graph

## Notes
Validates EC-3 and EH-3. The module-level grouping rule adapts to file-level when there are no directories.
