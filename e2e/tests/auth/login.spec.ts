import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../../fixtures/api';

test.describe('Login', () => {
	test('signs in with email and password', async ({ page }) => {
		await page.goto('/admin/login');
		await page.getByPlaceholder('Email').fill(ADMIN_EMAIL);
		await page.getByPlaceholder('Password').fill(ADMIN_PASSWORD);
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page.getByRole('link', { name: 'settings' })).toBeVisible();
		await expect(page).not.toHaveURL(/\/admin\/login/);
	});

	test('rejects a wrong password', async ({ page }) => {
		await page.goto('/admin/login');
		await page.getByPlaceholder('Email').fill(ADMIN_EMAIL);
		await page.getByPlaceholder('Password').fill('not-the-password');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page.getByText('Wrong username or password')).toBeVisible();
		await expect(page).toHaveURL(/\/admin\/login/);
	});

	test('redirects to the login page when signed out', async ({ page }) => {
		await page.goto('/admin/content');

		await expect(page).toHaveURL(/\/admin\/login/);
	});
});
