import { api } from '../../fixtures/api';
import { expect, test } from '../../fixtures/test';

test.describe('Project settings', () => {
	test.afterAll(async () => {
		const ctx = await api();
		await ctx.patch('/settings', { data: { project_name: 'Directus' } });
		await ctx.dispose();
	});

	test('renames the project', async ({ page }) => {
		await page.goto('/admin/settings/project');

		await page.locator('.field', { hasText: 'Project Name' }).getByRole('textbox').fill('Acme Content');
		await page.getByRole('button', { name: 'Save', exact: true }).click();
		await page.reload();

		await expect(page.locator('.field', { hasText: 'Project Name' }).getByRole('textbox')).toHaveValue('Acme Content');
	});
});
