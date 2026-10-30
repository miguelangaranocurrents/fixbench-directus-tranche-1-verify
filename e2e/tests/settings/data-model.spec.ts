import { createCollection, deleteCollection, deleteField, getJson } from '../../fixtures/api';
import { expect, test } from '../../fixtures/test';

test.describe('Data model', () => {
	test('creates a collection', async ({ page }) => {
		const name = 'products';
		await deleteCollection(name);

		await page.goto('/admin/settings/data-model/+');
		await page.getByPlaceholder('A unique table name...').fill(name);
		await page.getByRole('button', { name: 'Next', exact: true }).click();
		await page.getByRole('button', { name: 'Finish Setup' }).click();

		await expect(page).toHaveURL(new RegExp(`/admin/settings/data-model/${name}$`));
		const { data } = await getJson(`/collections/${name}`);
		expect(data.collection).toBe(name);
	});

	test('adds a text input field', async ({ page }) => {
		const collection = 'authors';
		await createCollection(collection);
		await deleteField(collection, 'nickname');

		await page.goto(`/admin/settings/data-model/${collection}/+`);
		await page.getByRole('button', { name: 'Input', exact: true }).click();
		await page.getByRole('textbox', { name: 'A unique column name...' }).fill('nickname');
		await page.locator('#dialog-outlet').getByRole('button', { name: 'Save', exact: true }).click();

		await expect(page.getByText('nickname', { exact: true })).toBeVisible();
		const { data } = await getJson(`/fields/${collection}/nickname`);
		expect(data.type).toBe('string');
	});

	test('keeps the m2m configuration open when files are chosen as related collection', async ({ page }) => {
		const collection = 'projects';
		await createCollection(collection);

		await page.goto(`/admin/settings/data-model/${collection}/+`);
		await page.getByRole('searchbox', { name: 'Search Field...' }).fill('many');
		await page.getByRole('button', { name: 'Many to Many' }).click();
		await page.getByRole('textbox', { name: 'A unique column name...' }).fill('attachments');

		await page.getByRole('button', { name: 'list_alt' }).click();
		await page.getByRole('textbox', { name: 'Search', exact: true }).fill('directus_files');
		await page.getByText('System', { exact: true }).click();
		await page.getByRole('button', { name: 'directus_files' }).click();

		await expect(page.getByRole('button', { name: 'Files', exact: true })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'A unique column name...' })).toHaveValue('attachments');
	});

	test('lists the sub-fields of a repeater created through the API', async ({ page }) => {
		const collection = 'pages';

		await createCollection(collection, [
			{
				field: 'links',
				type: 'json',
				meta: {
					interface: 'list',
					options: {
						fields: [
							{ field: 'label', name: 'Label', type: 'string', meta: { interface: 'input', width: 'half' } },
							{ field: 'url', name: 'URL', type: 'string', meta: { interface: 'input', width: 'half' } },
						],
					},
				},
			},
		]);

		await page.goto(`/admin/settings/data-model/${collection}/links`);
		await page.getByRole('button', { name: 'Interface', exact: true }).click();

		await expect(page.getByRole('button', { name: /label — input/ })).toBeVisible();
		await expect(page.getByRole('button', { name: /url — input/ })).toBeVisible();
	});
});
