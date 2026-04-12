# 主题切换功能设计文档

> **项目:** OpenHarness 文档网站
> **日期:** 2026-04-12
> **状态:** ✅ 已完成 (P0/P1 全部实现，P2 可选功能已评估)

---

## 设计目标

实现完整的亮/暗/系统主题切换功能，确保：
- 无闪烁（FOUC-free）主题应用
- 支持跟随系统主题变化
- 持久化用户偏好
- 平滑的视觉过渡效果

---

## 核心功能

### 1. 三态主题切换

```
模式: light → dark → system → light (循环)
```

**状态定义:**
- `light`: 强制亮色模式
- `dark`: 强制暗色模式
- `system`: 跟随系统偏好

### 2. 防闪烁策略

**问题:** 页面加载时出现短暂亮色再变暗（Flash of Unstyled Content）

**解决方案:**
```html
<head>
  <!-- 在 <head> 中内联执行，快速执行以最小化阻塞 -->
  <script is:inline>
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        const validThemes = ['light', 'dark', 'system'];
        if (!validThemes.includes(theme)) {
          theme = 'system';
        }
      } catch (e) {
        // localStorage 失效（如隐私模式），使用系统主题
        var theme = 'system';
      }
      var isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      document.documentElement.classList.toggle('dark', isDark);
    })();
  </script>
</head>
```

**安全考虑:**
- 使用 `try-catch` 捕获 localStorage 失效
- 验证主题值在有效范围内
- CSP 策略：如需要严格 CSP，需使用 `script-src 'self' 'unsafe-inline'` 或改用外部脚本
- 不直接使用用户输入到 theme 变量

### 3. 系统主题监听

```javascript
const mq = window.matchMedia('(prefers-color-scheme: dark)');
mq.addEventListener('change', () => {
  if (currentTheme === 'system') {
    applyTheme('system');
  }
});
```

---

## 技术实现

### 状态管理

```javascript
const themeState = {
  themes: ['light', 'dark', 'system'],
  index: 2, // 默认 'system'
  current: 'system'
};
```

### 核心函数

```javascript
constarez themeState = {
  themes: ['light', 'dark', 'system'],
  index: 2, // 默认 'system'
  current: 'system'
};

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function updateButtonIcon(currentTheme) {
  var button = document.getElementById('theme-toggle-btn');
  if (!button) return;
  button.setAttribute('aria-label', 'Theme: ' + currentTheme + '. Click to switch.');
  button.title = currentTheme;

  var icon = button.querySelector('.theme-icon');
  if (!icon) return;

  // 根据主题更新图标 SVG
  if (currentTheme === 'light') {
    // 太阳图标
  } else if (currentTheme === 'dark') {
    // 月亮图标
  } else {
    // 显示器图标
  }
}

function applyTheme(themeName) {
  const effective = themeName === 'system'
    ? getSystemTheme()
    : themeName;

  document.documentElement.classList.toggle('dark', effective === 'dark');
  try {
    localStorage.setItem('theme', themeName);
  } catch (e) {
    console.warn('[Theme] Could not save to localStorage:', e);
  }
  updateButtonIcon(themeName);
}

function cycleTheme() {
  // 添加旋转动画
  var themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.classList.add('rotating');
    setTimeout(() => {
      themeIcon?.classList.remove('rotating');
    }, 500);
  }

  themeState.index = (themeState.index + 1) % themeState.themes.length;
  applyTheme(themeState.themes[themeState.index]);
}
```

### 图标映射

| 模式 | 图标 | 描述 |
|------|------|------|
| light | ☀️ 太阳 | 表示亮色模式 |
| dark | 🌙 月亮 | 表示暗色模式 |
| system | 🖥️ 显示器 | 表示跟随系统 |

---

## CSS 架构

### 变量定义

```css
:root {
  /* 亮色模式变量 */
  --color-bg-start: #F8FAFC;
  --color-bg-end: #1E293B;
  --color-text: #1E293B;
  /* ... */
}

.dark {
  /* 暗色模式变量 */
  --color-bg-start: #0F172A;
  --color-bg-end: #1E1B4B;
  --color-text: #F1F5F9;
  /* ... */
}
```

### 过渡动画

```css
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

---

## 无障碍设计

### ARIA 属性

```html
<button
  id="theme-toggle-btn"
  aria-label="Theme: system. Click to switch."
  title="system"
>
  <span class="theme-icon">...</span>
</button>
```

### 键盘操作

- `Tab`: 聚焦到主题切换按钮
- `Enter`/`Space`: 切换主题
- 按钮应有清晰的 focus 状态

### ARIA 属性

```html
<button
  id="theme-toggle-btn"
  role="switch"
  aria-checked="false"
  aria-label="Theme: system. Click to switch."
  aria-live="polite"
  title="system"
>
  <span class="theme-icon">...</span>
</button>
```

**说明:**
- `role="switch"`: 表示这是一个开关切换组件
- `aria-checked`: 表示当前是否选中（dark 模式为 true）
- `aria-live="polite"`: 主题变化时通知屏幕阅读器

### 减少动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  html {
    transition: none;
  }

  .theme-icon {
    transition: none;
  }
}
```

---

## 文件结构

```
src/layouts/DocLayout.astro    # 主题脚本内联在 <head>
src/components/TopNav.astro    # 主题切换按钮
src/styles/global.css          # CSS 变量定义
```

---

## 验收标准

### 功能验收
- [ ] 点击按钮循环切换 light → dark → system
- [ ] 当前主题显示在按钮 title 中
- [ ] 主题选择持久化到 localStorage
- [ ] 刷新页面后保持选择的主题
- [ ] 系统主题变化时自动更新（当 mode = system）

### 视觉验收
- [ ] 无闪烁加载（FOUC-free）
- [ ] 主题切换时图标有旋转动画
- [ ] 颜色过渡平滑（0.3s ease）

### 无障碍验收
- [ ] 按钮有正确的 aria-label
- [ ] 支持键盘操作
- [ ] respects prefers-reduced-motion

### 性能验收
- [ ] 脚本内联在 head，不阻塞关键渲染路径
- [ ] 无 layout shift

---

## 测试计划

### 功能测试
```typescript
test('should cycle through light -> dark -> system themes');
test('should persist theme in localStorage');
test('should apply dark class in dark mode');
test('should apply light class in light mode');
```

### 视觉回归测试
- 亮色模式截图对比
- 暗色模式截图对比
- 切换动画流畅度检查

### 无障碍测试
- 屏幕阅读器测试
- 键盘导航测试
- 减少动画偏好测试

---

## 实施优先级

### P0（核心功能）
1. 防闪烁内联脚本
2. 三态切换逻辑
3. localStorage 持久化
4. 系统主题监听

### P1（体验增强）
5. 图标旋转动画
6. 平滑颜色过渡
7. ARIA 属性支持

### P2（高级功能）
8. 减少动画支持
9. 主题预览提示

---

## 安全考虑

### XSS 防护
- 不接受用户输入到 localStorage 读取值
- 验证主题值在有效范围内 `['light', 'dark', 'system']`
- 使用 `try-catch` 捕获 localStorage 异常

### CSP 策略
- Astro `is:inline` 指令允许脚本内联执行
- 如使用严格 CSP，需配置 `script-src 'self' 'unsafe-inline'`
- 替代方案：将初始化脚本移至单独的 .js 文件

### 数据隐私
- theme 偏好仅存储在 localStorage
- 不涉及任何用户个人数据
