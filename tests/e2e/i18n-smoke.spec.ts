import { test, expect } from '@playwright/test';

test.describe('FASE 1: i18n & Proxy Hardening', () => {

    test('Redirect: GET / -> /fr', async ({ page }) => {
        const response = await page.goto('/');
        await expect(page).toHaveURL(/\/fr/);
        expect(response?.status()).toBe(200);
    });

    test('Redirect: GET /shop -> /fr/shop', async ({ page }) => {
        const response = await page.goto('/shop');
        await expect(page).toHaveURL(/\/fr\/shop/);
        expect(response?.status()).toBe(200);
    });

    test('Status: /fr/shop should render 200 without error', async ({ page }) => {
        const response = await page.goto('/fr/shop');
        expect(response?.status()).toBe(200);

        // Verificar que no hay error visible de mensajes faltantes
        const bodyText = await page.textContent('body');
        expect(bodyText).not.toContain('Error: MISSING_MESSAGE');
    });

    test('Invalid Locale: GET /es/shop -> /fr (fallback)', async ({ page }) => {
        await page.goto('/es/shop');
        await expect(page).toHaveURL(/\/fr/);
    });

});
