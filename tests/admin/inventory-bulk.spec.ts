import { test, expect } from '@playwright/test';

test.describe('Admin Bulk Inventory Management', () => {
    test.beforeEach(async ({ page }) => {
        // Log in as admin (assuming some auth session or mock)
        // For this test we assume we are already on the inventory page or can navigate there
        await page.goto('/en/admin/inventory');
    });

    test('should display the unified table of variants', async ({ page }) => {
        await expect(page.locator('table')).toBeVisible();
        await expect(page.locator('th').getByText('SKU')).toBeVisible();
        await expect(page.locator('th').getByText('Prix (CHF)')).toBeVisible();
    });

    test('should show floating bar when items are selected', async ({ page }) => {
        // Select first item
        await page.locator('tbody tr').first().locator('button[role="checkbox"]').click();

        // Floating bar should appear
        await expect(page.getByText('Sélectionnés')).toBeVisible();
        await expect(page.getByText('Édition Masiva')).toBeVisible();
    });

    test('should handle inline edits and require explicit save', async ({ page }) => {
        const firstRow = page.locator('tbody tr').first();
        const stockInput = firstRow.locator('input[type="number"]').last();

        await stockInput.fill('999');

        // Save button should appear
        await expect(page.getByText('modifications non enregistrées')).toBeVisible();

        await page.getByRole('button', { name: 'Garder' }).click();

        // Success toast
        await expect(page.getByText('Changements enregistrés')).toBeVisible();
    });

    test('should open bulk edit modal and apply mass changes', async ({ page }) => {
        // Select items
        const rows = page.locator('tbody tr');
        await rows.nth(0).locator('button[role="checkbox"]').click();
        await rows.nth(1).locator('button[role="checkbox"]').click();

        await page.getByRole('button', { name: 'Édition Masiva' }).click();

        // Modal should be visible
        await expect(page.getByText('Modificación de 2 ítems')).toBeVisible();

        // Go to Stock tab
        await page.getByRole('tab', { name: 'Stock' }).click();
        await page.getByPlaceholder('0').fill('150');

        await page.getByRole('button', { name: 'Actualiser le stock' }).click();

        // Success toast
        await expect(page.getByText('variantes mises à jour')).toBeVisible();
    });
});
