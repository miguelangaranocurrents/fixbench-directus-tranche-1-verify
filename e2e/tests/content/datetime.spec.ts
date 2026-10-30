import { createCollection } from '../../fixtures/api';
import { expect, test } from '../../fixtures/test';

test.describe('Datetime interface', () => {
	const collection = 'events';

	test.beforeAll(async () => {

		await createCollection(collection, [{ field: 'starts_on', type: 'date', meta: { interface: 'datetime' } }]);
	});

	test('picks a date from the calendar', async ({ page }) => {
		await page.goto(`/admin/content/${collection}/+`);

		await page.getByRole('button', { name: 'today' }).click();
		await page.locator('.calendar-cell-trigger', { hasText: /^15$/ }).first().click();

		await expect(page.locator('.field', { hasText: 'Starts On' })).toContainText('15th');
	});

	test('shows the weekdays in the language of the user', async ({ page }) => {
		await page.route(/\/users\/me(\?|$)/, async (route) => {
			const response = await route.fetch();
			const body = await response.json();
			if (body.data) body.data.language = 'de-DE';
			await route.fulfill({ response, json: body });
		});

		await page.goto(`/admin/content/${collection}/+`);
		await expect(page.getByRole('button', { name: 'Speichern' })).toBeVisible();

		await page.getByRole('button', { name: 'today' }).click();

		await expect(page.locator('.calendar-head-cell')).toHaveText(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
	});
});
