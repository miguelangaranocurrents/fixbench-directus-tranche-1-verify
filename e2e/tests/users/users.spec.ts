import { getJson } from '../../fixtures/api';
import { expect, test } from '../../fixtures/test';

test.describe('User directory', () => {
	test('lists the admin user', async ({ page }) => {
		await page.goto('/admin/users');

		await expect(page.getByRole('cell', { name: 'admin@example.com' })).toBeVisible();
	});

	test('updates the first name of the current user', async ({ page }) => {
		const { data: me } = await getJson('/users/me');
		const firstName = `Ada ${Date.now()}`;

		await page.goto(`/admin/users/${me.id}`);
		await page.locator('.field', { hasText: 'First Name' }).getByRole('textbox').fill(firstName);
		await page.getByRole('button', { name: 'Save', exact: true }).click();

		await expect.poll(async () => (await getJson('/users/me')).data.first_name).toBe(firstName);
	});
});
