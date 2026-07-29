import { defineConfig } from '@playwright/test';

// avoids pulling in @types/node for a single env read (same trick as vite.config.ts)
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
	testDir: 'tests',
	use: { baseURL: 'http://localhost:4173' },
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});
