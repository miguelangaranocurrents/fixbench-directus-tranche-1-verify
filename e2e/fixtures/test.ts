import { test as base, expect, request, type BrowserContext } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './api';

/** Signs the context in with a fresh session cookie (sessions rotate on refresh, so they can't be shared). */
export async function signIn(context: BrowserContext, baseURL: string, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
	const ctx = await request.newContext({ baseURL });
	const response = await ctx.post('/auth/login', { data: { email, password, mode: 'session' } });
	expect(response.ok()).toBe(true);
	const { cookies } = await ctx.storageState();
	const dismissed = ['license-onboarding-dismissed', 'license-banner-dismissed', 'license-login-modal-dismissed'];
	await context.addCookies([
		...cookies,
		...dismissed.map((name) => ({ name, value: 'true', domain: new URL(baseURL).hostname, path: '/' })),
	]);
	await ctx.dispose();
}

export const test = base.extend({
	context: async ({ context, baseURL }, use) => {
		await signIn(context, baseURL!);
		await use(context);
	},
});

export { expect };
