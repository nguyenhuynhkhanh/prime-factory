# Scenario: JS/TS import detection covers import, require, and dynamic import

## Type
feature

## Priority
high -- JS/TS is the most common stack; import detection must handle all patterns

## Preconditions
- Project contains files with:
  - ES module imports: `import { Foo } from './foo'`
  - CommonJS requires: `const bar = require('./bar')`
  - Dynamic imports: `const mod = await import('./mod')`
  - NestJS @Module imports: `@Module({ imports: [UsersModule] })`
  - Barrel file re-exports: `export { Foo } from './foo'` in an index.ts
- Mixed usage across different directories

## Action
Scanner agent processes the chunk containing these files.

## Expected Outcome
- All 5 import patterns detected and included in the scanner's structured report
- ES module imports correctly map source to dependency
- CommonJS requires correctly map source to dependency
- Dynamic imports detected and flagged (may be noted as potentially conditional)
- NestJS @Module imports detected as module-level dependencies
- Barrel re-exports detected and source traced through to actual module
- No false positives from import-like strings in comments or string literals

## Notes
Validates FR-15 for the JS/TS tech stack. Dynamic imports and barrel files are the most commonly missed patterns.
