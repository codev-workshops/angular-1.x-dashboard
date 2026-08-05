'use strict';

var { chromium } = require('playwright');

(async function () {
  var browser = await chromium.launch({ headless: true });
  var page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  var errors = [];
  var missing = [];
  page.on('console', function (message) {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', function (error) {
    errors.push(error.message);
  });
  page.on('response', function (response) {
    if (response.status() === 404) missing.push(response.url());
  });
  await page.goto('http://localhost:3000/harness/angular/index.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('[dashboard] .widget', { timeout: 15000 });
  await page.screenshot({ path: '/home/ubuntu/harness-angular.png', fullPage: true });
  var widgetCount = await page.locator('[dashboard] .widget').count();
  var addWidget = await page.locator('[dashboard] .btn-toolbar .btn-primary').count();
  console.log(JSON.stringify({ widgetCount: widgetCount, addWidget: addWidget, errors: errors, missing: missing }, null, 2));
  if (!widgetCount || !addWidget || errors.length || missing.length) process.exitCode = 1;
  await browser.close();
}()).catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
