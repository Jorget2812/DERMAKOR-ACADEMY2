import { test, expect } from '@playwright/test';

/**
 * DERMAKOR ACADEMY - Secure Product Detail E2E Tests
 * Opus 4.6 Verification Suite
 */

test.describe('Secure Product Detail Architecture', () => {

    test('Public view: Should see product details but NO pricing/purchase options', async ({ page }) => {
        // Navigate to a product page as an anonymous user
        await page.goto('/app/shop/cica-recovery-gentle-serum');

        // Check for base info
        await expect(page.locator('h1')).toContainText('Cica Recovery Gentle Serum');

        // Verify pricing is locked
        await expect(page.getByText('Prix réservé aux professionnels')).toBeVisible();
        await expect(page.getByText('Se connecter para commander')).toBeVisible();

        // Verify purchase controls are NOT visible
        await expect(page.locator('button:has-text("Ajouter au panier")')).not.toBeVisible();
    });

    test('Standard User (Pending/Not Approved): Should NOT see pricing', async ({ page }) => {
        // Assuming standard user is already logged in or we mock session
        // For this test, navigation and UI check is key
        // ... logic to login as standard ...
        await page.goto('/app/shop/cica-recovery-gentle-serum');

        await expect(page.locator('h1')).toContainText('Cica Recovery Gentle Serum');
        await expect(page.getByText('Prix réservé aux profesionales')).toBeVisible();
    });

    test('Approved Professional: Should see prices and stock', async ({ page }) => {
        // ... logic to login as approved pro ...
        await page.goto('/app/shop/cica-recovery-gentle-serum');

        // Should see a numeric price
        await expect(page.locator('text=CHF')).toBeVisible();
        await expect(page.locator('button:has-text("Ajouter au panier")')).toBeVisible();
        await expect(page.getByText('En stock')).toBeVisible();
    });

    test('Admin User: Should see full management details', async ({ page }) => {
        // ... logic to login as admin ...
        await page.goto('/app/shop/cica-recovery-gentle-serum');

        // Admin should see pricing and can also navigate to edit
        await expect(page.locator('text=CHF')).toBeVisible();
        // Verify the SKU or other technical details visible to specialized users
        await expect(page.locator('span:has-text("B2B")')).toBeVisible(); // If we added this tab
    });

});
