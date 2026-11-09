// Keystatic: el panel para editar La obra. Se abre en /keystatic.
// En local guarda en los archivos; publicado, guarda en GitHub (BeLikeJose/Portfolio) y Cloudflare redespliega solo.
import { config, collection, singleton, fields } from '@keystatic/core';

const texto = (label: string, description?: string) => fields.text({ label, description, multiline: true });

// Campos que comparten los casos de las tres pestañas.
const base = {
  titulo: fields.slug({ name: { label: 'Título del caso', validation: { isRequired: true } } }),
  etiquetas: fields.array(fields.text({ label: 'Etiqueta' }), { label: 'Etiquetas', description: 'Palabras cortas sobre el caso, por ejemplo: concepto, lanzamiento.', itemLabel: (p) => p.value || 'etiqueta' }),
  portada: fields.image({ label: 'Portada (foto)', description: 'Opcional. JPG o WebP, idealmente menos de 500 KB.', directory: 'public/media/obra', publicPath: '/media/obra/' }),
  video: fields.url({ label: 'Video (link)', description: 'Opcional. Un link .mp4 se reproduce en la página. Un link de Instagram, YouTube o Vimeo aparece como botón "ver video" sobre la portada.' }),
  galeria: fields.array(
    fields.object({
      imagen: fields.image({ label: 'Foto o captura', description: 'Una imagen. Se muestra completa, sin recortar. Si esta pieza es un video, deja esto vacío.', directory: 'public/media/obra', publicPath: '/media/obra/' }),
      video: fields.url({ label: 'Video (link .mp4)', description: 'Opcional. Link directo a un .mp4; se reproduce en la página con el reproductor nativo, con su proporción.' }),
      poster: fields.image({ label: 'Imagen de portada del video', description: 'Opcional. Si no la pones, se ve el primer cuadro del video.', directory: 'public/media/obra', publicPath: '/media/obra/' }),
      nota: fields.text({ label: 'Nota (opcional)', description: 'Una línea debajo de la pieza.' }),
    }),
    { label: 'Galería', description: 'Capturas, fotos y videos del caso. Cada uno se ve con su proporción original.', itemLabel: (p) => p.fields.nota.value || p.fields.video.value || (p.fields.imagen.value ? 'foto' : 'pieza') },
  ),
  orden: fields.integer({ label: 'Orden', description: 'El 1 es el caso grande de la pestaña; los demás van al lado.', defaultValue: 1 }),
};

const casos = (label: string, carpeta: string, campos: Record<string, ReturnType<typeof texto>>, etiquetas?: { label: string; description: string }) =>
  collection({
    label, slugField: 'titulo', path: `src/content/obra/${carpeta}/*`, format: { data: 'yaml' }, columns: ['orden'],
    schema: { ...base, ...(etiquetas && { etiquetas: fields.array(fields.text({ label: etiquetas.label }), { ...etiquetas, itemLabel: (p) => p.value || 'etiqueta' }) }), ...campos },
  });

export default config({
  storage: import.meta.env.DEV ? { kind: 'local' } : { kind: 'github', repo: 'BeLikeJose/Portfolio' },
  ui: {
    brand: { name: 'Be like José' },
    navigation: { 'La obra': ['pagina', 'estratega', 'editor', 'filmmaker'] },
  },
  singletons: {
    pagina: singleton({
      label: 'Textos de La obra',
      path: 'src/content/obra/pagina',
      format: { data: 'yaml' },
      schema: {
        intro: texto('Introducción de la página'),
        introEstratega: texto('Introducción · Estratega creativo'),
        introFilmmaker: texto('Introducción · Filmmaker'),
        introEditor: texto('Introducción · Editor'),
      },
    }),
  },
  collections: {
    estratega: casos('Estratega creativo', 'estratega', {
      cliente: texto('Cliente'),
      contexto: texto('Contexto'),
      decision: texto('Decisión creativa'),
      construi: texto('Lo que construí'),
      resultado: texto('Resultado'),
    }),
    editor: casos('Editor', 'editor', {
      cliente: texto('Cliente'),
      material: texto('Material de partida'),
      herramientas: texto('Herramientas'),
      formato: texto('Formato'),
    }, { label: 'Qué hice', description: 'Cada cosa que hiciste, una por una. Se muestran como etiquetas: Color grading, Motion graphics…' }),
    filmmaker: casos('Filmmaker', 'filmmaker', {
      evento: texto('Evento'),
      fechaLugar: texto('Fecha y lugar'),
      rol: texto('Mi rol'),
      formato: texto('Formato'),
      mirada: texto('Mi mirada'),
    }),
  },
});
