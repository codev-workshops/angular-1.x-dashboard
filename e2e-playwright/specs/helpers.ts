import { expect, Page } from '@playwright/test';

export async function openRoute(page: Page, route: string): Promise<void> {
  await page.goto(`/#${route}`, { waitUntil: 'networkidle' });
  await expect(page.locator('body')).not.toHaveClass(/ng-cloak/);
}

export function widgetArea(page: Page) {
  return page.locator('.dashboard-widget-area').first();
}

export function widgets(page: Page) {
  return page.locator('.dashboard-widget-area').first().locator('.widget-container');
}

export async function widgetTitles(page: Page): Promise<string[]> {
  return widgets(page).locator('span.widget-title').allTextContents();
}

export async function clearStorageBeforeBoot(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('e2e-contract-storage-cleared')) {
      localStorage.clear();
      sessionStorage.setItem('e2e-contract-storage-cleared', '1');
    }
  });
}

export async function storageJson(page: Page, key: string): Promise<any> {
  return page.evaluate((storageKey) => {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  }, key);
}
