import { createCollection } from '../../fixtures/api';
import { expect, test } from '../../fixtures/test';

test.describe('Markdown editor', () => {
	const collection = 'notes';

	test.beforeAll(async () => {

		await createCollection(collection, [
			{ field: 'body', type: 'text', meta: { interface: 'input-rich-text-md' } },
		]);
	});

	test('renders the markdown in the preview', async ({ page }) => {
		await page.goto(`/admin/content/${collection}/+`);

		await page.locator('.CodeMirror').click();
		await page.keyboard.type('# Release notes');

		await page.getByRole('button', { name: 'Preview', exact: true }).click();

		await expect(page.getByRole('heading', { name: 'Release notes' })).toBeVisible();
	});

	test('highlights the selected view in the Edit / Preview toggle', async ({ page }) => {
		await page.goto(`/admin/content/${collection}/+`);

		const edit = page.getByRole('button', { name: 'Edit', exact: true });
		const preview = page.getByRole('button', { name: 'Preview', exact: true });
		const background = (button: typeof edit) => button.evaluate((el) => getComputedStyle(el).backgroundColor);

		await preview.click();
		await page.mouse.move(0, 0);

		await expect.poll(async () => (await background(preview)) !== (await background(edit))).toBe(true);
	});
});
