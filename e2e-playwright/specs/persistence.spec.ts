import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, storageJson, widgetTitles, widgets } from './helpers';

test.describe('dashboard persistence', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('serializes only persisted widget fields and restores titles', async ({ page }) => {
    await openRoute(page, '/');
    await widgets(page).first().locator('span.widget-title').dblclick();
    await widgets(page).first().locator('form.widget-title input').fill('Persisted');
    await widgets(page).first().locator('form.widget-title input').press('Enter');
    const stored = await storageJson(page, 'demo_simple');
    expect(stored).not.toHaveProperty('hash');
    expect(stored.widgets).toHaveLength(5);
    for (const widget of stored.widgets) {
      expect(Object.keys(widget).every((key) => ['attrs', 'dataModelOptions', 'name', 'size', 'storageHash', 'style', 'title'].includes(key))).toBeTruthy();
      expect(widget).not.toHaveProperty('dataModel');
      expect(widget).not.toHaveProperty('containerStyle');
      expect(widget).not.toHaveProperty('editingTitle');
    }
    await page.reload({ waitUntil: 'networkidle' });
    await expect(widgets(page).first().locator('span.widget-title')).toHaveText('Persisted');
  });

  test('discards malformed JSON and loads defaults', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('demo_simple', '{malformed'));
    await openRoute(page, '/');
    expect(await widgetTitles(page)).toEqual(['Widget 1', 'Widget 2', 'Widget 3', 'Widget 4', 'Widget 5']);
  });

  test('discards a stale hash and loads defaults', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('demo_simple', JSON.stringify({
      widgets: [{ title: 'Stale', name: 'random' }],
      hash: 'not-the-current-hash',
    })));
    await openRoute(page, '/');
    await expect.poll(() => widgetTitles(page)).toEqual(['Widget 1', 'Widget 2', 'Widget 3', 'Widget 4', 'Widget 5']);
  });

  test('drops saved widgets missing from widget definitions', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('demo_simple', JSON.stringify({
      widgets: [{ title: 'Unknown', name: 'missing-widget' }],
      hash: '',
    })));
    await openRoute(page, '/');
    await expect.poll(() => widgetTitles(page)).toEqual(['Widget 1', 'Widget 2', 'Widget 3', 'Widget 4', 'Widget 5']);
  });
});
