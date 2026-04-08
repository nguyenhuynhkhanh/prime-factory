#!/usr/bin/env bash
# Prime Factory CLI — installer
# Usage: curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/YOUR_REPO/main/cli-lib/install.sh | bash

set -e

INSTALL_DIR="$HOME/.local/bin"
BASE_RAW="https://raw.githubusercontent.com/YOUR_ORG/YOUR_REPO/main/cli-lib"
SCRIPTS="df-onboard.sh df-check-onboard.sh log-event.sh"

echo "Installing Prime Factory CLI to $INSTALL_DIR ..."

mkdir -p "$INSTALL_DIR"

for script in $SCRIPTS; do
  curl -fsSL "$BASE_RAW/$script" -o "$INSTALL_DIR/$script"
  chmod +x "$INSTALL_DIR/$script"
done

# Ensure $INSTALL_DIR is on PATH
if ! echo "$PATH" | grep -q "$INSTALL_DIR"; then
  echo ""
  echo "Add this to your shell profile (~/.bashrc or ~/.zshrc):"
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
fi

echo ""
echo "Done. Run 'df-onboard.sh' to get started."
