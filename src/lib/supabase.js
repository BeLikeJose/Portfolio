import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Shown on /p/demo and whenever Supabase is not configured yet.
export const DEMO_PROPOSAL = {
  slug: 'demo',
  client: 'Zentaurus',
  title: 'Dirección creativa — Q1 2027',
  diagnosis: 'Tienen una mirada propia y un producto que la gente quiere. Pero lo que comunican todavía no lo refleja: hoy se ven como catálogo y no como cultura.',
  concept: 'Lo que no se ve, también se viste.',
  deliverables: [
    { item: 'Esencia de marca y oferta de valor', when: 'mes 1' },
    { item: 'Calendario editorial — 16 piezas al mes', when: 'mes 1 – 3' },
    { item: 'Producción audiovisual — 2 jornadas', when: 'mes 2' },
    { item: 'Campaña de lanzamiento', when: 'mes 3' },
  ],
  pricing: [
    { name: 'opción 1 — consultoría 1:1', price: '$0.000', note: 'dirección sin producción' },
    { name: 'opción 2 — completa', price: '$0.000', note: 'dirección + producción incluida' },
  ],
  media: [],
  calendly_url: '',
  created_at: '2026-10-28',
  expires_at: '2026-11-28',
};
