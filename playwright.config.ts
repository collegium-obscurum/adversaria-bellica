import { defineConfig } from '@playwright/test';

// avoids pulling in @types/node for a single env read (same trick as vite.config.ts)
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
	testDir: 'tests',
	retries: process.env.CI ? 2 : 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	},
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});
