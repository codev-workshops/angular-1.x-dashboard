import { test, expect } from '@playwright/test';
import { clearDemoStorage, openRoute, widgets } from './helpers';

function input(page: import('@playwright/test').Page, placeholder: string) {
  return page.locator(`input[placeholder="${placeholder}"]`);
}

test.beforeEach(async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/dynamic-data');
});

test('both cart widgets render', async ({ page }) => {
  await expect(widgets(page)).toHaveCount(2);
  await expect(page.locator('.label.label-primary')).toHaveText(['cartDetail', 'cartSummary']);
});

test('valid item updates detail and summary metrics', async ({ page }) => {
  await input(page, 'Item name').fill('Apple');
  await input(page, 'Quantity').fill('2');
  await input(page, 'Unit Price').fill('3.50');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.locator('.cart-detail')).toContainText('Apple');
  await expect(page.locator('.cart-detail')).toContainText('2');
  for (const value of ['Cart Total:', '7.00', 'Total Qty:', '2', 'Most Expensive:', 'Apple', 'Cheapest:', 'Apple']) {
    await expect(page.locator('.cart-summary')).toContainText(value);
  }
});

test('same item merges quantity and recomputes unit price', async ({ page }) => {
  const add = async (qty: string, price: string) => {
    await input(page, 'Item name').fill('Apple');
    await input(page, 'Quantity').fill(qty);
    await input(page, 'Unit Price').fill(price);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
  };
  await add('2', '3.50');
  await add('3', '5.00');
  for (const value of ['Apple', '5', '4.40', '22.00']) {
    await expect(page.locator('.cart-detail')).toContainText(value);
  }
});

test('invalid submits are rejected without changing the cart', async ({ page }) => {
  const detail = page.locator('.cart-detail');
  for (const [name, qty, price] of [['', '2', '3'], ['Apple', '0', '3'], ['Apple', '2', '0']]) {
    await input(page, 'Item name').fill(name);
    await input(page, 'Quantity').fill(qty);
    await input(page, 'Unit Price').fill(price);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
  }
  await expect(detail).toContainText('The cart is empty');
});

test('Auto Fill Cart adds six items and removing one recomputes totals', async ({ page }) => {
  await page.getByRole('button', { name: 'Auto Fill Cart', exact: true }).click();
  await expect(page.locator('.cart-detail tbody tr')).toHaveCount(8);
  const totalBefore = await page.locator('.cart-summary').innerText();
  await page.locator('.cart-detail .glyphicon-remove').first().click();
  await expect(page.locator('.cart-detail tbody tr')).toHaveCount(7);
  await expect(page.locator('.cart-summary')).not.toHaveText(totalBefore);
});
