import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, widgets, widgetTitles } from './helpers';

test.describe('simple dashboard widgets', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('renders defaults and toolbar actions', async ({ page }) => {
    await openRoute(page, '/');
    await expect(widgets(page)).toHaveCount(5);
    await expect(page.locator('.dashboard-widget-area span.widget-title')).toHaveText(['Widget 1', 'Widget 2', 'Widget 3', 'Widget 4', 'Widget 5']);
    await expect(page.locator('.dashboard-widget-area .widget .label.label-primary')).toHaveText(['random', 'time', 'datamodel', 'random', 'time']);
    await expect(page.locator('.btn-toolbar .btn-primary')).toHaveText(['random', 'time', 'datamodel', 'resizable', 'fluid']);
    await expect(page.locator('.btn-toolbar')).toContainText('Default Widgets');
    await expect(page.locator('.btn-toolbar')).toContainText('Clear');
  });

  test('adds, clears, and restores default widgets', async ({ page }) => {
    await openRoute(page, '/');
    await page.locator('.btn-toolbar .btn-primary', { hasText: 'fluid' }).click();
    await expect(widgets(page)).toHaveCount(6);
    await expect(widgets(page).last().locator('span.widget-title')).toHaveText('Widget 6');
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect(widgets(page)).toHaveCount(0);
    await page.getByRole('button', { name: 'Default Widgets', exact: true }).click();
    await expect(widgets(page)).toHaveCount(5);
  });

  test('removes and collapses widgets', async ({ page }) => {
    await openRoute(page, '/');
    await widgets(page).nth(1).locator('.glyphicon-remove').click();
    await expect(widgets(page)).toHaveCount(4);
    expect(await widgetTitles(page)).toEqual(['Widget 1', 'Widget 3', 'Widget 4', 'Widget 5']);
    const second = widgets(page).nth(1);
    await second.locator('.glyphicon-minus').click();
    await expect(second.locator('.widget-content')).toBeHidden();
    await second.locator('.glyphicon-plus').click();
    await expect(second.locator('.widget-content')).toBeVisible();
  });

  test('prepends a widget from the demo link', async ({ page }) => {
    await openRoute(page, '/');
    await page.locator('a', { hasText: 'Click here' }).first().click();
    await expect(widgets(page).first().locator('span.widget-title')).toHaveText('Prepend Widget');
  });
});
