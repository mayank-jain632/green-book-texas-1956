import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BREAKPOINTS = [320, 375, 768, 1024, 1440, 1920];

async function openApp(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue to the map' }).click();
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
}

test('shows the content note before the map', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Content note' })).toBeVisible();
  await expect(page.getByText('racial violence and exclusion')).toBeVisible();
});

test('route selection reports the longest gap with both bracketing listings', async ({ page }) => {
  await openApp(page);
  await page.getByLabel(/Houston to Orange/).check();
  const results = page.getByRole('region', { name: 'Houston to Orange' });
  await expect(results.getByText(/Longest stretch with no Green Book listing within 10 miles/)).toBeVisible();
  await expect(results.getByText(/84 miles/)).toBeVisible();
  await expect(results.getByText(/today.s road/)).toBeVisible();
  await expect(results.getByRole('link', { name: 'Vidor' })).toBeVisible();
});

test('changing the buffer updates the counts', async ({ page }) => {
  await openApp(page);
  await page.getByLabel(/Houston to Orange/).check();
  const results = page.getByRole('region', { name: 'Houston to Orange' });
  await expect(results.getByText(/15 listings in/)).toBeVisible();
  await results.getByText('Change how close counts as nearby').click();
  await page.locator('#buffer').fill('3');
  await expect(results.getByText(/within 3 miles/).first()).toBeVisible();
  await expect(results.getByText(/15 listings in/)).toHaveCount(0);
});

test('a sundown marker opens by keyboard and links to its source entry', async ({ page }) => {
  await openApp(page);
  const marker = page.locator('.leaflet-marker-icon[title^="Vidor"]');
  await marker.focus();
  await page.keyboard.press('Enter');
  const popup = page.locator('.leaflet-popup');
  await expect(popup.getByText('Later research, not information a 1956 traveler had')).toBeVisible();
  await expect(popup.getByRole('link', { name: 'Read the full entry' })).toHaveAttribute(
    'href',
    'https://justice.tougaloo.edu/sundowntown/vidor-tx/',
  );
});

test('a listing popup shows the location quality flag', async ({ page }) => {
  await openApp(page);
  await page.locator('.leaflet-marker-icon[title^="Hotel Theresa"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.leaflet-popup').getByText(/Location: address match/)).toBeVisible();
});

test('the layer view can show only the 1956 information', async ({ page }) => {
  await openApp(page);
  await page.getByLabel('Only what a 1956 traveler could have had').check();
  await expect(page.locator('.leaflet-marker-icon[title*="sundown"]')).toHaveCount(0);
  await expect(page.locator('.leaflet-marker-icon[title*="Green Book"]').first()).toBeVisible();
});

test('the page never uses the word "safe"', async ({ page }) => {
  await openApp(page);
  await page.getByLabel(/El Paso to Dallas/).check();
  expect(await page.locator('body').innerText()).not.toMatch(/\bsafe(ly|r|st)?\b/i);
});

test('has no automatically detectable accessibility violations', async ({ page }) => {
  await openApp(page);
  await page.getByLabel(/Houston to Dallas/).check();
  const results = await new AxeBuilder({ page }).exclude('.leaflet-tile-pane').analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

for (const width of BREAKPOINTS) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await openApp(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
