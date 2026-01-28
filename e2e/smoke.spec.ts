import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  // Setup: Navigate to homepage before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load and display core navigation elements', async ({ page }) => {
    // Verify navbar loaded successfully
    await expect(page.getByRole('button', { name: 'ArtPortfolio' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'About' })).toBeVisible();
  });

  test('should scroll to About section when clicking About button', async ({ page }) => {
    // Get reference to About heading
    const aboutHeading = page.getByRole('heading', { name: 'About', level: 2 });

    // Click About button in navbar
    await page.getByRole('button', { name: 'About' }).click();

    // Wait for scroll to complete - element should be in viewport
    await expect(aboutHeading).toBeInViewport({ ratio: 0.5 });
  });
});
