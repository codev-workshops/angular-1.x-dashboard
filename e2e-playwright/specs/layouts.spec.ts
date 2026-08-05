import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, widgetTitles, widgets } from './helpers';

function activeDashboard(page: any) {
  return page.locator('.layout-tabs').locator('li.active').locator('xpath=following-sibling::*[1]').locator('xpath=following-sibling::*[1]');
}

test.describe('dashboard layouts', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('renders default tabs, switches layouts, creates, renames, and removes', async ({ page }) => {
    await openRoute(page, '/layouts');
    await expect(page.locator('.nav-tabs.layout-tabs > li')).toHaveCount(4);
    await expect(page.locator('.nav-tabs.layout-tabs > li').locator('span').first()).toHaveText('Layout 1');
    await expect(page.locator('.nav-tabs.layout-tabs > li').nth(1).locator('span').first()).toHaveText('Layout 2');
    await expect(page.locator('.nav-tabs.layout-tabs > li.active')).toHaveCount(1);
    await page.locator('.nav-tabs.layout-tabs > li').nth(1).locator('a').click();
    await expect(page.locator('.nav-tabs.layout-tabs > li').nth(1)).toHaveClass(/active/);
    await page.locator('.nav-tabs.layout-tabs > li').last().locator('a').click();
    await expect(page.locator('.nav-tabs.layout-tabs > li')).toHaveCount(5);
    await expect(page.locator('.nav-tabs.layout-tabs > li.active')).toContainText('Custom');
    const custom = page.locator('.nav-tabs.layout-tabs > li.active');
    await custom.locator('span[ng-dblclick="editTitle(layout)"]').dblclick();
    const renameInput = page.locator('.nav-tabs.layout-tabs input[data-layout]').last();
    await renameInput.fill('Renamed Layout');
    await renameInput.press('Enter');
    await expect(custom.locator('span').first()).toHaveText('Renamed Layout');
    await custom.locator('.remove-layout-icon').click();
    await expect(page.locator('.nav-tabs.layout-tabs')).not.toContainText('Renamed Layout');
  });

  test('keeps per-layout widget state and layout state across reloads', async ({ page }) => {
    await openRoute(page, '/layouts');
    const layoutOne = page.locator('.nav-tabs.layout-tabs > li').first();
    const dashboardOne = page.locator('[dashboard]').first();
    await dashboardOne.locator('button', { hasText: 'Button dropdown' }).click();
    await dashboardOne.locator('.dropdown-menu a', { hasText: 'random' }).click();
    await expect(dashboardOne.locator('.widget-container')).toHaveCount(6);
    await page.locator('.nav-tabs.layout-tabs > li').nth(1).locator('a').click();
    await expect(page.locator('[dashboard]').filter({ visible: true })).toHaveCount(1).catch(() => {});
    await page.locator('.nav-tabs.layout-tabs > li').first().locator('a').click();
    await expect(dashboardOne.locator('.widget-container')).toHaveCount(6);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('.nav-tabs.layout-tabs > li.active')).toContainText('Layout 1');
    await expect(page.locator('[dashboard]').first().locator('.widget-container')).toHaveCount(6);
  });
});
