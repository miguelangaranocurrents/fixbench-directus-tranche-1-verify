import { request, type APIRequestContext } from '@playwright/test';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'd1r3ctu5';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'e2e-admin-token';
const BASE_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export async function api(): Promise<APIRequestContext> {
	return request.newContext({
		baseURL: BASE_URL,
		extraHTTPHeaders: { Authorization: `Bearer ${ADMIN_TOKEN}` },
	});
}

/** Creates a collection with an auto-increment id and the given extra fields, unless it exists. */
export async function createCollection(name: string, fields: Record<string, any>[] = []) {
	const ctx = await api();

	if ((await ctx.get(`/collections/${name}`)).ok()) {
		await ctx.dispose();
		return;
	}

	const response = await ctx.post('/collections', {
		data: {
			collection: name,
			meta: { icon: 'box' },
			schema: {},
			fields: [
				{ field: 'id', type: 'integer', meta: { hidden: true, readonly: true, interface: 'input' }, schema: { is_primary_key: true, has_auto_increment: true } },
				...fields,
			],
		},
	});

	if (!response.ok()) throw new Error(await response.text());

	await ctx.dispose();
}

export async function createItems(collection: string, items: Record<string, any>[]) {
	const ctx = await api();
	const response = await ctx.post(`/items/${collection}`, { data: items });
	if (!response.ok()) throw new Error(await response.text());
	const { data } = await response.json();
	await ctx.dispose();
	return data;
}

export async function getJson(path: string) {
	const ctx = await api();
	const response = await ctx.get(path);
	const body = await response.json();
	await ctx.dispose();
	return body;
}

/** Removes the saved layout presets (filters, search) of a collection. */
export async function clearPresets(collection: string) {
	const ctx = await api();
	const response = await ctx.get('/presets', { params: { 'filter[collection][_eq]': collection, fields: 'id' } });
	const ids = (await response.json()).data.map((preset: { id: number }) => preset.id);
	if (ids.length > 0) await ctx.delete('/presets', { data: ids });
	await ctx.dispose();
}

export async function deleteFiles(filename: string) {
	const ctx = await api();
	const response = await ctx.get('/files', { params: { 'filter[filename_download][_eq]': filename, fields: 'id' } });
	const ids = (await response.json()).data.map((file: { id: string }) => file.id);
	if (ids.length > 0) await ctx.delete('/files', { data: ids });
	await ctx.dispose();
}

export async function deleteCollection(name: string) {
	const ctx = await api();
	await ctx.delete(`/collections/${name}`);
	await ctx.dispose();
}

export async function deleteField(collection: string, field: string) {
	const ctx = await api();
	await ctx.delete(`/fields/${collection}/${field}`);
	await ctx.dispose();
}
