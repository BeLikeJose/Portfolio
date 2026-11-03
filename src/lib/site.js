// Datos del sitio en un solo lugar: menú, contacto y la guía del teléfono.
export const CONTACT = {
  email: 'hola@belikejose.com',            // TODO: confirmar email real
  instagram: 'https://instagram.com/belikejose', // TODO: confirmar usuario real
  instagramHandle: '@belikejose',
  calendly: import.meta.env.PUBLIC_CALENDLY_URL || '',
};

export const PAGES = [
  { n: '01', href: '/', label: 'Inicio' },
  { n: '02', href: '/portfolio', label: 'Portfolio' },
  { n: '03', href: '/metodo', label: 'Cuatro ejes' },
  { n: '04', href: '/sobre-mi', label: 'Sobre mí' },
  { n: '05', href: '/contacto', label: 'Contacto' },
];

// Guía del teléfono: los números van en orden, agrupados por página.
export const DIRECTORY = [
  { group: 'Portfolio', items: [
    { d: 1, label: 'Filmmaker', href: '/portfolio#film', say: 'filmmaker' },
    { d: 2, label: 'Editor', href: '/portfolio#edit', say: 'editor' },
    { d: 3, label: 'Estratega creativo', href: '/portfolio#strat', say: 'estratega creativo' },
    { d: 4, label: 'Rollo 01', href: '/portfolio#rollo', say: 'rollo 01' },
  ] },
  { group: 'Cuatro ejes', items: [
    { d: 5, label: 'Los cuatro ejes', href: '/metodo', say: 'cuatro ejes' },
    { d: 6, label: 'El tostador', href: '/metodo#toaster', say: 'el tostador' },
  ] },
  { group: 'Sobre mí', items: [
    { d: 7, label: 'Mi historia', href: '/sobre-mi', say: 'mi historia' },
    { d: 8, label: 'La maleta y el huevo', href: '/sobre-mi#objetos', say: 'la maleta' },
  ] },
  { group: 'Contacto', items: [
    { d: 9, label: 'Agenda una llamada', href: '/contacto#agenda', say: 'la agenda' },
    { d: 0, label: 'Operadora — escríbeme', href: '/contacto', say: 'la operadora' },
  ] },
];
