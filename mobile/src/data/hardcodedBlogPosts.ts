import type { BlogPost } from '../types';

const DEMO_DATE = new Date('2025-03-01T12:00:00');

const HARDCODED: BlogPost[] = [
  {
    id: 'blog-beneficio-creativo',
    title: 'Descubrí tu lado creativo con talleres presenciales',
    slug: 'lado-creativo-talleres-presenciales',
    excerpt: 'Animate a probar nuevas técnicas en compañía.',
    content: `Los talleres presenciales son una forma simple de salir de la rutina y probar algo con las manos: pintura, cerámica, música, cocina y mucho más.

En MiTaller podés explorar propuestas reales cerca tuyo, ver fechas y cupos, y dar el primer paso sin complicaciones.

Este artículo resume la idea que antes mostrábamos en la home: la creatividad se entrena compartiendo espacio con otros y con un guía que te acompaña en cada paso.`,
    coverImageUrl: '/images/stock-ceramica.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: ['inicio'],
    createdAt: DEMO_DATE,
    publishedAt: DEMO_DATE,
  },
  {
    id: 'blog-beneficio-comunidad',
    title: 'Aprendé en un ambiente que te inspira',
    slug: 'ambiente-inspirador-talleres',
    excerpt: 'Conectá con otros artistas y compartí experiencias.',
    content: `Aprender solo tiene su lugar, pero en un taller grupal la energía cambia: intercambiás tips, celebrás avances ajenos y mantenés la constancia con más facilidad.

Elegí actividades que te gusten, sumate a un grupo chico y dejá que el ritmo del encuentro te lleve.

Este contenido reemplaza la tarjeta de “ambiente / comunidad” de la sección anterior de la app.`,
    coverImageUrl: '/images/stock-pintura.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: ['inicio'],
    createdAt: DEMO_DATE,
    publishedAt: DEMO_DATE,
  },
  {
    id: 'blog-beneficio-cerca',
    title: 'Talleres cerca de tu ubicación',
    slug: 'talleres-cerca-ubicacion',
    excerpt: 'Encontrá talleres presenciales en tu zona.',
    content: `Filtrá por zona, revisá dirección aproximada y elegí algo que puedas llegar sin drama.

MiTaller está pensado para que encuentres propuestas presenciales con información clara y actualizada.

Este artículo amplía la tarjeta que invitaba a buscar talleres cerca tuyo.`,
    coverImageUrl: '/images/stock-plantas.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: ['inicio'],
    createdAt: DEMO_DATE,
    publishedAt: DEMO_DATE,
  },
  {
    id: 'blog-beneficio-expertos',
    title: 'Aprendé de expertos',
    slug: 'aprender-de-expertos',
    excerpt: 'Profesores certificados te guiarán en cada paso.',
    content: `Un buen taller no es solo “hacer”: es entender qué estás haciendo y por qué. Los profes publican su experiencia, materiales y modalidad para que sepas a qué te sumás.

Revisá el detalle del taller, las reseñas cuando existan y las sesiones disponibles antes de inscribirte.

Este artículo reemplaza la tarjeta sobre aprender con especialistas.`,
    coverImageUrl: '/images/stock-floral.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: ['inicio'],
    createdAt: DEMO_DATE,
    publishedAt: DEMO_DATE,
  },
  {
    id: 'demo-bienvenida',
    title: 'Bienvenida a MiTaller',
    slug: 'bienvenida-mitaller',
    excerpt:
      'Conocé cómo encontrar talleres presenciales y sumarte a la comunidad en pocos pasos.',
    content: `MiTaller es el lugar para descubrir talleres presenciales cerca tuyo y anotarte sin vueltas.

En esta plataforma podés explorar por categoría, ubicación y fecha, ver el detalle de cada propuesta y guardar tus favoritos cuando tengas cuenta.

Este artículo es una demostración: cuando publiques contenido real desde el panel de administración, los posts de Firestore se mezclarán con estas tarjetas de ejemplo o las reemplazarán en la lista, según cómo esté cargado tu proyecto.

¡Gracias por probar MiTaller!`,
    coverImageUrl: '/images/stock-floral.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: ['inicio'],
    createdAt: DEMO_DATE,
    publishedAt: DEMO_DATE,
  },
  {
    id: 'demo-talleres-cerca',
    title: 'Cómo encontrar talleres cerca tuyo',
    slug: 'talleres-cerca',
    excerpt: 'Tips para usar el mapa y los filtros y ahorrar tiempo al buscar.',
    content: `Buscá por zona o desplazate en el mapa para ver propuestas con ubicación cargada.

Usá los filtros de categoría para acotar resultados: cerámica, pintura, música y más.

Cuando encuentres un taller que te interese, entrá al detalle para ver fechas, cupos y cómo inscribirte.

(Texto de ejemplo — podés reemplazarlo con posts reales desde el admin.)`,
    coverImageUrl: '/images/stock-plantas.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: ['inicio'],
    createdAt: DEMO_DATE,
    publishedAt: DEMO_DATE,
  },
  {
    id: 'demo-comunidad',
    title: 'Aprender en comunidad',
    slug: 'aprender-en-comunidad',
    excerpt:
      'Los talleres presenciales suman la experiencia de compartir con otras personas.',
    content: `Aprender mano a mano con un profesor y con otros estudiantes marca la diferencia: feedback al instante, energía del grupo y resultados que se notan.

MiTaller conecta a quienes enseñan con quienes quieren probar algo nuevo sin complicaciones.

Este contenido es fijo en la app como muestra; los artículos administrados en Firestore aparecerán en el carrusel junto con estas entradas.`,
    coverImageUrl: '/images/stock-ceramica.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: ['inicio'],
    createdAt: DEMO_DATE,
    publishedAt: DEMO_DATE,
  },
  {
    id: 'demo-primer-inscripcion',
    title: 'Tu primera inscripción paso a paso',
    slug: 'primer-inscripcion-paso-a-paso',
    excerpt:
      'Guía rápida para encontrar un taller, revisar fechas y completar tu primera inscripción.',
    content: `1) Entrá a "Explorar talleres" y filtrá por categoría o ubicación.

2) Abrí el taller que te interese y revisá precio, cupos y fechas disponibles.

3) Elegí la sesión, confirmá tu inscripción y seguí el estado desde "Mis talleres".

4) Si sos profesor, después podés revisar alumnos y marcar asistencia desde tu panel.

Este tutorial es fijo y forma parte de la ayuda inicial de la app.`,
    coverImageUrl: '/images/stock-pintura.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: ['inicio'],
    createdAt: DEMO_DATE,
    publishedAt: DEMO_DATE,
  },
];

const HARDCODED_BY_ID = new Map(HARDCODED.map((p) => [p.id, p]));

export function listHardcodedPublishedBlogPosts(): BlogPost[] {
  return [...HARDCODED];
}

export function getHardcodedPublishedBlogPostById(id: string): BlogPost | null {
  return HARDCODED_BY_ID.get(id) ?? null;
}

const HARDCODED_IDS = new Set(HARDCODED.map((p) => p.id));

export function mergeFeaturedHardcodedWithRemote(remote: BlogPost[]): BlogPost[] {
  const rest = remote.filter((p) => !HARDCODED_IDS.has(p.id));
  return [...HARDCODED, ...rest];
}
