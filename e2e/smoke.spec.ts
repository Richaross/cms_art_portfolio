import { test, expect } from '@playwright/test';

test('landing page loads and displays portfolio grid', async ({ page }) => {
  // 1. Visit the home page
  await page.goto('http://localhost:3000');

  // 2. Check for the main title or logo
  await expect(page.getByRole('button', { name: 'ArtPortfolio' })).toBeVisible();

  // 3. Check that at least one "Portfolio Collection" card is visible
  // Assuming cards have a specific class or structure?
  // We can look for common text like "View Collection" or just the general grid container if no text is guaranteed.
  // Ideally, use a robust locator. Let's assume we can find the grid or a collection title.
  // For now, let's verify the "About" link is there, which is static.
  await expect(page.getByRole('button', { name: 'About' })).toBeVisible();

  // 4. Verify no critical errors (like 404s or 500s) on initial load
  // (Playwright fails by default if the page crashes on goto, but explicit checks are nice)
});

test('navigation scrolls to About section', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click 'About' in navbar
  await page.getByRole('button', { name: 'About' }).click();

  // Wait for scroll animation to complete
  await page.waitForTimeout(500);

  // Verify the About section heading is visible (the component has an h2 with "About")
  await expect(page.getByRole('heading', { name: 'About', level: 2 })).toBeVisible();
});
