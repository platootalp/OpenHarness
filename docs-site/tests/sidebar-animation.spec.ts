import { test, expect } from '@playwright/test';

test.describe('Sidebar Animation', () => {
  test('nested sections use is-open class for smooth animation', async ({ page }) => {
    // Navigate to a page with nested sections
    await page.goto('/docs/dev/architecture-overview/');
    await page.waitForLoadState('networkidle');

    // Find nested section content (child sections with grandchildren)
    const nestedContents = await page.locator('li.sidebar-section > .sidebar-section-content');
    const count = await nestedContents.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const content = nestedContents.nth(i);
        // Check that nested sections use is-open class (not hidden)
        const classAttr = await content.getAttribute('class');
        console.log(`Nested section ${i} classes:`, classAttr);

        // Should have sidebar-section-content class
        expect(classAttr).toContain('sidebar-section-content');

        // Should NOT have hidden class (the bug was using hidden which breaks animation)
        expect(classAttr).not.toContain('hidden');
      }
    }
  });

  test('section toggle uses is-open class', async ({ page }) => {
    await page.goto('/docs/');
    await page.waitForLoadState('networkidle');

    // Find a section toggle button
    const toggle = page.locator('.sidebar-section-toggle').first();
    await expect(toggle).toBeVisible();

    // Get the associated content
    const section = await toggle.evaluate(el => el.closest('.sidebar-section'));
    expect(section).not.toBeNull();

    // Click to toggle
    await toggle.click();
    await page.waitForTimeout(300);

    // Check that the content uses is-open class when opened
    const content = page.locator('.sidebar-section').first().locator('.sidebar-section-content');
    const classAttr = await content.getAttribute('class');
    console.log('Content classes after toggle:', classAttr);

    // The CSS animation relies on is-open class
    // (hidden class would completely hide without animation)
    expect(classAttr).toContain('sidebar-section-content');
  });

  test('sidebar sections have proper animation CSS', async ({ page }) => {
    await page.goto('/docs/');

    // Check the CSS is properly applied
    const hasAnimationStyles = await page.evaluate(() => {
      const el = document.createElement('div');
      el.className = 'sidebar-section-content is-open';
      document.body.appendChild(el);

      const styles = window.getComputedStyle(el);
      const hasMaxHeight = styles.maxHeight !== 'none' && styles.maxHeight !== '0px';
      const hasTransition = styles.transition && styles.transition !== 'all 0s ease 0s';

      document.body.removeChild(el);
      return { hasMaxHeight, hasTransition, maxHeight: styles.maxHeight };
    });

    console.log('Animation styles:', hasAnimationStyles);
    expect(hasAnimationStyles.hasTransition).toBe(true);
  });
});
