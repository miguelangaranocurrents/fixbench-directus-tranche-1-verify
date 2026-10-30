import { createCollection, createItems, deleteCollection, getJson } from '../../fixtures/api';
import { expect, test } from '../../fixtures/test';

test.describe('Items', () => {
	const collection = 'articles';

	test.beforeAll(async () => {
		await deleteCollection(collection);

		await createCollection(collection, [
			{ field: 'title', type: 'string', meta: { interface: 'input' } },
			{ field: 'published', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } },
		]);

		await createItems(collection, [{ title: 'First article' }, { title: 'Second article' }]);
	});

	test('lists the items of a collection', async ({ page }) => {
		await page.goto(`/admin/content/${collection}`);

		await expect(page.getByRole('cell', { name: 'First article' })).toBeVisible();
		await expect(page.getByRole('cell', { name: 'Second article' })).toBeVisible();
	});

	test('creates an item', async ({ page }) => {
		await page.goto(`/admin/content/${collection}/+`);

		await page.locator('.field', { hasText: 'Title' }).getByRole('textbox').fill('Created from the app');
		await page.getByRole('button', { name: 'Save', exact: true }).click();

		await expect(page).toHaveURL(new RegExp(`/admin/content/${collection}$`));
		await expect(page.getByRole('cell', { name: 'Created from the app' })).toBeVisible();
	});

	test('edits an item', async ({ page }) => {
		const [item] = await createItems(collection, [{ title: 'Draft title' }]);

		await page.goto(`/admin/content/${collection}/${item.id}`);

		const title = page.locator('.field', { hasText: 'Title' }).getByRole('textbox');
		await expect(title).toHaveValue('Draft title');
		await title.fill('Final title');
		await page.getByRole('button', { name: 'Save', exact: true }).click();

		await expect(page).toHaveURL(new RegExp(`/admin/content/${collection}$`));
		const { data } = await getJson(`/items/${collection}/${item.id}`);
		expect(data.title).toBe('Final title');
	});

	test('deletes an item', async ({ page }) => {
		const [item] = await createItems(collection, [{ title: 'Disposable item' }]);

		await page.goto(`/admin/content/${collection}/${item.id}`);
		await page.getByRole('button', { name: 'delete' }).click();
		await page.getByRole('button', { name: 'Delete', exact: true }).click();

		await expect(page).toHaveURL(new RegExp(`/admin/content/${collection}$`));
		await expect(page.getByRole('cell', { name: 'Disposable item' })).toHaveCount(0);
	});

	test('searches items', async ({ page }) => {
		await page.goto(`/admin/content/${collection}`);

		await page.getByRole('search').click();
		await page.getByRole('searchbox', { name: 'Search Items...' }).fill('Second');

		await expect(page.getByRole('cell', { name: 'Second article' })).toBeVisible();
		await expect(page.getByRole('cell', { name: 'First article' })).toHaveCount(0);
	});
});
