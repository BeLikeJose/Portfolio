// La obra: las tres pestañas, sus campos de ficha y cómo se leen los casos.
// Cada caso tiene su propia página en /portfolio/<pestaña>/<archivo> (ver src/pages/portfolio/[tab]/[slug].astro).
import { getCollection } from 'astro:content';

export type Tab = 'estratega' | 'filmmaker' | 'editor';

export const TABS: Record<Tab, { label: string; hash: string; scene: string; tone?: string; campos: [string, string][] }> = {
  estratega: { label: 'Estratega creativo', hash: 'strat', scene: 'window',
    campos: [['cliente', 'Cliente'], ['contexto', 'Contexto'], ['decision', 'Decisión creativa'], ['construi', 'Lo que construí'], ['resultado', 'Resultado']] },
  filmmaker: { label: 'Filmmaker', hash: 'film', scene: 'street',
    campos: [['evento', 'Evento'], ['fechaLugar', 'Fecha y lugar'], ['rol', 'Mi rol'], ['formato', 'Formato'], ['mirada', 'Mi mirada']] },
  editor: { label: 'Editor', hash: 'edit', scene: 'studio', tone: 'bw',
    campos: [['cliente', 'Cliente'], ['material', 'Material de partida'], ['herramientas', 'Herramientas'], ['formato', 'Formato']] },
};

export interface Pieza { imagen?: string | null; video?: string | null; poster?: string | null; nota?: string | null }
export interface Caso {
  slug: string; tab: Tab; url: string;
  titulo: string; resumen: string; relato: string; etiquetas: string[];
  portada?: string | null; video?: string | null; orden: number; galeria: Pieza[];
  [k: string]: unknown;
}

/** Los casos de una pestaña, ordenados (el 1 primero). */
export async function casos(tab: Tab): Promise<Caso[]> {
  const list = await getCollection(tab);
  return list
    .map((e) => ({ ...(e.data as object), slug: e.id, tab, url: `/portfolio/${tab}/${e.id}` }) as Caso)
    .sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo));
}

/** Un .mp4/.webm/.mov se reproduce en la página; cualquier otro link (Instagram, YouTube…) abre aparte. */
export const esArchivo = (u?: string | null) => !!u && /\.(mp4|webm|mov)(\?|#|$)/i.test(u);

/** Nombre único para la transición entre la portada en el índice y la página del caso. */
export const vt = (c: Caso) => `caso-${c.tab}-${c.slug}`.replace(/[^a-zA-Z0-9-]/g, '-');
