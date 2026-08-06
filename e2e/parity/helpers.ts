import { expect, Page } from '@playwright/test';

export const routes = [
  '/',
  '/resize',
  '/custom-settings',
  '/explicit-saving',
  '/layouts',
  '/layouts/explicit-saving',
  '/dynamic-options',
  '/dynamic-data',
];

export async function clearDemoStorage(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('__parityStorageCleared') === '1') {
      return;
    }
    sessionStorage.setItem('__parityStorageCleared', '1');
    const keys = [
      'demo_simple',
      'demo_resize',
      'custom-settings',
      'explicitSave',
      'demo-layouts',
      'demo-layouts-explicit-save',
      'demo_dynamic-data',
    ];
    keys.forEach((key) => localStorage.removeItem(key));
    Object.keys(localStorage)
      .filter((key) => key.startsWith('demo_dynamic-options_'))
      .forEach((key) => localStorage.removeItem(key));
  });
}

export async function openRoute(page: Page, route: string) {
  await page.goto(`/#${route}`);
  await expect(page.locator('.dashboard-widget-area').first()).toBeVisible();
}

export function widgets(page: Page) {
  return page.locator('.widget.panel.panel-default');
}

export function widgetTitles(page: Page) {
  return page.locator('span.widget-title');
}

export async function widgetNames(page: Page) {
  return page.locator('.label.label-primary').allTextContents();
}

export async function dragMouse(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i += 1) {
    const progress = i / 8;
    await page.mouse.move(
      from.x + (to.x - from.x) * progress,
      from.y + (to.y - from.y) * progress,
    );
  }
  await page.mouse.up();
}

export async function storageValue(page: Page, key: string) {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
}

export async function expectDescription(page: Page, description: string) {
  const banner = page.locator('.alert.alert-success').filter({ hasText: 'Description:' }).first();
  await expect(banner).toContainText(`Description: ${description}`);
  await expect(banner.locator('strong')).toHaveText('Description:');
}
