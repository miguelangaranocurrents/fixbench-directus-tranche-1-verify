import { clearPresets, createCollection, createItems, deleteCollection } from '../../fixtures/api';
import { expect, test } from '../../fixtures/test';

test.describe('Search filters', () => {
	const collection = 'tasks';

	test.beforeAll(async () => {
		await deleteCollection(collection);

		await createCollection(collection, [{ field: 'title', type: 'string', meta: { interface: 'input' } }]);
		await createItems(collection, [{ title: 'Write report' }, { title: 'Review budget' }]);
	});

	async function openFilters(page: import('@playwright/test').Page) {
		await clearPresets(collection);
		await page.goto(`/admin/content/${collection}`);
		await expect(page.getByRole('cell', { name: 'Write report' })).toBeVisible();

		const search = page.getByRole('search');
		await search.click();

		const filterButton = search.getByRole('button', { name: 'filter_list' });
		await filterButton.hover();
		await expect(page.locator('#app-tooltip-content')).toHaveText('Filter');
		await filterButton.click();

		await search.getByRole('button', { name: 'Add Filter' }).click();
		await page.locator('#menu-outlet').getByRole('button', { name: 'Title', exact: true }).click();

		return search;
	}

	test('narrows the items with a filter', async ({ page }) => {
		const search = await openFilters(page);

		await search.getByRole('textbox', { name: '--' }).fill('report');

		await expect(page.getByRole('cell', { name: 'Write report' })).toBeVisible();
		await expect(page.getByRole('cell', { name: 'Review budget' })).toHaveCount(0);
	});

	test('removes a filter with a long value', async ({ page }) => {
		const search = await openFilters(page);

		await search.getByRole('textbox', { name: '--' }).fill('a rather long value that does not match any task title');
		await expect(page.getByRole('cell', { name: 'Write report' })).toHaveCount(0);

		await search.getByRole('button', { name: 'close' }).click();

		await expect(search.getByRole('listitem')).toHaveCount(0);
		await expect(page.getByRole('cell', { name: 'Write report' })).toBeVisible();
	});
});
