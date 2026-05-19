---
title: "Configuration"
description: "How to configure your docs site"
---

# Configuration

All site configuration lives in `site.config.ts` at the project root.

## Site Info

| Field | Description |
|-------|-------------|
| `name` | Site title shown in nav and hero |
| `description` | Site description for meta tags |
| `url` | Canonical site URL |

## Navigation

The `nav` array defines top navigation links. Each entry has `label` and `href`.

## Sidebar

Set `sidebar.auto: true` to auto-generate from `docs/` directory structure, or `false` with manual `groups`.

## Features

Toggle features on/off in the `features` object: search, mermaid, callout, readingProgress, themeToggle, keyboardShortcuts.
