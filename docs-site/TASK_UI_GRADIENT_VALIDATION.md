# 验证 UI 渐变效果实现

## 背景
参考设计规范：`docs/superpowers/specs/2026-04-12-ui-gradient-design.md`

## 依赖
- TASK_UI_GRADIENT_CSS_SYSTEM
- TASK_UI_GRADIENT_TOPNAV
- TASK_UI_GRADIENT_SIDEBAR
- TASK_UI_GRADIENT_LAYOUT
- TASK_UI_GRADIENT_PROSE

## 修改文件
无（仅测试）

## 测试场景

### 1. 亮模式验证
- [ ] 导航栏渐变边框框正确显示
- [ ] Logo 渐变背景正确
- [ ] 侧边栏渐变背景正确
- [ ] 激活链接渐变边框正确
- [ ] 分区标题渐变文字正确
- [ ] 代码块顶部装饰条正确
- [ ] 所有颜色对比度符合 WCAG AA 标准

### 2. 暗模式验证
- [ ] 导航栏渐变边框在暗模式下正确
- [ ] Logo 渐变背景在暗模式下正确
- [ ] 侧边栏渐变背景在暗模式下正确
- [ ] 激活链接渐变边框在暗模式下正确
- [ ] 分区标题渐变文字在暗模式下正确
- [ ] 代码块顶部装饰条在暗模式下正确
- [ ] 所有颜色对比度符合 WCAG AA 标准

### 3. 主题切换验证
- [ ] 从亮到暗切换流畅
- [ ] 从暗到亮切换流畅
- [ ] 系统主题切换流畅
- [ ] 所有渐变效果在主题切换后立即更新

### 4. 动画验证
- [ ] 页面加载动画流畅
- [ ] hover 效果平滑（200-400ms）
- [ ] 没有布局抖动
- [ ] 动画不卡顿

### 5. 响应式验证
- [ ] 移动端（375px）布局正常
- [ ] 平板（768px）布局正常
- [ ] 桌面（1024px）布局正常
- [ ] 大屏（1440px）布局正常
- [ ] 移动端渐变效果简化或保持性能

### 6. 可访问性验证
- [ ] 所有可交互元素有 focus 状态
- [ ] 键盘导航正常工作
- [ ] prefers-reduced-motion 用户无动画
- [ ] 屏幕阅读器正确读出内容

## 测试工具

### Playwright E2E 测试
创建 `tests/ui-gradient.spec.ts` 文件：
```typescript
import { test, expect } from '@playwright/test';

test.describe('UI Gradient Effects', () => {
  test('亮模式渐变显示', async ({ page }) => {
    await page.goto('/docs/');
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    // 验证导航栏渐变边框存在
    const navbar = await page.locator('header').first();
    await expect(navbar).toHaveClass(/gradient-border/);
  });

  test('暗模式渐变显示', async ({ page }) => {
    await page.goto('/docs/');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    // 验证暗模式渐变效果
  });

  test('主题切换流畅', async ({ page }) => {
    await page.goto('/docs/');
    const before = await page.locator('header').screenshot();
    await page.click('#theme-toggle-btn');
    await page.waitForTimeout(100);
    const after = await page.locator('header').screenshot();
    // 对比截图确保平滑切换
  });
});
```

运行测试：
```bash
npx playwright test
```

### 手动视觉检查
1. 在亮模式和暗模式下检查所有渐变效果
2. 使用 WebAIM Contrast Checker 验证颜色对比度
3. 检查动画流畅性

## 验收标准
- [ ] 所有测试场景通过
- [ ] 亮/暗模式都正确工作
- [ ] 动画流畅且不卡顿
- [ ] 响应式在所有断点正常
- [ ] 可访问性符合 WCAG 标准
