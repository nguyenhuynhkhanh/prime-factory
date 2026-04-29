#!/usr/bin/env bash
# Dark Factory Deploy Script
# Usage: ./scripts/deploy.sh [patch|minor|major|<x.y.z>] [otp-code]
# Default bump type: patch
#
# What this does:
#   1. Bump version in package.json, plugins/dark-factory/VERSION, .claude-plugin/marketplace.json
#   2. Commit + tag
#   3. Push to origin + prime-factory (marketplace)
#   4. npm publish

set -euo pipefail

BUMP="${1:-patch}"
OTP="${2:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "  ${GREEN}+${NC} $1"; }
warn() { echo -e "  ${YELLOW}~${NC} $1"; }
step() { echo -e "\n${CYAN}▶ $1${NC}"; }
fail() { echo -e "  ${RED}✗${NC} $1" >&2; exit 1; }

cd "$ROOT"

# --- Build agents ---
step "Building agents from src/"
node bin/build-agents.js
info "Agents assembled"

# --- Pre-flight checks ---
step "Pre-flight checks"

if ! npm whoami &>/dev/null; then
  fail "Not logged in to npm. Run: npm login"
fi
info "npm auth OK ($(npm whoami))"

if [[ -n "$(git status --porcelain)" ]]; then
  fail "Working tree is dirty. Commit or stash changes first."
fi
info "Working tree clean"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  warn "Not on main (on '$CURRENT_BRANCH'). Proceeding anyway."
fi

# --- Bump version ---
step "Bumping version ($BUMP)"
npm version "$BUMP" --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
info "New version: $NEW_VERSION"

# --- Sync to plugin files ---
step "Syncing version to plugin files"

echo "$NEW_VERSION" > plugins/dark-factory/VERSION
info "plugins/dark-factory/VERSION → $NEW_VERSION"

node -e "
  const fs = require('fs');
  const file = '.claude-plugin/marketplace.json';
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.metadata.version = '$NEW_VERSION';
  data.plugins.forEach(p => p.version = '$NEW_VERSION');
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
"
info ".claude-plugin/marketplace.json → $NEW_VERSION"

node -e "
  const fs = require('fs');
  const file = 'plugins/dark-factory/.claude-plugin/plugin.json';
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.version = '$NEW_VERSION';
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
"
info "plugins/dark-factory/.claude-plugin/plugin.json → $NEW_VERSION"

# --- Commit + tag ---
step "Committing and tagging"
git add package.json plugins/dark-factory/VERSION .claude-plugin/marketplace.json plugins/dark-factory/.claude-plugin/plugin.json
git commit -m "chore: release v$NEW_VERSION"
git tag "v$NEW_VERSION"
info "Committed + tagged v$NEW_VERSION"

# --- Push to git remotes (marketplace) ---
step "Pushing to git remotes"
git push origin main --tags
info "Pushed to origin (dark-factory GitHub)"
# prime-factory has a different codebase (Next.js) — push tags only, not the branch
git push prime-factory "refs/tags/v$NEW_VERSION"
info "Pushed tag v$NEW_VERSION to prime-factory"

# --- Publish to npm ---
step "Publishing to npm"
OTP_FLAG=""
if [[ -n "$OTP" ]]; then
  OTP_FLAG="--otp=$OTP"
fi
npm publish --access public $OTP_FLAG
info "Published dark-factory@$NEW_VERSION to npm"

# --- Create GitHub release ---
step "Creating GitHub release"
PREV_TAG=$(git tag --sort=-v:refname | grep -v "v$NEW_VERSION" | head -1)
CHANGELOG=$(git log "${PREV_TAG}..v${NEW_VERSION}" --oneline --no-merges | grep -v "^.*chore: release" || true)
gh release create "v$NEW_VERSION" --title "v$NEW_VERSION" --notes "$(printf 'Changes since %s:\n\n%s' "$PREV_TAG" "$CHANGELOG")"
info "GitHub release created"

echo -e "\n${GREEN}✓ Released dark-factory v$NEW_VERSION${NC}"
echo -e "  npm:         https://www.npmjs.com/package/dark-factory"
echo -e "  GitHub:      https://github.com/nguyenhuynhkhanh/dark-factory/releases/tag/v$NEW_VERSION"
