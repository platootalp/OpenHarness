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
  site: config.url === '__SITE_URL__' ? 'https://example.com' : config.url,
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
