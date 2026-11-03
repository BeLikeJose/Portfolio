// Datos del sitio en un solo lugar: menú, contacto y la guía del teléfono.
export const CONTACT = {
  email: 'hola@belikejose.com',            // TODO: confirmar email real
  instagram: 'https://instagram.com/belikejose', // TODO: confirmar usuario real
  instagramHandle: '@belikejose',
  calendly: import.meta.env.PUBLIC_CALENDLY_URL || '',
};

export const PAGES = [
  { n: '01', href: '/', label: 'Mi historia', sub: 'quién soy y qué hago' },
  { n: '02', href: '/portfolio', label: 'Portfolio', sub: 'obra, métricas y alcance' },
  { n: '03', href: '/mi-sistema', label: 'Mi sistema', sub: 'cuatro ejes, desde adentro' },
  { n: '04', href: '/contacto', label: 'Agenda una llamada', sub: '30 minutos para empezar' },
];
