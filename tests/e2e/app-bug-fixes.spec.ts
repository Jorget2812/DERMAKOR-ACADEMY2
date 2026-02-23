import { test, expect } from '@playwright/test';

test.describe('App Zone Bug Fixes (STANDARD User)', () => {
    test.beforeEach(async ({ page }) => {
        // Login as STANDARD user
        await page.goto('/fr/login');
        await page.fill('input[name="email"]', 'standard@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/app');
    });

    test('Bug 1: Cart is cleared after successful order', async ({ page }) => {
        // 1. Go to shop and add item
        await page.goto('/fr/app/shop');
        await page.click('a[href*="/app/shop/"]');
        await page.click('button:has-text("Ajouter au Panier")');

        // 2. Go to checkout
        await page.goto('/fr/app/checkout');
        await page.fill('input[placeholder*="Jean Dupont"]', 'Test User');
        await page.fill('input[placeholder*="Rue de l\'Académie"]', 'Test Street');
        await page.fill('input[placeholder*="1000"]', '1010');
        await page.fill('input[placeholder*="Lausanne"]', 'Lausanne');
        await page.click('button:has-text("Suivant")');

        // 3. Confirm Order
        await page.click('button:has-text("Confirmer la commande")');
        await expect(page.locator('h2:has-text("Commande Enregistrée")')).toBeVisible();

        // 4. Verify cart is empty in header (badge should be 0 or hidden)
        const cartBadge = page.locator('nav').getByText(/^[0]$/); // Should be 0
        // Or check badge existence
        const badgeCount = await page.locator('.cart-badge').count();
        if (badgeCount > 0) {
            await expect(page.locator('.cart-badge')).toHaveText('0');
        }
    });

    test('Bug 2: Product description renders HTML correctly (not as raw text)', async ({ page }) => {
        await page.goto('/fr/app/shop');
        await page.click('a[href*="/app/shop/"]');

        // Verify no raw HTML tags in the description area
        const description = page.locator('.prose');
        await expect(description).not.toContainText('<p>');
        await expect(description).not.toContainText('<ul>');
    });

    test('Bug 3: Stock visibility (qualitative for STANDARD, no number)', async ({ page }) => {
        await page.goto('/fr/app/shop');
        await page.click('a[href*="/app/shop/"]');

        const stockInfo = page.locator('span:has-text("Stock")');
        await expect(stockInfo).toBeVisible();

        // Should NOT contain a number for standard users
        const text = await stockInfo.innerText();
        expect(text).not.toMatch(/\d+/); // Should not find any digits
    });
});
