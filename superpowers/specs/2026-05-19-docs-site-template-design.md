# docs-site-template 设计文档

将当前 OpenHarness 的 docs-site 抽取为可复用的 GitHub Template 仓库，方便其他项目快速生成同款文档站。

## 方案选择

**方案 C：模板仓库 + 初始化脚本**

在精简抽取 + 配置驱动的基础上，增加 `init.sh` 交互式初始化和 `upgrade.sh` 上游同步。理由：
- 开箱即用 + 交互式引导，初始化体验好
- 升级路径清晰，可从上游模板同步核心代码更新
- 复杂度适中，不过度设计

## 项目结构

```
docs-site-template/
├── astro.config.mjs          # 和现在基本一致，去掉项目特定内容
├── tailwind.config.mjs        # 颜色/字体保持默认，可覆盖
├── package.json               # 名称改为占位符
├── tsconfig.json
├── init.sh                    # 交互式初始化脚本
├── upgrade.sh                 # 从上游模板同步核心代码
├── site.config.ts             # 站点配置集中文件
├── scripts/
│   └── build-search-index.mjs # 不变
├── public/
│   ├── favicon.svg            # 占位符，init 时替换
│   └── robots.txt             # 占位符
├── src/
│   ├── components/            # 全部保留，不变
│   ├── layouts/
│   │   └── DocLayout.astro    # 微调：读取 site.config.ts
│   ├── lib/                   # rehype/remark 插件，不变
│   ├── pages/                 # 保留，微调读取 site.config.ts
│   ├── styles/
│   │   └── global.css         # 不变
│   └── content.config.ts      # 改为引用内置 docs/ 目录
├── docs/                      # 内置内容目录（含示例文档）
│   ├── index.md               # 示例首页
│   ├── getting-started.md     # 示例文档
│   └── guide/                 # 示例分组
│       └── configuration.md
└── .gitignore
```

关键变化：
- 新增 `site.config.ts` — 集中管理站点名称、描述、导航、侧边栏结构
- 内容目录内置 — `content.config.ts` 改为引用 `./docs/`（模板内的 docs/）
- 占位符 — 项目名称、站点标题等用 `__PLACEHOLDER__` 格式，init.sh 自动替换
- 组件/插件/样式 — 全部保留，开箱即用

## site.config.ts 配置文件

```ts
export default {
  // 基本信息 — init.sh 交互式填入
  name: "__SITE_NAME__",
  description: "__SITE_DESC__",
  url: "__SITE_URL__",

  // 导航结构
  nav: [
    { label: "文档", href: "/docs" },
    { label: "搜索", href: "/search" },
  ],

  // 侧边栏分组
  sidebar: {
    auto: true,                     // 自动从 docs/ 目录结构生成
    groups: [                       // auto=false 时手动定义
      { title: "开始", dir: "getting-started" },
      { title: "指南", dir: "guide" },
      { title: "参考", dir: "reference" },
    ],
  },

  // 功能开关
  features: {
    search: true,
    mermaid: true,
    callout: true,
    readingProgress: true,
    themeToggle: true,
    keyboardShortcuts: true,
  },
} as const;
```

- 基本信息：用占位符，`init.sh` 交互式替换
- 侧边栏：默认 `auto: true`，从 docs/ 目录自动生成分组
- 功能开关：默认全开，用户按需关闭
- TypeScript 文件，有类型提示

## init.sh 初始化脚本

```bash
# 用法: ./init.sh  或  bash init.sh
```

流程：
1. 交互式问答：站点名称、描述、URL、是否保留示例文档
2. 替换占位符：site.config.ts、package.json、public/favicon.svg、docs/index.md
3. 清理：不保留示例文档时清空 docs/ 并放入最小 index.md；删除 init.sh 自身
4. 初始化：git init、npm install、输出下一步提示

关键决策：
- 一次性脚本 — 运行后自删除
- 保留示例文档是默认选项
- 不做 git commit

## upgrade.sh 升级脚本

```bash
# 用法: ./upgrade.sh
```

流程：
1. 检测上游：默认从 GitHub 模板仓库 main 分支，支持 TEMPLATE_REPO 环境变量覆盖
2. 下载上游到临时目录：git clone --depth 1
3. 白名单同步（只覆盖这些）：
   - src/components/、src/layouts/、src/lib/、src/styles/、src/pages/
   - scripts/、astro.config.mjs、tailwind.config.mjs、tsconfig.json
4. 不覆盖（保护用户内容）：
   - site.config.ts、docs/、public/favicon.svg、package.json
5. 冲突处理：同步前 git stash，同步后 stash pop，有冲突提示手动解决
6. 清理临时目录

关键决策：
- 白名单而非黑名单 — 只同步明确的"核心层"文件
- package.json 不同步 — 提示用户手动检查新依赖
- git stash 保护 — 确保未提交改动不丢失

## 配置集成 — 组件如何读取 site.config.ts

### DocLayout.astro
- 顶部导航栏：读 `config.nav`
- 站点标题/logo：读 `config.name`

### Sidebar.astro
- `auto: true` → 从 docs/ 目录结构自动生成分组和排序（当前行为）
- `auto: false` → 按 `config.sidebar.groups` 手动定义

### pages/docs/index.astro
- Hero 区域：读 `config.name` / `config.description`
- Section cards：从 docs/ 一级子目录自动生成

### 功能开关集成
- `features.search: false` → 不渲染 SearchModal/SearchTrigger，不构建搜索索引
- `features.mermaid: false` → 移除 remarkMermaid 插件和 mermaid-block
- `features.readingProgress: false` → 不渲染 ReadingProgress
- 其他开关同理

### content.config.ts
- 路径从 `../../docs` 改为 `./docs`
- schema 不变

改动量：主要是把硬编码值替换为 `import config from '../../site.config'`，组件逻辑基本不动。

## 复用场景

项目文档站 — 每个新项目快速生成同款文档站，内容不同但结构/组件/搜索/主题一致。使用 GitHub Template 仓库的 "Use this template" 功能创建新项目。
