// Datos del sitio en un solo lugar: menú, contacto y la guía del teléfono.
export const CONTACT = {
  email: 'hola@belikejose.com',            // TODO: confirmar email real
  instagram: 'https://instagram.com/belikejose', // TODO: confirmar usuario real
  instagramHandle: '@belikejose',
  calendly: import.meta.env.PUBLIC_CALENDLY_URL || '',
};

export const PAGES = [
  { n: '01', href: '/', label: 'Inicio', sub: 'quién soy y qué hago' },
  { n: '02', href: '/mi-sistema', label: 'Mi sistema', sub: 'cuatro ejes, desde adentro' },
  { n: '03', href: '/portfolio', label: 'Portfolio', sub: 'film, edición y estrategia' },
  { n: '04', href: '/contacto', label: 'Contacto', sub: 'agenda una llamada' },
];

// Guía del teléfono: los números van en orden, agrupados por página.
export const DIRECTORY = [
  { group: 'Inicio', items: [
    { d: 1, label: 'Mi historia', href: '/#historia', say: 'mi historia' },
    { d: 2, label: 'Lo que hago', href: '/#que-hago', say: 'lo que hago' },
  ] },
  { group: 'Mi sistema', items: [
    { d: 3, label: 'Los cuatro ejes', href: '/mi-sistema#ejes', say: 'los cuatro ejes' },
    { d: 4, label: 'El proceso por dentro', href: '/mi-sistema#proceso', say: 'el proceso' },
    { d: 5, label: 'Calendarios y roadmaps', href: '/mi-sistema#por-dentro', say: 'el calendario' },
    { d: 6, label: 'El tostador', href: '/mi-sistema#sin-sistema', say: 'el tostador' },
  ] },
  { group: 'Portfolio', items: [
    { d: 7, label: 'La obra', href: '/portfolio', say: 'el portfolio' },
    { d: 8, label: 'La maleta', href: '/portfolio#maleta', say: 'la maleta' },
  ] },
  { group: 'Contacto', items: [
    { d: 9, label: 'Agenda una llamada', href: '/contacto#agenda', say: 'la agenda' },
    { d: 0, label: 'Operadora — escríbeme', href: '/contacto', say: 'la operadora' },
  ] },
];
