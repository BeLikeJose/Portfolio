// Checks a client code on the server and, if valid, returns the 2-hour booking link.
import type { APIRoute } from 'astro';
import { CLIENT_BOOKING_URL, CLIENT_CODES } from 'astro:env/server';

export const prerender = false;

const norm = (s: string) => s.trim().toUpperCase().replace(/\s+/g, '');

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  let code = '';
  try { code = norm(String((await request.json()).code || '')); } catch { /* bad body */ }
  const codes = (CLIENT_CODES || '').split(',').map(norm).filter(Boolean);
  await new Promise((r) => setTimeout(r, 400)); // slow down guessing
  if (!code || !codes.includes(code)) return new Response(JSON.stringify({ ok: false }), { status: 401, headers });
  if (!CLIENT_BOOKING_URL) return new Response(JSON.stringify({ ok: false, reason: 'not-configured' }), { status: 503, headers });
  return new Response(JSON.stringify({ ok: true, url: CLIENT_BOOKING_URL }), { headers });
};
