import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should cycle through light -> dark -> system themes', async ({ page }) => {
    await page.goto('/docs/');
    await page.waitForLoadState('networkidle');

    const themeButton = page.locator('#theme-toggle-btn');

    // Get initial theme state
    const initialTitle = await themeButton.getAttribute('title');
    console.log('Initial theme:', initialTitle);

    // Click to cycle to next theme
    await themeButton.click();
    await page.waitForTimeout(300);
    const theme1 = await themeButton.getAttribute('title');
    console.log('After 1st click:', theme1);

    // Click again
    await themeButton.click();
    await page.waitForTimeout(300);
    const theme2 = await themeButton.getAttribute('title');
    console.log('After 2nd click:', theme2);

    // Click again - should cycle back
    await themeButton.click();
    await page.waitForTimeout(300);
    const theme3 = await themeButton.getAttribute('title');
    console.log('After 3rd click:', theme3);

    // Verify we cycled through all 3 themes
    const themes = [initialTitle, theme1, theme2, theme3];
    console.log('Theme cycle:', themes);

    // Should have light, dark, and system in the sequence
    expect(themes.filter(t => t === 'light').length).toBeGreaterThanOrEqual(1);
    expect(themes.filter(t => t === 'dark').length).toBeGreaterThanOrEqual(1);
    expect(themes.filter(t => t === 'system').length).toBeGreaterThanOrEqual(1);
  });

  test('should persist theme in localStorage', async ({ page }) => {
    await page.goto('/docs/');
    await page.waitForLoadState('networkidle');

    const themeButton = page.locator('#theme-toggle-btn');

    // Click to change to dark theme
    await themeButton.click();
    await page.waitForTimeout(300);

    // Check localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    console.log('Stored theme:', storedTheme);
    expect(['light', 'dark', 'system']).toContain(storedTheme);

    // Reload and verify theme persists
    await page.reload();
    await page.waitForLoadState('networkidle');

    const themeAfterReload = await themeButton.getAttribute('title');
    console.log('Theme after reload:', themeAfterReload);
    expect(themeAfterReload).toBe(storedTheme);
  });

  test('should apply dark class to html element in dark mode', async ({ page }) => {
    await page.goto('/docs/');
    await page.waitForLoadState('networkidle');

    const themeButton = page.locator('#theme-toggle-btn');
    const html = page.locator('html');

    // Click until we get to dark theme
    for (let i = 0; i < 3; i++) {
      const title = await themeButton.getAttribute('title');
      if (title === 'dark') {
        break;
      }
      await themeButton.click();
      await page.waitForTimeout(300);
    }

    // Verify dark class is applied
    const hasDarkClass = await html.evaluate(el => el.classList.contains('dark'));
    console.log('Has dark class:', hasDarkClass);
    expect(hasDarkClass).toBe(true);
  });

  test('should apply light class to html element in light mode', async ({ page }) => {
    await page.goto('/docs/');
    await page.waitForLoadState('networkidle');

    const themeButton = page.locator('#theme-toggle-btn');
    const html = page.locator('html');

    // Click until we get to light theme
    for (let i = 0; i < 3; i++) {
      const title = await themeButton.getAttribute('title');
      if (title === 'light') {
        break;
      }
      await themeButton.click();
      await page.waitForTimeout(300);
    }

    // Verify dark class is NOT applied (light mode)
    const hasDarkClass = await html.evaluate(el => el.classList.contains('dark'));
    console.log('Has dark class in light mode:', hasDarkClass);
    expect(hasDarkClass).toBe(false);
  });
});
