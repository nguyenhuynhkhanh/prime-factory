# Scenario: Binary files, images, and fonts are excluded from scanning

## Type
edge-case

## Priority
high -- scanning binary files would produce garbage output and waste scanner time

## Preconditions
- Project source directories contain mixed content:
  - .ts, .js source files (should be scanned)
  - .png, .jpg, .svg image files (should be excluded)
  - .woff2, .ttf font files (should be excluded)
  - .pdf, .zip binary files (should be excluded)
  - A compiled .wasm file (should be excluded)
- These binary files are in the same directories as source files (not in a separate assets/ dir)

## Action
Scanner agent processes a chunk that contains both source and binary files.

## Expected Outcome
- Scanner report includes only the .ts/.js source files
- Binary/image/font files do not appear in the import/export listings
- No scanner errors from attempting to parse binary content
- Code map dependency graph contains no references to binary files

## Notes
Validates FR-14 (binary file exclusion), BR-1, and EH-9.
