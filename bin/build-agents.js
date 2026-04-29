#!/usr/bin/env node
// bin/build-agents.js — Compile-time agent assembler (zero npm dependencies)
// Reads src/agents/*.src.md, resolves <!-- include: shared/... --> directives,
// and writes assembled output to .claude/agents/ and plugins/dark-factory/agents/.
//
// Usage: node bin/build-agents.js [--output-dir <dir>]
//   --output-dir <dir>  Write output to <dir> instead of both default targets.
//                       Used by tests to verify build output without overwriting.

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src', 'agents');
const SHARED_DIR = path.join(SRC_DIR, 'shared');

// Parse --output-dir flag
let outputDirOverride = null;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output-dir' && args[i + 1]) {
    outputDirOverride = path.resolve(args[i + 1]);
    break;
  }
}

const TARGETS = outputDirOverride
  ? [outputDirOverride]
  : [
      path.join(ROOT, '.claude', 'agents'),
      path.join(ROOT, 'plugins', 'dark-factory', 'agents'),
    ];

// Verify src/agents/ directory exists
if (!fs.existsSync(SRC_DIR)) {
  process.stderr.write('Error: source directory not found: src/agents/\n');
  process.exit(1);
}

/**
 * Resolve <!-- include: shared/X.md --> directives recursively.
 * The include comment may appear anywhere on a line (including within list items).
 * The entire line containing the include comment is replaced by the resolved content.
 * @param {string} content - file content to resolve
 * @param {string} srcFile - path of the file being resolved (for error messages)
 * @param {string[]} visitedStack - stack of include paths currently being resolved
 * @param {Set<string>} seenIncludes - set of include paths already resolved in this file
 * @returns {string} resolved content
 */
function resolveIncludes(content, srcFile, visitedStack, seenIncludes) {
  // Match the full line (including leading whitespace/markers) that contains an include directive.
  // Capture group 1: any prefix before <!-- include: ...
  // Capture group 2: the include path
  const INCLUDE_RE = /^(.*?)<!-- include: ([\w./\-]+) -->\s*$/gm;
  let result = content;
  let match;

  // Collect all directives (process in forward order, but replace in reverse to preserve indices)
  INCLUDE_RE.lastIndex = 0;
  const directives = [];
  while ((match = INCLUDE_RE.exec(content)) !== null) {
    directives.push({
      fullLine: match[0],          // the entire matched line
      prefix: match[1],            // any text before <!-- include: -->
      includePath: match[2],       // the include path
      index: match.index,
    });
  }

  // Process directives in reverse order so string replacements don't affect earlier indices
  for (let i = directives.length - 1; i >= 0; i--) {
    const { fullLine, prefix, includePath } = directives[i];
    const includeFile = path.join(SRC_DIR, includePath);

    // Deduplication: if this exact include path was already resolved in this file, remove the line
    if (seenIncludes.has(includePath)) {
      // Remove the full line (and trailing newline if present)
      result = result.replace(fullLine + '\n', '').replace(fullLine, '');
      continue;
    }
    seenIncludes.add(includePath);

    // Check for missing include file
    if (!fs.existsSync(includeFile)) {
      process.stderr.write(
        `Error: include file not found: src/agents/${includePath} (referenced in ${path.relative(ROOT, srcFile)})\n`
      );
      process.exit(1);
    }

    // Check for circular includes
    if (visitedStack.includes(includePath)) {
      const chain = [...visitedStack, includePath].join(' -> ');
      process.stderr.write(`Error: circular include detected: ${chain}\n`);
      process.exit(1);
    }

    // Recursively resolve the included file
    const includeContent = fs.readFileSync(includeFile, 'utf8');
    const resolvedContent = resolveIncludes(
      includeContent,
      includeFile,
      [...visitedStack, includePath],
      new Set() // fresh deduplication set for the included file
    );

    // Replace the full line with: prefix (if any) + resolved content
    // If there's a prefix (e.g., "   - "), prepend it to the resolved content
    const replacement = prefix ? prefix + resolvedContent : resolvedContent;
    result = result.replace(fullLine, replacement);
  }

  return result;
}

/**
 * Assemble one agent source file and return the assembled content.
 * @param {string} srcPath - path to the .src.md file
 * @param {string} agentName - agent name (stem without .src.md)
 * @returns {string} assembled content
 */
function assembleAgent(srcPath, agentName) {
  const sourceContent = fs.readFileSync(srcPath, 'utf8');
  const header = `<!-- AUTO-GENERATED — edit src/agents/${agentName}.src.md then run: npm run build:agents -->\n`;
  const resolved = resolveIncludes(sourceContent, srcPath, [], new Set());
  return header + resolved;
}

// Find all .src.md files
const srcFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.src.md'));

if (srcFiles.length === 0) {
  process.stderr.write('Error: no .src.md files found in src/agents/\n');
  process.exit(1);
}

// Ensure all target directories exist
for (const target of TARGETS) {
  fs.mkdirSync(target, { recursive: true });
}

// Assemble and write each agent
let hasError = false;
for (const srcFile of srcFiles) {
  const agentName = srcFile.replace(/\.src\.md$/, '');
  const srcPath = path.join(SRC_DIR, srcFile);

  let assembled;
  try {
    assembled = assembleAgent(srcPath, agentName);
  } catch (err) {
    process.stderr.write(`Error assembling ${srcFile}: ${err.message}\n`);
    hasError = true;
    continue;
  }

  for (const target of TARGETS) {
    const outPath = path.join(target, `${agentName}.md`);
    fs.writeFileSync(outPath, assembled, 'utf8');
  }
}

if (hasError) {
  process.exit(1);
}
