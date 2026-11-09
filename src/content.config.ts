// Colecciones de contenido. Los archivos los edita Keystatic (/keystatic) o se editan a mano.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const t = z.string().nullish().transform((v) => (v ?? '').trim());
const base = {
  titulo: z.string(),
  resumen: z.string().nullish().transform((v) => (v ?? '').trim()),
  relato: z.string().nullish().transform((v) => v ?? ''),
  etiquetas: z.array(z.string()).nullish().transform((v) => v ?? []),
  portada: z.string().nullish(),
  video: z.string().nullish(),
  orden: z.number().nullish().transform((v) => v ?? 99),
  galeria: z.array(z.object({
    imagen: z.string().nullish(), video: z.string().nullish(), poster: z.string().nullish(), nota: z.string().nullish(),
  })).nullish().transform((v) => v ?? []),
};
const casos = (carpeta: string, campos: Record<string, typeof t>) =>
  defineCollection({ loader: glob({ pattern: '*.yaml', base: `./src/content/obra/${carpeta}` }), schema: z.object({ ...base, ...campos }) });

export const collections = {
  obraPagina: defineCollection({
    loader: glob({ pattern: 'pagina.yaml', base: './src/content/obra' }),
    schema: z.object({ intro: t, introEstratega: t, introFilmmaker: t, introEditor: t }),
  }),
  estratega: casos('estratega', { cliente: t, contexto: t, decision: t, construi: t, resultado: t }),
  editor: casos('editor', { cliente: t, material: t, herramientas: t, formato: t }),
  filmmaker: casos('filmmaker', { evento: t, fechaLugar: t, rol: t, formato: t, mirada: t }),
};
