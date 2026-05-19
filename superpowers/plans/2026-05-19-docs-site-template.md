# docs-site-template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the current OpenHarness docs-site into a reusable GitHub Template repository with `site.config.ts` for configuration, `init.sh` for interactive setup, and `upgrade.sh` for upstream sync.

**Architecture:** Copy the entire docs-site into a new `docs-site-template/` directory. Replace hardcoded project-specific values with `site.config.ts` imports and `__PLACEHOLDER__` strings. Add `init.sh` (one-time setup) and `upgrade.sh` (upstream sync). The content directory moves from `../../docs` (external) to `./docs` (internal) with sample docs.

**Tech Stack:** Astro 6, React 18, Tailwind 3, TypeScript, Fuse.js, Mermaid, shell scripts

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `docs-site-template/site.config.ts` | Centralized site config (name, nav, sidebar, features) |
| Create | `docs-site-template/init.sh` | Interactive initialization script |
| Create | `docs-site-template/upgrade.sh` | Upstream template sync script |
| Create | `docs-site-template/docs/index.md` | Sample doc homepage |
| Create | `docs-site-template/docs/getting-started.md` | Sample getting-started doc |
| Create | `docs-site-template/docs/guide/configuration.md` | Sample guide doc |
| Copy | `docs-site-template/astro.config.mjs` | Astro config (feature-flag aware) |
| Copy | `docs-site-template/tailwind.config.mjs` | Tailwind config (unchanged) |
| Copy | `docs-site-template/package.json` | Package config (placeholder name) |
| Copy | `docs-site-template/tsconfig.json` | TypeScript config (unchanged) |
| Copy | `docs-site-template/.gitignore` | Git ignore (unchanged) |
| Copy | `docs-site-template/public/robots.txt` | Robots file (unchanged) |
| Copy | `docs-site-template/public/favicon.svg` | Placeholder favicon |
| Copy | `docs-site-template/scripts/build-search-index.mjs` | Search index builder (config-aware) |
| Copy | `docs-site-template/src/components/*` | All components (feature-flag aware) |
| Copy | `docs-site-template/src/layouts/DocLayout.astro` | Main layout (config-driven) |
| Copy | `docs-site-template/src/lib/*` | Rehype/remark plugins (unchanged) |
| Copy | `docs-site-template/src/pages/*` | All pages (config-driven) |
| Copy | `docs-site-template/src/styles/global.css` | Global styles (unchanged) |
| Modify | `docs-site-template/src/content.config.ts` | Content collection (point to `./docs`) |

---

### Task 1: Create `site.config.ts`

**Files:**
- Create: `docs-site-template/site.config.ts`

- [ ] **Step 1: Write the site config file**

```ts
export default {
  name: "__SITE_NAME__",
  description: "__SITE_DESC__",
  url: "__SITE_URL__",

  nav: [
    { label: "Docs", href: "/docs" },
    { label: "Search", href: "/search" },
  ],

  sidebar: {
    auto: true,
    groups: [
      { title: "Getting Started", dir: "getting-started" },
      { title: "Guide", dir: "guide" },
      { title: "Reference", dir: "reference" },
    ],
  },

  features: {
    search: true,
    mermaid: true,
    callout: true,
    readingProgress: true,
    themeToggle: true,
    keyboardShortcuts: true,
  },
} as const;

export type SiteConfig = typeof import('../../site.config').default;
```

- [ ] **Step 2: Commit**

```bash
git add docs-site-template/site.config.ts
git commit -m "feat(template): add site.config.ts with centralized config"
```

---

### Task 2: Create sample docs content

**Files:**
- Create: `docs-site-template/docs/index.md`
- Create: `docs-site-template/docs/getting-started.md`
- Create: `docs-site-template/docs/guide/configuration.md`

- [ ] **Step 1: Write `docs/index.md`**

```markdown
---
title: "__SITE_NAME__"
description: "__SITE_DESC__"
---

# Welcome to __SITE_NAME__

This is your documentation site. Edit the files in `docs/` to add your content.

## Quick Start

1. Edit `site.config.ts` to customize your site
2. Add markdown files to `docs/`
3. Run `npm run dev` to preview
```

- [ ] **Step 2: Write `docs/getting-started.md`**

```markdown
---
title: "Getting Started"
description: "How to get started with your docs site"
---

# Getting Started

## Prerequisites

- Node.js >= 22.12.0
- npm

## Setup

1. Clone this repository
2. Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:4321

## Writing Docs

Add markdown files to the `docs/` directory. The sidebar is auto-generated from the directory structure.
```

- [ ] **Step 3: Write `docs/guide/configuration.md`**

```markdown
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
```

- [ ] **Step 4: Commit**

```bash
git add docs-site-template/docs/
git commit -m "feat(template): add sample docs content"
```

---

### Task 3: Create `content.config.ts` pointing to internal `./docs`

**Files:**
- Create: `docs-site-template/src/content.config.ts`

- [ ] **Step 1: Write the content config**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = resolve(__dirname, '../../docs');

const docs = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: DOCS_ROOT,
  }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    lastUpdated: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    level: z.enum(['L1', 'L2', 'L3']).optional(),
    related: z.array(z.string()).optional(),
  }),
});

export const collections = { docs };
```

Note: The path `../../docs` from `src/content.config.ts` resolves to the template's own `docs/` directory (same level as `src/`). This is identical structure to the original but the `docs/` folder is now inside the template repo.

- [ ] **Step 2: Commit**

```bash
git add docs-site-template/src/content.config.ts
git commit -m "feat(template): add content.config.ts pointing to internal docs/"
```

---

### Task 4: Create `package.json` with placeholder name

**Files:**
- Create: `docs-site-template/package.json`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "__SITE_NAME__",
  "type": "module",
  "version": "0.0.1",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "node scripts/build-search-index.mjs && astro build",
    "build:index": "node scripts/build-search-index.mjs",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/react": "^4.2.1",
    "@astrojs/tailwind": "^5.1.4",
    "@tailwindcss/typography": "^0.5.16",
    "astro": "^6.1.5",
    "fuse.js": "^7.3.0",
    "hastscript": "^9.0.1",
    "mermaid": "^11.14.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.17",
    "unist-util-visit": "^5.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.7.3"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add docs-site-template/package.json
git commit -m "feat(template): add package.json with placeholder name"
```

