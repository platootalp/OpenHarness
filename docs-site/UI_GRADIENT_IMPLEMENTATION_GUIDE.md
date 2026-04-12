# UI 渐变实现指南

> **日期:** 2026-04-12
> **版本:** 1.0

---

## 概述

本文档详细说明如何实现 OpenHarness 文档网站的 UI 渐变效果，包括：

1. **技术蓝紫渐变** - 现代且专业的渐变配色方案
2. **微动画系统** - 流畅的页面加载和交互效果
3. **响应式渐变** - 在小屏幕上优化性能

## 设计系统

### 颜色变量

```css
:root {
  /* 基础颜色 */
  --color-bg-start: #F8FAFC;
  --color-bg-end: #E2E8F0;
  --color-text: #1E293B;
  --color-secondary: #64748B;
  --color-sidebar-bg: #F1F5F9;
  --color-sidebar-bg-dim: #E8EEF5;
  --color-border: #E2E8F0;

  /* 渐变 */
  --gradient-primary: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  --gradient-secondary: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  --gradient-code: linear-gradient(180deg, #F1F5F9 0%, #E0E7FF 100%);
  --gradient-border: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899);

  /* 渐变起始/结束色（用于渐变文字和其他） */
  --gradient-primary-start: #3B82F6;
  --gradient-primary-end: #8B5CF6;
  --gradient-secondary-start: #6366F1;
  --gradient-secondary-end: #8B5CF6;
  --gradient-code-start: #F1F5F9;
  --gradient-code-end: #E0E7FF;
}

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);

  /* 动效曲线 */
  --ease-spring: cubic-bezier(0.34, 1.26, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}

.dark {
  /* 暗模式基础颜色 */
  --color-bg-start: #0F172A;
  --color-bg-end: #1E1B4B;
  --color-text: #F1F5F9;
  --color-secondary: #94A3B8;
  --color-sidebar-bg: #1E293B;
  --color-sidebar-bg-dim: #0F172A;
  --color-border: #334155;

  /* 暗模式渐变 */
  --gradient-primary: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%);
  --gradient-secondary: linear-gradient(135deg, #818CF8 0%, #C084FC 100%);
  --gradient-code: linear-gradient(180deg, #1E293B 0%, #312E81 100%);
  --gradient-border: linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6);

  /* 暗模式渐变起始/结束色 */
  --gradient-primary-start: #60A5FA;
  --gradient-primary-end: #A78BFA;
  --gradient-secondary-start: #818CF8;
  --gradient-secondary-end: #C084FC;
  --gradient-code-start: #1E293B;
  --gradient-code-end: #312E81;

  --shadow-glow: 0 0 20px rgba(96, 165, 250, 0.3);
}
```

### 动画关键帧

```css
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### 动画工具类

```css
.animate-fade-in-down {
  animation: fade-in-down 300ms var(--ease-smooth) forwards;
}

.animate-fade-in-up {
  animation: fade-in-up 400ms var(--ease-smooth) forwards;
}

.animate-slide-in-left {
  animation: slide-in-left 400ms var(--ease-smooth) forwards;
}
```

### 减少动效支持

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 背景渐变类

```css
.sidebar-gradient-bg {
  background: linear-gradient(180deg, var(--color-sidebar-bg) 0%, var(--color-sidebar-bg-dim) 100%);
}

.main-gradient-bg {
  background: linear-gradient(180deg, var(--color-bg-start) 0%, var(--color-bg-end) 100%);
}
```

### 导航栏渐变边框

```css
.navbar-gradient-border {
  position: relative;
}

.navbar-gradient-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
  transition: opacity 0.3s;
}
```

### 侧边栏激活链接渐变边框

```css
.sidebar-active-link {
  position: relative;
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-text);
}

