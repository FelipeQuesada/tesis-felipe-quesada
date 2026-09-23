import type { BlogPost } from '@/types';

const DEMO_DATE = new Date('2025-03-01T12:00:00');

/**
 * Artículos de demostración (no están en Firestore). IDs fijos para enlaces `/blog/[id]`.
 */
const HARDCODED: BlogPost[] = [
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
    coverImageUrl: '/images/stock-pintura.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: [],
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
    categoryIds: [],
    createdAt: DEMO_DATE,
    publishedAt: DEMO_DATE,
  },
  {
    id: 'demo-comunidad',
    title: 'Aprender en comunidad',
    slug: 'aprender-en-comunidad',
    excerpt: 'Los talleres presenciales suman la experiencia de compartir con otras personas.',
    content: `Aprender mano a mano con un profesor y con otros estudiantes marca la diferencia: feedback al instante, energía del grupo y resultados que se notan.

MiTaller conecta a quienes enseñan con quienes quieren probar algo nuevo sin complicaciones.

Este contenido es fijo en la app como muestra; los artículos administrados en Firestore aparecerán en el carrusel junto con estas entradas.`,
    coverImageUrl: '/images/stock-ceramica.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: [],
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
    coverImageUrl: '/images/stock-floral.png',
    authorId: 'demo',
    authorName: 'Equipo MiTaller',
    status: 'published',
    categoryIds: [],
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

/**
 * Pone primero los demos y después el resto sin duplicar por id.
 */
export function mergeFeaturedHardcodedWithRemote(remote: BlogPost[]): BlogPost[] {
  const rest = remote.filter((p) => !HARDCODED_IDS.has(p.id));
  return [...HARDCODED, ...rest];
}
