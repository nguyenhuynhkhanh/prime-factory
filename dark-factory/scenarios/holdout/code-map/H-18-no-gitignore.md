# Scenario: No .gitignore file -- default exclusion list used

## Type
edge-case

## Priority
medium -- .gitignore is almost always present but absence must not crash scanning

## Preconditions
- Project has no .gitignore file
- node_modules/ directory exists with thousands of files
- dist/ directory exists with compiled output
- Regular source files in src/

## Action
Onboard-agent Phase 3.5 attempts to read .gitignore for exclusion rules.

## Expected Outcome
- No error or crash when .gitignore is missing
- Default exclusion list still applied: node_modules/, vendor/, .venv/, target/, dist/, build/, .next/, out/, .git/, .claude/worktrees/
- node_modules/ and dist/ still excluded despite no .gitignore
- Only source files in src/ are scanned
- Code map generation proceeds normally

## Notes
Validates EC-15 and EH-6. The default exclusion list is the safety net when .gitignore is absent.
