import tailwindcss from '@tailwindcss/vite';
import auto from '@sveltejs/adapter-auto';
import node from '@sveltejs/adapter-node';
import vercel from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');

export default defineConfig({
	envDir: repoRoot,
	server: {
		proxy: {
			'/api': 'http://localhost:3001',
			'/health': 'http://localhost:3001'
		}
	},
	ssr: {
		noExternal: ['@bets/shared']
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: process.env.VERCEL ? vercel() : process.env.ADAPTER === 'auto' ? auto() : node()
		})
	]
});