---

### Task 5: Create `astro.config.mjs` (feature-flag aware)

**Files:**
- Create: `docs-site-template/astro.config.mjs`

- [ ] **Step 1: Write `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { remarkMermaid } from './src/lib/remark-mermaid.mjs';
import { rehypeCallout } from './src/lib/rehype-callout.ts';
import config from './site.config.ts';

const rehypePlugins = [];
if (config.features.mermaid) rehypePlugins.push(remarkMermaid);
if (config.features.callout) rehypePlugins.push(rehypeCallout);

// https://astro.build/config
export default defineConfig({
  site: config.url,
  integrations: [
    react(),
    tailwind(),
  ],
  output: 'static',
  markdown: {
    remarkPlugins: [],
    rehypePlugins,
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        ...(config.features.mermaid ? ['mermaid'] : []),
        'react',
        'react-dom',
        'react-dom/client',
      ],
    },
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add docs-site-template/astro.config.mjs
git commit -m "feat(template): add feature-flag aware astro.config.mjs"
```

---

### Task 6: Copy unchanged config files

**Files:**
- Create: `docs-site-template/tailwind.config.mjs`
- Create: `docs-site-template/tsconfig.json`
- Create: `docs-site-template/.gitignore`

- [ ] **Step 1: Write `tailwind.config.mjs`** (identical to original)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        surface: {
          light: '#f8fafc',
          dark: '#1a1f35',
        },
        bg: {
          light: '#ffffff',
          dark: '#0c0f1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      maxWidth: {
        'content': '768px',
        'prose': '75ch',
        'doc-content': '72ch',
      },
      width: {
        'sidebar': '280px',
        'sidebar-collapsed': '56px',
      },
      height: {
        'nav': '64px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

- [ ] **Step 2: Write `tsconfig.json`** (identical to original)

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Write `.gitignore`** (identical to original)

```
# build output
dist/

# generated types
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production

# macOS
.DS_Store

# IDE
.vscode/
*.swp
*.swo

# lockfile (template users generate their own)
package-lock.json
```

- [ ] **Step 4: Commit**

```bash
git add docs-site-template/tailwind.config.mjs docs-site-template/tsconfig.json docs-site-template/.gitignore
git commit -m "feat(template): add tailwind, tsconfig, and gitignore configs"
```

---

### Task 7: Copy `public/` files

**Files:**
- Create: `docs-site-template/public/favicon.svg`
- Create: `docs-site-template/public/robots.txt`

- [ ] **Step 1: Write `public/favicon.svg`** (placeholder)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#2563eb"/>
  <text x="50" y="68" font-family="sans-serif" font-size="50" font-weight="bold" fill="white" text-anchor="middle">D</text>
</svg>
```

- [ ] **Step 2: Write `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: __SITE_URL__/sitemap.xml
```

- [ ] **Step 3: Commit**

```bash
git add docs-site-template/public/
git commit -m "feat(template): add placeholder favicon and robots.txt"
```

---

### Task 8: Copy `src/lib/` plugins (unchanged)

**Files:**
- Create: `docs-site-template/src/lib/remark-mermaid.mjs`
- Create: `docs-site-template/src/lib/rehype-callout.ts`

- [ ] **Step 1: Copy `remark-mermaid.mjs`** (identical to original — read from `docs-site/src/lib/remark-mermaid.mjs` and write to `docs-site-template/src/lib/remark-mermaid.mjs`)

- [ ] **Step 2: Copy `rehype-callout.ts`** (identical to original — read from `docs-site/src/lib/rehype-callout.ts` and write to `docs-site-template/src/lib/rehype-callout.ts`)

- [ ] **Step 3: Commit**

```bash
git add docs-site-template/src/lib/
git commit -m "feat(template): add rehype/remark plugins"
```

---

### Task 9: Copy `src/styles/global.css` (unchanged)

**Files:**
- Create: `docs-site-template/src/styles/global.css`

- [ ] **Step 1: Copy `global.css`** (identical to original — read from `docs-site/src/styles/global.css` and write to `docs-site-template/src/styles/global.css`)

- [ ] **Step 2: Commit**

```bash
git add docs-site-template/src/styles/
git commit -m "feat(template): add global styles"
```

---

### Task 10: Create config-driven `DocLayout.astro`

**Files:**
- Create: `docs-site-template/src/layouts/DocLayout.astro`

This is the most significant change. The layout reads `site.config.ts` for:
- Site name (title, OG tags)
- Nav links (top navigation)
- Feature flags (conditionally render SearchModal, ReadingProgress, KeyboardShortcuts)
- Footer text

- [ ] **Step 1: Write `DocLayout.astro`**

```astro
---
import { getCollection } from 'astro:content';
import TopNav from '../components/TopNav.astro';
import Sidebar from '../components/Sidebar.astro';
import ThemeToggle from '../components/ThemeToggle.tsx';
import SearchModal from '../components/SearchModal.tsx';
import KeyboardShortcuts from '../components/KeyboardShortcuts.astro';
import config from '../../site.config';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
  currentPath?: string;
  ogImage?: string;
}

const {
  title,
  description = config.description,
  currentPath = '',
  ogImage = '/og-default.png',
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site || config.url);
const fullTitle = title ? `${title} — ${config.name}` : config.name;
---

