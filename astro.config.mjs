// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Static by default; pages that export `prerender = false` (private proposals) run on Cloudflare.
export default defineConfig({
  site: 'https://belikejose.com',
  adapter: cloudflare(),
  devToolbar: { enabled: false },
});
