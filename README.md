# Be like José — portafolio

Portafolio editorial de José, director creativo, filmmaker y editor. Incluye un panel privado para crear propuestas con un link único por cliente.

- **Astro**: sitio estático y rápido. Las propuestas se generan en el servidor.
- **Cloudflare Pages**: hosting. Cada push a `main` se publica solo.
- **Supabase**: login del admin, base de datos de propuestas y archivos privados.
- **Three.js**: la trampa de ratón en 3D del inicio.

## Estructura

```
src/
  pages/index.astro        inicio (landing, portfolio, método, sobre mí, contacto)
  pages/admin.astro        panel privado (login por email; RLS en Supabase)
  pages/p/[slug].astro     propuesta del cliente: link único, noindex, Calendly
  components/Trap.astro    trampa 3D + mensaje
  scripts/trap3d.js        escena Three.js de la trampa (madera, metal, sonido, rebote)
  styles/global.css        estilos (blanco #fafafa, grano, tipografías)
  lib/supabase.js          cliente Supabase + propuesta demo
public/scripts/            disco del teléfono, cursor, reveal (common.js) y fotogramas con grano (film.js)
supabase/schema.sql        tabla de propuestas, seguridad y bucket privado
```

## Correr en local

```bash
npm install
cp .env.example .env   # y pon tus claves de Supabase
npm run dev            # http://localhost:4321
```

Sin `.env` todo funciona con datos demo. La propuesta de ejemplo está en `/p/demo`.

## Supabase (una sola vez)

1. Crea un proyecto en supabase.com.
2. En **SQL Editor**, pega `supabase/schema.sql`, cambia `TU_EMAIL_DE_ADMIN@ejemplo.com` por tu email y ejecútalo.
3. En **Authentication → URL Configuration**, agrega `https://tu-dominio/admin` a los Redirect URLs.
4. En **Project settings → API**, copia la URL y la `anon key` a `.env` y a Cloudflare.

Cómo se protege lo privado:
- Solo tu email puede leer o crear propuestas (Row Level Security).
- Un cliente solo puede abrir **una** propuesta, con su slug aleatorio, a través de la función `get_proposal`. No hay forma de listar las demás.
- Las propuestas caducan, cuentan vistas y llevan `noindex`. Además, `robots.txt` bloquea `/admin` y `/p/`.

## Cloudflare Pages

1. En **Workers & Pages → Create → Pages → Connect to Git**, elige este repo.
2. Usa el comando de build `npm run build` y el directorio `dist`.
3. Agrega las variables `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` y `PUBLIC_CALENDLY_URL`.
4. Conecta el dominio en **Custom domains**.

## Material pendiente (reemplaza los placeholders)

- Los fotogramas con grano (`<div class="film" data-scene="...">`) se generan por código. Cámbialos por tus fotos y videos reales: `<video autoplay muted loop playsinline>` o `<img>` dentro del mismo contenedor. El grano se aplica encima de todo.
- Clientes, cifras ("000K") y precios del portfolio son de ejemplo.
- Email, Instagram y link de Calendly.
