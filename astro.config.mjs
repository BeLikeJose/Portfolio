// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Static by default; pages that export `prerender = false` (private proposals, /api) run on Cloudflare.
export default defineConfig({
  site: 'https://belikejose.com',
  adapter: cloudflare(),
  devToolbar: { enabled: false },
  redirects: { '/sobre-mi': '/', '/metodo': '/mi-sistema' },
  env: {
    schema: {
      // Google Calendar appointment page for the public 30-min call.
      PUBLIC_BOOKING_URL: envField.string({ context: 'client', access: 'public', optional: true, default: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ28WTN_cATUHFkrF9jmYVupIeYlONRjEj8nr-JZpdLbpHE_-9zPSqTWJ9ilEs3Rf8naEstM9_8I' }),
      // Google Calendar appointment page for 2-hour client sessions. Secret: never sent to the public page.
      CLIENT_BOOKING_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Client codes, comma separated, e.g. "ZENTAURUS-2027,CLIENTE02". Case-insensitive.
      CLIENT_CODES: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
