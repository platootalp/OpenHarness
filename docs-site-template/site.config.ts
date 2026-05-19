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