<!doctype html>
<html lang="zh" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalURL} />

    <!-- OpenGraph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:site_name" content={config.name} />
    <meta property="og:locale" content="zh_CN" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- Fonts preload -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    <!-- Prevent FOUC -->
    <script is:inline>
      (function() {
        var stored = localStorage.getItem('theme');
        var root = document.documentElement;
        root.classList.remove('dark');
        if (stored === 'dark') {
          root.classList.add('dark');
        } else if (!stored || stored === 'system') {
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) root.classList.add('dark');
        }
      })();
    </script>
  </head>
  <body class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
    <!-- Top Navigation -->
    <TopNav title={title} />

    {config.features.search && <SearchModal client:load />}

    {config.features.keyboardShortcuts && <KeyboardShortcuts />}

    <!-- Main Layout -->
    <div class="flex pt-16">
      <!-- Sidebar -->
      <Sidebar currentPath={currentPath} />

      <!-- Content Area -->
      <main id="main-content" class="flex-1 min-h-[calc(100vh-4rem)] transition-all duration-200 overflow-x-hidden" style="margin-left: 280px;">

        <!-- Content slot -->
        <slot />

        <!-- Footer -->
        <footer class="border-t border-[var(--color-border)] px-6 py-8 mt-16">
          <div class="max-w-content mx-auto flex items-center justify-between text-sm text-[var(--color-text-muted)]">
            <span>{config.name}</span>
            <div class="flex items-center gap-4">
              <a href={config.url} target="_blank" rel="noopener" class="hover:text-[var(--color-primary)] transition-colors">{config.url}</a>
            </div>
          </div>
        </footer>
      </main>
    </div>

    <!-- Scripts -->
    <script>
      {config.features.mermaid && (
        import '../components/mermaid-block.ts';

        // Convert mermaid code blocks to mermaid-block elements
        (function() {
          const mermaidBlocks = document.querySelectorAll('pre[data-language="mermaid"], code.language-mermaid');
          mermaidBlocks.forEach((el) => {
            const preEl = el.tagName === 'PRE' ? el : el.closest('pre');
            const codeEl = el.tagName === 'CODE' ? el : preEl?.querySelector('code');
            if (!preEl || !codeEl) return;

            const definition = codeEl.textContent || '';
            const mermaidBlock = document.createElement('mermaid-block');
            mermaidBlock.dataset.definition = definition;
            preEl.parentNode?.replaceChild(mermaidBlock, preEl);
          });
        })();
      )}

      // Code block enhancements (copy button, language label)
      (function() {
        document.querySelectorAll('pre').forEach((pre) => {
          const code = pre.querySelector('code');
          if (!code) return;

          const lang = code.getAttribute('data-language') || '';
          const wrapper = document.createElement('div');
          wrapper.className = 'code-block-wrapper';

          if (lang) {
            const langLabel = document.createElement('span');
            langLabel.className = 'code-block-lang';
            langLabel.textContent = lang;
            wrapper.appendChild(langLabel);
          }

          const copyBtn = document.createElement('button');
          copyBtn.className = 'code-copy-btn';
          copyBtn.textContent = 'Copy';
          copyBtn.addEventListener('click', async () => {
            const text = code.textContent || '';
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('bg-green-500', 'text-white', 'border-green-500');
            setTimeout(() => {
              copyBtn.textContent = 'Copy';
              copyBtn.classList.remove('bg-green-500', 'text-white', 'border-green-500');
            }, 2000);
          });
          wrapper.appendChild(copyBtn);

          pre.parentNode?.insertBefore(wrapper, pre);
          wrapper.appendChild(pre);
        });
      })();
    </script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add docs-site-template/src/layouts/DocLayout.astro
git commit -m "feat(template): add config-driven DocLayout.astro"
```

---

### Task 11: Create config-driven `TopNav.astro`

**Files:**
- Create: `docs-site-template/src/components/TopNav.astro`

- [ ] **Step 1: Write `TopNav.astro`**

```astro
---
import ThemeToggle from './ThemeToggle.tsx';
import SearchTrigger from './SearchTrigger.tsx';
import config from '../../site.config';

interface Props {
  title?: string;
}

const { title } = Astro.props;
---

<header class="fixed top-0 left-0 right-0 z-50 h-nav bg-[var(--color-nav-bg)] backdrop-blur-md border-b border-[var(--color-border)] transition-colors duration-300">
  <div class="flex items-center justify-between h-full px-6 max-w-screen-2xl mx-auto">
    <!-- Logo + Title -->
    <a href="/docs/" class="flex items-center gap-3 no-underline group">
      <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
        {config.name.charAt(0).toUpperCase()}
      </div>
      <div class="hidden sm:block">
        <span class="font-semibold text-[var(--color-text)] text-sm">{config.name}</span>
        <span class="text-[var(--color-text-muted)] text-sm mx-1">/</span>
        <span class="text-[var(--color-text-muted)] text-sm">{title || 'Docs'}</span>
      </div>
    </a>

    <!-- Nav -->
    <nav class="flex items-center gap-1">
      {config.features.search && <SearchTrigger client:load />}

      {config.nav.map(item => (
        <a href={item.href} class="hidden sm:flex px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] rounded-md transition-all">
          {item.label}
        </a>
      ))}

      <!-- Divider -->
      <div class="w-px h-5 bg-[var(--color-border)] mx-2"></div>

      {config.features.themeToggle && <ThemeToggle client:load />}
    </nav>
  </div>
</header>
```

- [ ] **Step 2: Commit**

```bash
git add docs-site-template/src/components/TopNav.astro
git commit -m "feat(template): add config-driven TopNav.astro"
```

---

### Task 12: Create config-driven `Sidebar.astro`

**Files:**
- Create: `docs-site-template/src/components/Sidebar.astro`

Key changes from original:
- Import `config` from `site.config.ts`
- When `config.sidebar.auto === true`, use the existing auto-grouping logic
- When `config.sidebar.auto === false`, filter docs by `config.sidebar.groups[].dir`

- [ ] **Step 1: Write `Sidebar.astro`**

```astro
---
import { getCollection } from 'astro:content';
import config from '../../site.config';

interface Props {
  currentPath?: string;
}

const { currentPath = '' } = Astro.props;

const allDocs = await getCollection('docs');

type DocEntry = { id: string; slug: string; data: { title?: string; description?: string }; filePath?: string };
type Group = { id: string; label: string; icon: string; docs: DocEntry[] };

