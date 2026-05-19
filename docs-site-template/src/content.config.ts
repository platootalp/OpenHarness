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
