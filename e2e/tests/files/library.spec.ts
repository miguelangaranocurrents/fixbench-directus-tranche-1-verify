import type { Page } from '@playwright/test';
import { deleteFiles } from '../../fixtures/api';
import { expect, test } from '../../fixtures/test';

async function dropFile(page: Page, name: string, type: string) {
	await page.evaluate(
		({ name, type }) => {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(new File([`contents of ${name}`], name, { type }));
			window.dispatchEvent(new DragEvent('dragenter', { dataTransfer, bubbles: true, cancelable: true }));
			document.body.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true }));
		},
		{ name, type },
	);
}

test.describe('File library', () => {
	test.beforeEach(async ({ page }) => {
		for (const name of ['quarterly-report.csv', 'meeting-minutes.txt', 'kitchen-cabinet.rfa']) await deleteFiles(name);

		await page.goto('/admin/files');
		await expect(page.getByRole('heading', { name: 'File Library' })).toBeVisible();
	});

	test('uploads a file with the upload button', async ({ page }) => {
		await page.getByText('Upload File', { exact: true }).click();
		await page
			.locator('input[type=file]')
			.first()
			.setInputFiles({ name: 'quarterly-report.csv', mimeType: 'text/csv', buffer: Buffer.from('a,b\n1,2\n') });

		await expect(page.getByText('Quarterly Report', { exact: true }).first()).toBeVisible();
	});

	test('uploads a dropped text file', async ({ page }) => {
		await dropFile(page, 'meeting-minutes.txt', 'text/plain');

		await expect(page.getByText('Meeting Minutes', { exact: true }).first()).toBeVisible();
	});

	test('uploads a dropped file the browser has no type for', async ({ page }) => {
		await dropFile(page, 'kitchen-cabinet.rfa', '');

		await expect(page.getByText('Kitchen Cabinet', { exact: true }).first()).toBeVisible();
	});

	test('creates a folder', async ({ page }) => {
		const name = `Invoices ${Date.now()}`;

		await page.getByRole('button', { name: 'create_new_folder' }).click();
		await page.getByPlaceholder('Folder Name...').fill(name);
		await page.getByRole('button', { name: 'Save', exact: true }).click();

		await expect(page.getByRole('button', { name: `folder ${name}` })).toBeVisible();
	});
});
