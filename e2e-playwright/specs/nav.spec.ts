import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute } from './helpers';

const routes = [
  { path: '/', title: 'simple', description: 'This is the simplest demo.' },
  { path: '/resize', title: 'resize', description: 'This demo showcases widget resizing.' },
  { path: '/custom-settings', title: 'custom widget settings', description: 'This demo showcases overriding the widget settings dialog/modal for the entire dashboard and for a specific widget.' },
  { path: '/explicit-saving', title: 'explicit saving', description: 'This demo showcases an option to only save the dashboard state explicitly' },
  { path: '/layouts', title: 'dashboard layouts', description: 'This demo showcases the ability to have "dashboard layouts"' },
  { path: '/layouts/explicit-saving', title: 'layouts explicit saving', description: 'This demo showcases dashboard layouts with explicit saving enabled.' },
  { path: '/dynamic-options', title: 'dynamic options', description: 'This demo showcases loading dashboard options dynamically.' },
  { path: '/dynamic-data', title: 'dynamic data', description: 'This demo showcases loading the widgets and refreshing the contents as the source data is updated.' },
];

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('renders the navbar brand and all route links', async ({ page }) => {
    await openRoute(page, '/');
    await expect(page.locator('.navbar-brand')).toHaveText('angular-dashboard');
    await expect(page.locator('.navbar-nav > li > a').filter({ hasText: /\S/ })).toHaveText(routes.map((route) => route.title));
  });

  for (const route of routes) {
    test(`navigates to ${route.path} without console errors and shows its description`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await openRoute(page, route.path);
      await expect(page.locator('.alert.alert-success').filter({ hasText: route.description }).first()).toContainText(route.description);
      expect(errors).toEqual([]);
    });
  }
});
