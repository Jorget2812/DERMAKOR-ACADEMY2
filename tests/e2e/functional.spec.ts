import { test, expect } from '@playwright/test';

test.describe('Internationalization & Redirects', () => {
    test('should redirect root / to /fr', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/fr/);
    });

    test('should redirect /shop to /fr/shop', async ({ page }) => {
        await page.goto('/shop');
        await expect(page).toHaveURL(/\/fr\/shop/);
    });
});

test.describe('Visitor Access Control', () => {
    test('visitor should see prices hidden in shop', async ({ page }) => {
        await page.goto('/fr/shop');
        await expect(page.getByText('Prix masqué').first()).toBeVisible();
    });

    test('visitor should be redirected to login when accessing academy', async ({ page }) => {
        await page.goto('/fr/app/academy');
        await expect(page).toHaveURL(/\/fr\/login/);
    });
});

test.describe('Professional Flow (Standard Level)', () => {
    test.beforeEach(async ({ page }) => {
        // Login as the seeded test user
        await page.goto('/fr/login');
        await page.fill('input[name="email"]', 'pro-testing@example.com');
        await page.fill('input[name="password"]', 'Password123!');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/fr\/app/);
    });

    test('should see professional pricing with 0% VAT', async ({ page }) => {
        await page.goto('/fr/app/shop');

        // Find our test product
        const productCard = page.locator('.group', { hasText: 'Test Product' });
        await expect(productCard).toBeVisible();

        // Check if price is displayed
        await expect(productCard.getByText('100 CHF')).toBeVisible();

        // Standard user should see 0% VAT (HT = Gross)
        // In the UI: HT: 100.00 CHF and no TVA displayed if rate is 0
        await expect(productCard.getByText('HT: 100.00 CHF')).toBeVisible();
        await expect(productCard.getByText('TVA:')).not.toBeVisible();
    });

    test('should not be able to buy out-of-stock items', async ({ page }) => {
        await page.goto('/fr/app/shop');

        const emptyProductCard = page.locator('.group', { hasText: 'Empty Variant' });
        await expect(emptyProductCard).toBeVisible();

        const addButton = emptyProductCard.getByRole('button');
        await expect(addButton).toBeDisabled();
    });

    test('should have access to academy', async ({ page }) => {
        await page.goto('/fr/app/academy');
        // If the page loads without redirecting to login, it should have a specific title or content
        await expect(page.locator('h1')).toContainText(/Académie/i);
    });
});
