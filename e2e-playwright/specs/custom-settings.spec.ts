import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, widgets } from './helpers';

test.describe('custom settings', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('renders both custom widget definitions and accepts the limit setting', async ({ page }) => {
    await openRoute(page, '/custom-settings');
    await expect(page.locator('.dashboard-widget-area .widget .label.label-primary')).toHaveText([
      'congfigurable widget',
      'override modal widget',
    ]);
    const configurable = widgets(page).first();
    await configurable.locator('.glyphicon-cog').click();
    const modal = page.locator('.modal');
    await expect(modal).toContainText('Widget Options');
    await expect(modal.getByText('Random Limit', { exact: true })).toBeVisible();
    await modal.locator('input[ng-model="result.title"]').fill('Configurable');
    await modal.locator('input[ng-model="result.dataModelOptions.limit"]').fill('25');
    await modal.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(modal).toBeHidden();
  });

  test('uses the widget-specific modal template for the override widget', async ({ page }) => {
    test.fail(true, 'AngularJS demo references missing app/template/WidgetSpecificSettings.html');
    await openRoute(page, '/custom-settings');
    await widgets(page).nth(1).locator('.glyphicon-cog').click();
    const modal = page.locator('.modal');
    await expect(modal.locator('h3')).not.toContainText('Widget Options');
    await expect(modal.locator('input[name="widgetTitle"]')).toBeVisible();
    await expect(modal).toContainText('OK');
  });
});
