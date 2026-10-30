import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: 2,
	workers: process.env.CI ? 2 : 1,
	timeout: 60_000,
	expect: { timeout: 15_000 },
	reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results.json' }]],
	use: {
		...devices['Desktop Chrome'],
		baseURL: process.env.DIRECTUS_URL ?? 'http://localhost:8055',
		viewport: { width: 1440, height: 900 },
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [{ name: 'chromium' }],
});