.sidebar-active-link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: var(--gradient-primary);
  z-index: -1;
}
```

### 渐变文字效果

```css
.gradient-text {
  color: var(--gradient-secondary-start); /* Fallback */
  background: var(--gradient-secondary);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

### 链接下划线动画

```css
.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 200ms ease;
}

.nav-link:hover::after {
  width: 100%;
}
```

### 代码块顶部装饰条

```css
.prose pre {
  position: relative;
  background: var(--color-code-bg);
}

.prose pre::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  border-radius: 8px 8px 0 0;
}
```

### 标题渐变文字

```css
.prose-headings:text-gradient {
  color: var(--gradient-secondary-start); /* Fallback */
  background: var(--gradient-secondary);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  font-family: 'JetBrains Mono', monospace;
}
```
```

---

## 组件实现

### 1. 导航栏 (TopNav.astro)

**修改点：**

1. **导航栏容器**
   - 添加 `navbar-gradient-border` 类
   - 添加 `animate-fade-in-down` 类（页面加载动画）

2. **Logo 容器**
   - 使用 `background: var(--gradient-primary)` 替代纯色
   - 保持 `rounded-lg shadow-[var(--shadow-sm)]` 等效

3. **导航链接**
   - 添加 `nav-link` 类（用于下划线动画）
   - 使用 `text-[var(--color-secondary)]`
   - 添加 `hover:text-[var(--gradient-primary-start)]`

4. **主题切换按钮**
   - 使用 `style="color: var(--gradient-primary-start)"` 设置图标颜色
   - 保持其他 hover 效果

**实现代码示例：**

```html
<!-- 导航栏 -->
<header class="navbar-gradient-border animate-fade-in-down">
  <div class="flex items-center gap-3">
    <button id="sidebar-toggle">...</button>
    <a href="/docs/" class="nav-link">Home</a>
    <div class="w-8 h-8 rounded text-white font-bold" style="background: var(--gradient-primary)">OH</div>
  </div>
  <nav class="flex items-center gap-3">
    <a href="/docs/" class="nav-link">Home</a>
    <a href="/docs/user/getting-started/" class="nav-link">User Guide</a>
    <button class="p-2 rounded">
      <svg style="color: var(--gradient-primary-start)" width="18" height="18" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
      </svg>
    </button>
  </nav>
</header>
```

---

### 2. 侧边栏 (Sidebar.astro)

**修改点：**

1. **侧边栏容器**
   - 添加 `sidebar-gradient-bg` 类（垂直渐变背景）
   - 添加 `animate-slide-in-left` 类（页面加载动画）
   - 保持 `border-r border-[var(--color-border)]`

2. **激活链接**
   - 移除 `bg-[var(--gradient-primary)]` 背景（改为透明）
   - 添加 `sidebar-active-link` 类
   - 内部 `span` 保持文字
   - 使用 `color-[var(--gradient-primary-start)]` 文字颜色

3. **分区标题**
   - 移除 `text-[var(--color-secondary)]`
   - 添加 `gradient-text` 类（渐变文字效果）

4. **折叠图标**
   - 使用 `style="color: var(--gradient-primary-start)"`

**实现代码示例：**

```html
<!-- 侧边栏 -->
<aside class="sidebar-gradient-bg animate-slide-in-left border-r border-[var(--color-border)]">
  <nav class="space-y-1">
    <a href="/docs/" class="sidebar-active-link">
      <span class="text-[var(--gradient-primary-start)]">首页</span>
    </a>

    <div class="sidebar-section" data-open="true">
      <button class="sidebar-section-toggle">
        <span class="gradient-text">用户手册</span>
        <svg class="sidebar-chevron" style="color: var(--gradient-primary-start)">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01.1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
        </svg>
      </button>

      <ul class="space-y-0.5 pl-2 mt-1.5">
        <li>
          <a href="/docs/user/getting-started/" class="sidebar-active-link">
            <span class="text-[var(--gradient-primary-start)]">快速开始</span>
          </a>
        </li>
      </ul>
    </div>
  </nav>
</aside>
```

---

### 3. 主内容区域 (DocLayout.astro)

**修改点：**

1. **Body 元素**
   - 添加 `main-gradient-bg` 类（垂直渐变背景）

2. **Main 内容容器**
   - 添加 `animate-fade-in-up` 类（页面加载动画）

**实现代码示例：**

```html
<body class="main-gradient-bg">
  <main class="animate-fade-in-up">
    <article class="px-6 py-8">
      <!-- 内容... -->
    </article>
  </main>
</body>
```

---

### 4. Prose 样式 ([...slug].astro)

**修改点：**

1. **链接**
   - 使用 `text-[var(--gradient-primary-start)]` 替代蓝色
   - 添加 `prose-a:no-underline`

2. **标题**
   - 添加 `prose-headings:text-gradient` 类

3. **代码块**
   - 保持 `prose-pre` 类（已有纯色背景）
   - `prose pre::before` 装饰条会自动添加（CSS 中定义）

**实现代码示例：**

```html
<div class="prose prose-slate">
  <h1 class="prose-headings:text-gradient">欢迎使用 OpenHarness</h1>

  <p>OpenHarness 是一个开源的 Python Agent Harness。</p>

  <h2 class="prose-headings:text-gradient">安装</h2>
  <pre class="language-bash"><code>pip install openharness</code></pre>

  <a href="/docs/" class="prose-a:text-[var(--gradient-primary-start)] no-underline">
    返回首页
  </a>
</div>
```

---

## 验收清单

### 视觉验证

- [ ] 导航栏有渐变边框效果
- [ ] Logo 使用渐变背景
- [ ] 链接 hover 有下划线动画
- [ ] 主题切换按钮图标使用渐变色
- [ ] 侧边栏有垂直渐变背景
- [ ] 侧边栏激活链接有渐变边框
- [ ] 侧边栏分区标题使用渐变文字
- [ ] 折叠图标使用品牌色

### 主题切换验证

- [ ] 亮模式：所有渐变正确显示
- [ ] 暗模式：所有渐变正确显示（暗色渐变）
- [ ] 系统模式：跟随系统主题

### 动画验证

- [ ] 页面加载动画流畅（300-400ms）
- [ ] hover 效果平滑（200ms）
- [ ] 折叠面板流畅（300ms）
- [ ] 无布局抖动

### 响应式验证

- [ ] 移动端（375px）布局正常
- [ ] 平板（768px）布局正常
- [ ] 桌面（1024px）布局正常
- [ ] 大屏（1440px）布局正常

### 可访问性验证

- [ ] 所有可交互元素有 focus 状态
- [ ] 键盘导航正常工作
- [ ] prefers-reduced-motion 用户无动画
- [ ] 文本对比度符合 WCAG AA 标准（≥ 4.5:1）

---

## 注意事项

1. **性能优化**
   - 使用 `transform` 和 `opacity` 进行动画（GPU 加速）
   - 避免使用 `width`/`height` 属性的动画
   - 减少渐变区域数量

2. **浏览器兼容性**
   - 所有渐变效果使用 CSS 变量（现代浏览器支持良好）
   - 添加 `background-clip: text` 的 WebKit 前缀

3. **深色模式处理**
   - 所有 CSS 变量都有 `.dark` 变体
   - JavaScript 正确切换 `dark` class

4. **主题持久化**
   - 使用 localStorage 保存主题偏好
   - 默认使用系统主题

---

## 下一步

1. 实现所有组件的渐变效果
2. 运行开发服务器验证效果
3. 测试亮/暗/系统主题切换
4. 根据实际效果调整参数