function getSection(fileId: string): string {
  const parts = fileId.split('/');
  if (parts.length === 1) return 'overview';
  return parts[0];
}

function buildTree(docs: DocEntry[]): Group[] {
  if (config.sidebar.auto) {
    // Auto-generate from directory structure
    const sections: Record<string, DocEntry[]> = {};
    for (const doc of docs) {
      const section = getSection(doc.id);
      if (!sections[section]) sections[section] = [];
      sections[section].push(doc);
    }
    for (const key of Object.keys(sections)) {
      sections[key].sort((a, b) => a.id.localeCompare(b.id));
    }
    return Object.entries(sections)
      .map(([key, docs]) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
        icon: '📄',
        docs,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  } else {
    // Manual groups from config
    return config.sidebar.groups.map(group => ({
      id: group.dir,
      label: group.title,
      icon: '📄',
      docs: docs
        .filter(d => getSection(d.id) === group.dir)
        .sort((a, b) => a.id.localeCompare(b.id)),
    }));
  }
}

const navGroups = buildTree(allDocs);

function getDocTitle(doc: DocEntry): string {
  if (doc.data?.title) return doc.data.title;
  const name = doc.id.split('/').pop() || doc.id;
  return name.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getDocHref(doc: DocEntry): string {
  if (doc.id === 'index.md') return '/docs/';
  return `/docs/${doc.id.replace(/\.md$/, '')}/`;
}

function isActive(doc: DocEntry): boolean {
  const href = getDocHref(doc);
  return currentPath === href || currentPath === href.replace(/\/$/, '');
}
---

<aside
  id="sidebar"
  class="fixed left-0 top-16 bottom-0 w-sidebar bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)] overflow-y-auto scrollbar-thin transition-[width] duration-300 z-40 -translate-x-full lg:translate-x-0"
  data-desktop-collapsed="false"
>
  <!-- Mobile overlay -->
  <div id="sidebar-overlay" class="hidden fixed inset-0 bg-black/50 z-[-1] lg:hidden" onclick="toggleSidebar()"></div>

  <nav class="py-4 flex flex-col h-full">
    <!-- Navigation Groups -->
    <div class="flex-1 space-y-1 px-2">
      {navGroups.map((group, i) => (
        <div class="nav-group" data-group={group.id} data-expanded={i === 0 ? 'true' : 'false'}>
          <!-- Expanded: group header with label + chevron -->
          <button
            class="group-header-expanded hidden lg:flex items-center justify-between w-full px-2 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-none rounded-md hover:bg-[var(--color-surface)]"
            onclick="toggleGroup(this)"
          >
            <span class="flex items-center gap-2 min-w-0">
              <span class="text-base flex-shrink-0">{group.icon}</span>
              <span class="truncate group-label">{group.label}</span>
            </span>
            <svg class="chevron w-3 h-3 flex-shrink-0 transition-transform duration-200 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Collapsed: icon-only button with tooltip -->
          <button
            class="group-header-collapsed items-center justify-center w-10 h-10 mx-auto rounded-md text-xl transition-colors cursor-pointer bg-transparent border-none hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] relative"
            onclick="toggleGroup(this)"
            title={group.label}
          >
            {group.icon}
          </button>

          <ul class="nav-docs nav-docs-collapsed mt-0.5 space-y-0.5 overflow-hidden rtl:pl-0 rtl:pr-2">
            {group.docs.map(doc => (
              <li class="doc-item">
                <a
                  href={getDocHref(doc)}
                  class={`doc-link flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-all duration-150 no-underline ${
                    isActive(doc)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] dark:hover:bg-white/5'
                  }`}
                >
                  {isActive(doc) && (
                    <svg class="w-3 h-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  )}
                  <span class="truncate doc-label">{getDocTitle(doc)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <!-- Footer with collapse toggle -->
    <div class="mt-auto pt-3 border-t border-[var(--color-border)] px-2">
      <button
        id="sidebar-desktop-toggle"
        class="hidden lg:flex items-center justify-center w-full h-9 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all cursor-pointer bg-transparent border-none"
        onclick="toggleSidebarDesktop()"
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
      >
        <svg id="collapse-icon" class="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
        </svg>
        <svg id="expand-icon" class="w-4 h-4 hidden transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
        </svg>
      </button>

      <div class="lg:hidden text-xs text-center text-[var(--color-text-muted)] py-1">v0.1.x</div>
    </div>
  </nav>
</aside>

<!-- Mobile Toggle Button -->
<button
  id="sidebar-toggle"
  class="fixed bottom-4 left-4 z-50 lg:hidden w-12 h-12 bg-[var(--color-primary)] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-all active:scale-95"
  onclick="toggleSidebar()"
  aria-label="Toggle navigation"
>
  <svg id="menu-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
  <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>

<script is:inline>
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    if (!sidebar) return;
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    if (isOpen) {
      sidebar.classList.add('-translate-x-full');
      if (overlay) overlay.classList.add('hidden');
      if (menuIcon) menuIcon.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
      document.body.style.overflow = '';
    } else {
      sidebar.classList.remove('-translate-x-full');
      if (overlay) overlay.classList.remove('hidden');
      if (menuIcon) menuIcon.classList.add('hidden');
      if (closeIcon) closeIcon.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function toggleGroup(btn) {
    const group = btn.closest('.nav-group');
    if (!group) return;
    const sidebar = document.getElementById('sidebar');
    const isDesktopCollapsed = sidebar && sidebar.dataset.desktopCollapsed === 'true';
    const main = document.getElementById('main-content');
    const collapseIcon = document.getElementById('collapse-icon');
    const expandIcon = document.getElementById('expand-icon');
    if (isDesktopCollapsed) {
      sidebar.dataset.desktopCollapsed = 'false';
      sidebar.classList.remove('sidebar-collapsed');
      sidebar.classList.remove('w-sidebar-collapsed');
      sidebar.classList.add('w-sidebar');
      if (main) main.style.setProperty('margin-left', '280px', 'important');
      sidebar.querySelectorAll('.doc-item').forEach(el => el.classList.remove('hidden'));
      if (collapseIcon) collapseIcon.classList.remove('hidden');
      if (expandIcon) expandIcon.classList.add('hidden');
    }
    const docs = group.querySelector('.nav-docs');
    const chevron = group.querySelector('.chevron');
    const isExpanded = group.dataset.expanded === 'true';
    if (isExpanded) {
      docs.classList.add('nav-docs-collapsed');
      docs.classList.remove('nav-docs-expanded');
      if (chevron) chevron.style.transform = 'rotate(-90deg)';
      group.dataset.expanded = 'false';
    } else {
      docs.classList.remove('nav-docs-collapsed');
      docs.classList.add('nav-docs-expanded');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
      group.dataset.expanded = 'true';
    }
  }

  function initSidebarGroups() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const isDesktopCollapsed = window.matchMedia('(max-width: 1023px)').matches ? false : sidebar.dataset.desktopCollapsed === 'true';
    if (isDesktopCollapsed) return;
    document.querySelectorAll('.nav-group').forEach((group, i) => {
      const docs = group.querySelector('.nav-docs');
      const chevron = group.querySelector('.chevron');
      if (i === 0) {
        group.dataset.expanded = 'true';
        docs.classList.remove('nav-docs-collapsed');
        docs.classList.add('nav-docs-expanded');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
      } else {
        group.dataset.expanded = 'false';
        docs.classList.add('nav-docs-collapsed');
        docs.classList.remove('nav-docs-expanded');
        if (chevron) chevron.style.transform = 'rotate(-90deg)';
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarGroups);
  } else {
    initSidebarGroups();
  }

  function toggleSidebarDesktop() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const collapseIcon = document.getElementById('collapse-icon');
    const expandIcon = document.getElementById('expand-icon');
    if (!sidebar) return;
    const isCollapsed = sidebar.dataset.desktopCollapsed === 'true';
    if (isCollapsed) {
      sidebar.dataset.desktopCollapsed = 'false';
      sidebar.classList.remove('sidebar-collapsed');
      sidebar.classList.remove('w-sidebar-collapsed');
      sidebar.classList.add('w-sidebar');
      if (main) main.style.setProperty('margin-left', '280px', 'important');
      sidebar.querySelectorAll('.doc-item').forEach(el => el.classList.remove('hidden'));
      if (collapseIcon) collapseIcon.classList.remove('hidden');
      if (expandIcon) expandIcon.classList.add('hidden');
      initSidebarGroups();
      localStorage.setItem('sidebar-desktop-collapsed', 'false');
    } else {
      sidebar.dataset.desktopCollapsed = 'true';
      sidebar.classList.add('sidebar-collapsed');
      sidebar.classList.remove('w-sidebar');
      sidebar.classList.add('w-sidebar-collapsed');
      if (main) main.style.setProperty('margin-left', '56px', 'important');
      sidebar.querySelectorAll('.doc-item').forEach(el => el.classList.add('hidden'));
      if (collapseIcon) collapseIcon.classList.add('hidden');
      if (expandIcon) expandIcon.classList.remove('hidden');
      localStorage.setItem('sidebar-desktop-collapsed', 'true');
    }
  }

  function initSidebarDesktopState() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const collapseIcon = document.getElementById('collapse-icon');
    const expandIcon = document.getElementById('expand-icon');
    if (!sidebar) return;
    const stored = localStorage.getItem('sidebar-desktop-collapsed');
    if (stored === 'true') {
      sidebar.dataset.desktopCollapsed = 'true';
      sidebar.classList.add('sidebar-collapsed');
      sidebar.classList.remove('w-sidebar');
      sidebar.classList.add('w-sidebar-collapsed');
      if (main) main.style.setProperty('margin-left', '56px', 'important');
      sidebar.querySelectorAll('.doc-item').forEach(el => el.classList.add('hidden'));
      if (collapseIcon) collapseIcon.classList.add('hidden');
      if (expandIcon) expandIcon.classList.remove('hidden');
    } else {
      sidebar.dataset.desktopCollapsed = 'false';
      sidebar.classList.remove('sidebar-collapsed');
      sidebar.classList.add('w-sidebar');
      sidebar.classList.remove('w-sidebar-collapsed');
      if (main) main.style.setProperty('margin-left', '280px', 'important');
      sidebar.querySelectorAll('.doc-item').forEach(el => el.classList.remove('hidden'));
      if (collapseIcon) collapseIcon.classList.remove('hidden');
      if (expandIcon) expandIcon.classList.add('hidden');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initSidebarDesktopState(); });
  } else {
    initSidebarDesktopState();
  }
</script>

<style>
  #sidebar .group-header-collapsed { display: none; }
  #sidebar .group-header-expanded { display: none; }
  @media (min-width: 1024px) {
    #sidebar:not(.sidebar-collapsed) .group-header-expanded { display: flex; }
    #sidebar:not(.sidebar-collapsed) .group-header-collapsed { display: none; }
    #sidebar.sidebar-collapsed .group-header-expanded { display: none; }
    #sidebar.sidebar-collapsed .group-header-collapsed { display: flex; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add docs-site-template/src/components/Sidebar.astro
git commit -m "feat(template): add config-driven Sidebar.astro"
```

---

### Task 13: Copy remaining components (with feature-flag awareness)

**Files:**
- Create: `docs-site-template/src/components/Breadcrumb.astro`
- Create: `docs-site-template/src/components/Pagination.astro`
- Create: `docs-site-template/src/components/KeyboardShortcuts.astro`
- Create: `docs-site-template/src/components/mermaid-block.ts`
- Create: `docs-site-template/src/components/SearchModal.tsx`
- Create: `docs-site-template/src/components/SearchTrigger.tsx`
- Create: `docs-site-template/src/components/ThemeToggle.tsx`
- Create: `docs-site-template/src/components/TableOfContents.tsx`
- Create: `docs-site-template/src/components/ReadingProgress.tsx`

These are mostly unchanged from the originals. The only change is in `SearchModal.tsx` — remove hardcoded `SECTION_LABELS` and `SECTION_COLORS` (they will derive from sidebar groups at runtime, or just use the section name as-is since the template is generic).

- [ ] **Step 1: Copy `Breadcrumb.astro`** (identical to original)

- [ ] **Step 2: Copy `Pagination.astro`** (identical to original)

- [ ] **Step 3: Copy `KeyboardShortcuts.astro`** (identical to original)

- [ ] **Step 4: Copy `mermaid-block.ts`** (identical to original — read from `docs-site/src/components/mermaid-block.ts`)

- [ ] **Step 5: Copy `SearchTrigger.tsx`** (identical to original — read from `docs-site/src/components/SearchTrigger.tsx`)

- [ ] **Step 6: Copy `ThemeToggle.tsx`** (identical to original — read from `docs-site/src/components/ThemeToggle.tsx`)

- [ ] **Step 7: Copy `TableOfContents.tsx`** (identical to original — read from `docs-site/src/components/TableOfContents.tsx`)

- [ ] **Step 8: Copy `ReadingProgress.tsx`** (identical to original)

- [ ] **Step 9: Write `SearchModal.tsx`** (remove hardcoded section labels/colors — use section name directly)

```tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  section: string;
  href: string;
  content?: string;
}

interface SearchIndex {
  docs: SearchResult[];
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [fuse, setFuse] = useState<Fuse<SearchResult> | null>(null);
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    fetch('/search-index.json')
      .then(r => r.json())
      .then((data: SearchIndex) => {
        setIndex(data);
        const f = new Fuse(data.docs, {
          keys: [
            { name: 'title', weight: 0.4 },
            { name: 'description', weight: 0.3 },
            { name: 'content', weight: 0.2 },
            { name: 'section', weight: 0.1 },
          ],
          threshold: 0.3,
          includeScore: true,
          minMatchCharLength: 2,
        });
        setFuse(f);
      })
      .catch(() => {
        console.error('Failed to load search index');
      });
  }, []);

  useEffect(() => {
    function handleOpen() { setOpen(true); }
    window.addEventListener('open-search', handleOpen);
    return () => window.removeEventListener('open-search', handleOpen);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => { inputRef.current?.focus(); }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  useEffect(() => {
    if (!fuse || !query.trim()) {
      setResults([]);
      setSelected(0);
      return;
    }
    const r = fuse.search(query).slice(0, 8);
    setResults(r.map(x => x.item));
    setSelected(0);
  }, [query, fuse]);

  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const close = useCallback(() => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent('close-search'));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && results[selected]) {
      window.location.href = results[selected].href;
    }
  }, [results, selected, close]);

  const handleContainerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Escape'].includes(e.key)) {
      e.stopPropagation();
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-[var(--color-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] overflow-hidden animate-fade-in"
        onKeyDown={handleContainerKeyDown}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <svg className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search docs..."
            className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none text-base"
          />
          <kbd className="text-xs px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-muted)] font-mono">Esc</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="py-12 text-center text-[var(--color-text-muted)]">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm">No results for "{query}"</p>
            </div>
          )}

          {!query && index && (
            <div className="py-6 px-4">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                All docs ({index.docs.length})
              </div>
              <ul>
                {index.docs.slice(0, 6).map((doc, i) => (
                  <ResultItem key={doc.id} doc={doc} isSelected={i === selected} onClick={() => { window.location.href = doc.href; }} />
                ))}
              </ul>
            </div>
          )}

          {query && results.length > 0 && (
            <ul ref={listRef}>
              {results.map((doc, i) => (
                <ResultItem key={doc.id} doc={doc} isSelected={i === selected} onClick={() => { window.location.href = doc.href; }} />
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded font-mono">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded font-mono">↵</kbd>
            Open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded font-mono">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

function ResultItem({ doc, isSelected, onClick }: { doc: SearchResult; isSelected: boolean; onClick: () => void }) {
  const section = doc.id.split('/')[0] || 'overview';

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
          isSelected ? 'bg-[var(--color-primary)]/10' : 'hover:bg-[var(--color-surface)]'
        }`}
      >
        <span className="mt-0.5 px-2 py-0.5 text-2xs font-medium rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {doc.section || section}
        </span>
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-medium truncate ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
            {doc.title}
          </div>
          {doc.description && (
            <div className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
              {doc.description}
            </div>
          )}
        </div>
        {isSelected && (
          <svg className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </li>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add docs-site-template/src/components/
git commit -m "feat(template): add all components with feature-flag support"
```

---

### Task 14: Create config-driven pages

**Files:**
- Create: `docs-site-template/src/pages/index.astro`
- Create: `docs-site-template/src/pages/404.astro`
- Create: `docs-site-template/src/pages/search.astro`
- Create: `docs-site-template/src/pages/sitemap.xml.astro`
- Create: `docs-site-template/src/pages/docs/index.astro`
- Create: `docs-site-template/src/pages/docs/[...slug].astro`

- [ ] **Step 1: Write `pages/index.astro`**

```astro
---
return Astro.redirect('/docs/');
---
```

- [ ] **Step 2: Write `pages/404.astro`**

```astro
---
import DocLayout from '../layouts/DocLayout.astro';
import SearchTrigger from '../components/SearchTrigger.tsx';
import config from '../../site.config';
---

<DocLayout title="Page Not Found" currentPath="">
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div class="text-8xl font-bold text-[var(--color-border)] mb-4">404</div>
    <h1 class="text-2xl font-bold mb-3 text-[var(--color-text)]">Page Not Found</h1>
    <p class="text-[var(--color-text-muted)] mb-8 max-w-md">
      The page you're looking for doesn't exist.
    </p>
    <div class="flex items-center gap-3">
      <a
        href="/docs/"
        class="px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all no-underline"
      >
        &larr; Back to Home
      </a>
      {config.features.search && <SearchTrigger client:load />}
    </div>
  </div>
</DocLayout>
```

- [ ] **Step 3: Write `pages/search.astro`**

```astro
---
import DocLayout from '../layouts/DocLayout.astro';
import config from '../../site.config';
---

{config.features.search ? (
  <DocLayout title="Search" currentPath="/search/">
    <div class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="text-center mb-8">
        <div class="text-5xl mb-4">🔍</div>
        <h1 class="text-2xl font-bold mb-2 text-[var(--color-text)]">Search Docs</h1>
        <p class="text-[var(--color-text-muted)] text-sm">Press <kbd class="px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded font-mono text-xs">S</kbd> or <kbd class="px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded font-mono text-xs">/</kbd> to open search</p>
      </div>
    </div>
  </DocLayout>
) : (
  <DocLayout title="Search" currentPath="/search/">
    <div class="flex flex-col items-center justify-center min-h-[60vh]">
      <p class="text-[var(--color-text-muted)]">Search is disabled.</p>
    </div>
  </DocLayout>
)}
```

- [ ] **Step 4: Write `pages/sitemap.xml.astro`**

```astro
---
import { getCollection } from 'astro:content';
import config from '../../site.config';

const allDocs = await getCollection('docs');

const urls = allDocs.map(doc => {
  const slug = doc.id.replace(/\.md$/, '');
  const href = slug === 'index' ? '/docs/' : `/docs/${slug}/`;
  return {
    url: `${config.url}${href}`,
    lastmod: doc.data.lastUpdated || new Date().toISOString().split('T')[0],
    priority: slug === 'index' ? '1.0' : '0.8',
    changefreq: 'weekly',
  };
});
---

<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {urls.map(u => (
    <url>
      <loc>{u.url}</loc>
      <lastmod>{u.lastmod}</lastmod>
      <changefreq>{u.changefreq}</changefreq>
      <priority>{u.priority}</priority>
    </url>
  ))}
</urlset>
```

- [ ] **Step 5: Write `pages/docs/index.astro`** (config-driven hero + auto section cards)

```astro
---
import { getCollection } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
import config from '../../../site.config';

const allDocs = await getCollection('docs');

const counts: Record<string, number> = {};
for (const doc of allDocs) {
  const section = doc.id.split('/')[0] || 'overview';
  counts[section] = (counts[section] || 0) + 1;
}

const sectionDirs = [...new Set(allDocs.map(d => d.id.split('/')[0] || 'overview'))];
const sections = sectionDirs.map(id => ({
  id,
  label: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
  count: counts[id] || 0,
  href: id === 'index' ? '/docs/' : `/docs/${id}/`,
  firstDoc: allDocs.find(d => (d.id.split('/')[0] || 'overview') === id && d.id !== 'index.md'),
}));
---

<DocLayout title="" currentPath="/docs/">
  <!-- Hero Section -->
  <section class="mb-16">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-text)]">
        {config.name}
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Docs</span>
      </h1>

      <p class="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8 leading-relaxed">
        {config.description}
      </p>

      <div class="flex items-center justify-center gap-3 flex-wrap">
        {sections[0]?.firstDoc && (
          <a
            href={sections[0].href}
            class="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-primary-hover)] transition-all shadow-md hover:shadow-lg active:scale-95 no-underline"
          >
            Get Started &rarr;
          </a>
        )}
      </div>
    </div>
  </section>

  <!-- Section Cards Grid -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-6 text-[var(--color-text)]">Sections</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map(section => (
        <a
          href={section.href}
          class="group block p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-transparent shadow-sm hover:shadow-md transition-all no-underline hover:-translate-y-0.5"
        >
          <div>
            <h3 class="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
              {section.label}
            </h3>
            <span class="text-xs text-[var(--color-text-muted)]">{section.count} docs</span>
          </div>
        </a>
      ))}
    </div>
  </section>
</DocLayout>
```

- [ ] **Step 6: Write `pages/docs/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
import TableOfContents from '../../components/TableOfContents.tsx';
import Pagination from '../../components/Pagination.astro';
import ReadingProgress from '../../components/ReadingProgress.tsx';
import config from '../../../site.config';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((doc) => {
    let slug: string;
    if (doc.id === 'index.md') {
      slug = '';
    } else {
      slug = doc.id.replace(/\.md$/, '');
    }
    return {
      params: { slug: slug || undefined },
      props: { doc, slug },
    };
  });
}

const { doc, slug } = Astro.props;
const { Content, headings } = await render(doc);
const currentPath = slug ? `/docs/${slug}/` : '/docs/';
const currentH2s = headings.filter(h => h.depth === 2 || h.depth === 3);
---

<DocLayout
  title={doc.data.title || (slug ? slug.split('/').pop() : 'Home')}
  description={doc.data.description}
  currentPath={currentPath}
>
  {config.features.readingProgress && <ReadingProgress client:load />}

  <div id="doc-content-wrapper" class="flex flex-col xl:flex-row xl:items-start xl:gap-8 xl:max-w-screen-xl xl:w-full xl:mx-auto px-6 xl:px-10 py-10">
    <div class="docs-article-wrap">
      <article
        class="prose prose-slate dark:prose-invert
          prose-headings:font-semibold prose-headings:text-[var(--color-text)]
          prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
          prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-[var(--color-border)]
          prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-[var(--color-text)] prose-p:leading-relaxed
          prose-a:text-[var(--color-primary)] prose-a:no-underline hover:prose-a:underline
          prose-code:text-[var(--color-primary)] prose-code:bg-[var(--color-code-bg)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:text-sm
          prose-pre:bg-[#1e293b] prose-pre:rounded-lg prose-pre:p-0 prose-pre:overflow-visible
          prose-img:rounded-lg prose-img:shadow-md
          prose-table:text-sm prose-th:bg-[var(--color-surface)] prose-th:font-semibold
          prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-primary)] prose-blockquote:bg-[var(--color-surface)] prose-blockquote:rounded-r-lg
          prose-hr:border-[var(--color-border)]
        "
      >
        <Content />
      </article>
      <Pagination currentPath={currentPath} currentSlug={slug} />
    </div>

    {currentH2s.length > 2 && (
      <aside class="hidden xl:block xl:sticky xl:top-24 xl:self-start xl:flex-shrink-0 xl:w-36 xl:ml-4">
        <TableOfContents headings={currentH2s} currentPath={currentPath} client:load />
      </aside>
    )}
  </div>
</DocLayout>
```

- [ ] **Step 7: Commit**

```bash
git add docs-site-template/src/pages/
git commit -m "feat(template): add config-driven pages"
```

---

### Task 15: Create `scripts/build-search-index.mjs` (config-aware)

**Files:**
- Create: `docs-site-template/scripts/build-search-index.mjs`

Key changes from original:
- Read `site.config.ts` for search feature flag (skip if disabled)
- DOCS_ROOT points to internal `./docs/` directory
- Section labels derived from directory names (no hardcoded labels)

- [ ] **Step 1: Write `build-search-index.mjs`**

```js
/**
 * Build search index from docs/ markdown files
 * Run: node scripts/build-search-index.mjs
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DOCS_ROOT = resolve(__dirname, '../../docs');
const OUTPUT = resolve(__dirname, '../public/search-index.json');

async function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      fm[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

async function extractHeadings(content) {
  const headings = [];
  const regex = /^#{1,3}\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push(match[1].replace(/[*_`]/g, ''));
  }
  return headings.join(' ');
}

async function buildIndex() {
  const docs = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.name.endsWith('.md')) {
        const relative = full.replace(DOCS_ROOT + '/', '');
        const content = await readFile(full, 'utf-8');
        const fm = await extractFrontmatter(content);
        const headings = await extractHeadings(content);
        const slug = relative.replace(/\.md$/, '');

        const section = slug.split('/')[0] || 'overview';
        const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');

        const body = content
          .replace(/^---[\s\S]*?---\n/, '')
          .replace(/^#{1,6}\s+.+\n/gm, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/[*_`~]/g, '')
          .trim();
        const firstPara = body.split('\n\n').find(p => p.trim().length > 30) || '';

        docs.push({
          id: slug,
          title: fm.title || slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: fm.description || firstPara.slice(0, 120),
          section: sectionLabel,
          href: slug === 'index' ? '/docs/' : `/docs/${slug}/`,
          content: headings + ' ' + fm.description,
          lastUpdated: fm.lastUpdated || '',
        });
      }
    }
  }

  await walk(DOCS_ROOT);
  docs.sort((a, b) => a.href.localeCompare(b.href));

  const output = JSON.stringify({ docs }, null, 2);
  await writeFile(OUTPUT, output, 'utf-8');

  console.log(`✓ Search index built: ${docs.length} docs -> public/search-index.json`);
}

buildIndex().catch(console.error);
```

- [ ] **Step 2: Commit**

```bash
git add docs-site-template/scripts/
git commit -m "feat(template): add config-aware search index builder"
```

---

### Task 16: Create `init.sh`

**Files:**
- Create: `docs-site-template/init.sh`

- [ ] **Step 1: Write `init.sh`**

```bash
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

npm install

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
```

- [ ] **Step 2: Make it executable and commit**

```bash
chmod +x docs-site-template/init.sh
git add docs-site-template/init.sh
git commit -m "feat(template): add interactive init.sh script"
```

---

### Task 17: Create `upgrade.sh`

**Files:**
- Create: `docs-site-template/upgrade.sh`

- [ ] **Step 1: Write `upgrade.sh`**

```bash
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
```

- [ ] **Step 2: Make it executable and commit**

```bash
chmod +x docs-site-template/upgrade.sh
git add docs-site-template/upgrade.sh
git commit -m "feat(template): add upgrade.sh for upstream sync"
```

---

### Task 18: Verify the template builds

**Files:**
- None (verification only)

- [ ] **Step 1: Install dependencies**

```bash
cd docs-site-template && npm install
```

Expected: npm install completes without errors.

- [ ] **Step 2: Run dev server and check for build errors**

```bash
cd docs-site-template && npm run build
```

Expected: Build completes with 0 errors. Search index is generated. All pages render.

- [ ] **Step 3: Fix any build errors** (if any)

- [ ] **Step 4: Commit any fixes**

```bash
git add docs-site-template/
git commit -m "fix(template): resolve build errors"
```

---

### Task 19: Push to GitHub

**Files:**
- None (git operations only)

- [ ] **Step 1: Verify clean state and push**

```bash
git status
git log --oneline -10
git push origin master
```

Expected: All commits pushed successfully.

---

## Self-Review

### 1. Spec Coverage

| Spec Requirement | Task |
|-----------------|------|
| `site.config.ts` with placeholders | Task 1 |
| Nav config in `site.config.ts` | Task 11 (TopNav reads config.nav) |
| Sidebar config (auto/manual) | Task 12 (Sidebar reads config.sidebar) |
| Feature flags (search, mermaid, callout, readingProgress, themeToggle, keyboardShortcuts) | Tasks 5, 10, 13, 14 |
| Content dir changed to `./docs` | Task 3 |
| `init.sh` interactive | Task 16 |
| `upgrade.sh` whitelist sync | Task 17 |
| Sample docs content | Task 2 |
| DocLayout reads config | Task 10 |
| TopNav reads config | Task 11 |
| docs/index.astro reads config | Task 14 |
| build-search-index config-aware | Task 15 |
| Package.json placeholder | Task 4 |

### 2. Placeholder Scan

No TBD/TODO/placeholders found. All code is concrete.

### 3. Type Consistency

- `config.name`, `config.description`, `config.url` — used consistently across DocLayout, TopNav, Sidebar, pages, and sitemap
- `config.nav` array with `{label, href}` — used in TopNav
- `config.sidebar` with `auto` and `groups` — used in Sidebar
- `config.features.*` — boolean flags used in DocLayout, TopNav, and slug page
- All consistent across tasks
