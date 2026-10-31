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
		const settledBackground = async (button: typeof edit) => {
			await expect.poll(() => button.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
			return button.evaluate((el) => getComputedStyle(el).backgroundColor);
		};

		await page.locator('.CodeMirror').click();
		await page.keyboard.type('# Release notes');
		await page.mouse.move(0, 0);
		const selectedBefore = await settledBackground(edit);

		await preview.click();
		await page.mouse.move(0, 0);
		await expect(page.getByRole('heading', { name: 'Release notes' })).toBeVisible();

		const previewAfter = await settledBackground(preview);
		const editAfter = await settledBackground(edit);
		expect(previewAfter).not.toBe(editAfter);
		expect(previewAfter).toBe(selectedBefore);
	});
});
