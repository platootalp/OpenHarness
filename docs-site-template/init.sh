#!/usr/bin/env bash
set -euo pipefail

echo "=== docs-site-template init ==="
echo ""

# --- 1. Interactive questions ---
read -rp "Site name [My Docs]: " SITE_NAME
SITE_NAME="${SITE_NAME:-My Docs}"

read -rp "Site description [Documentation site]: " SITE_DESC
SITE_DESC="${SITE_DESC:-Documentation site}"

read -rp "Site URL [https://example.com]: " SITE_URL
SITE_URL="${SITE_URL:-https://example.com}"

read -rp "Keep sample docs? [Y/n]: " KEEP_SAMPLES
KEEP_SAMPLES="${KEEP_SAMPLES:-Y}"

echo ""
echo "--- Summary ---"
echo "  Name:        $SITE_NAME"
echo "  Description: $SITE_DESC"
echo "  URL:         $SITE_URL"
echo "  Keep samples: $KEEP_SAMPLES"
echo ""

read -rp "Proceed? [Y/n]: " CONFIRM
CONFIRM="${CONFIRM:-Y}"
if [[ ! "$CONFIRM" =~ ^[Yy] ]]; then
  echo "Aborted."
  exit 1
fi

# --- 2. Replace placeholders ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# site.config.ts
sed -i.bak "s|__SITE_NAME__|${SITE_NAME}|g" "$SCRIPT_DIR/site.config.ts"
sed -i.bak "s|__SITE_DESC__|${SITE_DESC}|g" "$SCRIPT_DIR/site.config.ts"
sed -i.bak "s|__SITE_URL__|${SITE_URL}|g" "$SCRIPT_DIR/site.config.ts"
rm -f "$SCRIPT_DIR/site.config.ts.bak"

# package.json
sed -i.bak "s|__SITE_NAME__|${SITE_NAME}|g" "$SCRIPT_DIR/package.json"
rm -f "$SCRIPT_DIR/package.json.bak"

# public/robots.txt
sed -i.bak "s|__SITE_URL__|${SITE_URL}|g" "$SCRIPT_DIR/public/robots.txt"
rm -f "$SCRIPT_DIR/public/robots.txt.bak"

# docs/index.md
sed -i.bak "s|__SITE_NAME__|${SITE_NAME}|g" "$SCRIPT_DIR/docs/index.md"
sed -i.bak "s|__SITE_DESC__|${SITE_DESC}|g" "$SCRIPT_DIR/docs/index.md"
rm -f "$SCRIPT_DIR/docs/index.md.bak"

# --- 3. Clean up sample docs if not wanted ---
if [[ ! "$KEEP_SAMPLES" =~ ^[Yy] ]]; then
  rm -rf "$SCRIPT_DIR/docs/getting-started.md"
  rm -rf "$SCRIPT_DIR/docs/guide"
  cat > "$SCRIPT_DIR/docs/index.md" <<HEREDOC
---
title: "${SITE_NAME}"
description: "${SITE_DESC}"
---

# Welcome to ${SITE_NAME}

Add your documentation here.
HEREDOC
fi

# --- 4. Initialize ---
echo ""
echo "Initializing project..."

cd "$SCRIPT_DIR"

if [ ! -d ".git" ]; then
  git init
fi

npm install --legacy-peer-deps

echo ""
echo "=== Done! ==="
echo ""
echo "Next steps:"
echo "  1. Edit docs/ to add your content"
echo "  2. Edit site.config.ts to customize navigation and features"
echo "  3. Run: npm run dev"
echo ""

# --- 5. Self-delete ---
rm -- "$0"
echo "(init.sh has been removed)"
