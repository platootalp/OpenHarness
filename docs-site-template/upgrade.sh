#!/usr/bin/env bash
set -euo pipefail

TEMPLATE_REPO="${TEMPLATE_REPO:-https://github.com/anthropics/docs-site-template.git}"
TEMPLATE_BRANCH="${TEMPLATE_BRANCH:-main}"

echo "=== docs-site-template upgrade ==="
echo "Upstream: $TEMPLATE_REPO ($TEMPLATE_BRANCH)"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# --- 1. Clone upstream ---
echo "Cloning upstream template..."
git clone --depth 1 --branch "$TEMPLATE_BRANCH" "$TEMPLATE_REPO" "$TMP_DIR/template"

# --- 2. Stash local changes ---
echo "Stashing local changes..."
git stash --include-untracked 2>/dev/null || true

# --- 3. Whitelist sync ---
SYNC_PATHS=(
  "src/components/"
  "src/layouts/"
  "src/lib/"
  "src/styles/"
  "src/pages/"
  "scripts/"
  "astro.config.mjs"
  "tailwind.config.mjs"
  "tsconfig.json"
)

echo "Syncing core files..."
for path in "${SYNC_PATHS[@]}"; do
  if [ -e "$TMP_DIR/template/$path" ]; then
    echo "  $path"
    rm -rf "$SCRIPT_DIR/$path"
    cp -r "$TMP_DIR/template/$path" "$SCRIPT_DIR/$path"
  fi
done

# --- 4. Restore local changes ---
echo "Restoring local changes..."
if git stash list | head -1 | grep -q "stash"; then
  if ! git stash pop 2>/dev/null; then
    echo ""
    echo "⚠️  Conflicts detected when restoring your changes."
    echo "   Resolve conflicts manually, then run: git add . && git commit"
  fi
fi

echo ""
echo "=== Upgrade complete ==="
echo ""
echo "Note: The following files were NOT synced (protected):"
echo "  - site.config.ts"
echo "  - docs/"
echo "  - public/favicon.svg"
echo "  - package.json"
echo ""
echo "Check package.json for new dependency changes in the upstream template."
