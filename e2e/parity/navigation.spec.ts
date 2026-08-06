import { test, expect } from '@playwright/test';
import { clearDemoStorage, expectDescription, openRoute, routes } from './helpers';

const descriptions: Record<string, string> = {
  '/': 'This is the simplest demo.',
  '/resize': 'This demo showcases widget resizing.',
  '/custom-settings': 'This demo showcases overriding the widget settings dialog/modal',
  '/explicit-saving': 'This demo showcases an option to only save the dashboard state',
  '/layouts': 'This demo showcases the ability to have "dashboard layouts"',
  '/layouts/explicit-saving': 'This demo showcases dashboard layouts with explicit saving enabled.',
  '/dynamic-options': 'This demo showcases loading dashboard options dynamically.',
  '/dynamic-data': 'This demo showcases loading the widgets and refreshing the contents',
};

test.beforeEach(async ({ page }) => clearDemoStorage(page));

test('all hash routes render their description and dashboard', async ({ page }) => {
  for (const route of routes) {
    await openRoute(page, route);
    await expectDescription(page, descriptions[route]);
    await expect(page.locator('.dashboard-widget-area').first()).toBeVisible();
  }
});

test('navbar links navigate using hash routes', async ({ page }) => {
  await openRoute(page, '/');
  const titles: Record<string, string> = {
    '/': 'simple',
    '/resize': 'resize',
    '/custom-settings': 'custom widget settings',
    '/explicit-saving': 'explicit saving',
    '/layouts': 'dashboard layouts',
    '/layouts/explicit-saving': 'layouts explicit saving',
    '/dynamic-options': 'dynamic options',
    '/dynamic-data': 'dynamic data',
  };
  for (const route of routes) {
    const link = page.locator('nav a').filter({ hasText: titles[route] }).first();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${route.replace('/', '\\/')}$`));
  }
});

test('unknown hash redirects to the root route', async ({ page }) => {
  await page.goto('/#/does-not-exist');
  await expect(page).toHaveURL(/#\/$/);
  await expectDescription(page, descriptions['/']);
});
