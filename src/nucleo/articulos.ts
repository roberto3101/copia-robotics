/**
 * Artículos del blog, traídos del CMS en tiempo de compilación.
 *
 * El sitio no tenía blog: las tarjetas de «Artículos destacados» eran tres
 * entradas fijas en un JSON y el enlace «Leer más» volvía a la misma página.
 * Aquí viven los artículos reales, con su página de detalle.
 */

import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { traerPosts, traerTemas, type Post, type Tema } from './cms';
import type { Idioma } from './idiomas';

export type { Post, Tema };

/** Artículo ya listo para pintar: con el cuerpo convertido a HTML. */
export interface Articulo extends Post {
  html: string;
  fechaLegible: string;
  minutosLectura: number;
  imagen: string;
  textoAlternativo: string;
  distintivo: string;
}

// Se reutiliza el procesador de Astro para que el markdown del panel se
// renderice igual que el de un archivo .md del proyecto.
const procesador = await createMarkdownProcessor({
  gfm: true,
  smartypants: true,
  syntaxHighlight: 'prism',
});

/**
 * Fotos de reserva para los artículos que aún no tienen una propia.
 *
 * Sin esto, una lista de artículos recién creados sale con la misma imagen
 * repetida en todas las tarjetas, que es de lo primero que se nota.
 */
const FOTOS_DE_RESERVA = [
  '/images/article-city-ai.webp',
  '/images/article-drone.webp',
  '/images/article-operations.webp',
  '/images/city-aerial-street.webp',
  '/images/control-room-wide.webp',
  '/images/city-highway-night.webp',
];

/**
 * Reparte por posición en la lista, no por nombre.
 *
 * Repartir por nombre daba a veces la misma foto a dos artículos seguidos, que
 * es justo lo que se quería evitar. Por posición nunca se repiten dos juntos,
 * a cambio de que la foto de reserva de un artículo pueda cambiar si se
 * publica otro por delante. Para una foto de relleno, ese cambio no importa.
 */
function fotoDeReserva(posicion: number): string {
  return FOTOS_DE_RESERVA[posicion % FOTOS_DE_RESERVA.length];
}

/** Aproxima el tiempo de lectura cuando el CMS no lo trae. */
function estimarMinutos(texto: string): number {
  const palabras = texto.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palabras / 200));
}

const FORMATOS_LARGOS: Record<Idioma, Intl.DateTimeFormatOptions> = {
  es: { day: '2-digit', month: 'short', year: 'numeric' },
  en: { month: 'short', day: '2-digit', year: 'numeric' },
};

function fechaLegible(iso: string | null, idioma: Idioma): string {
  if (!iso) return '';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat(idioma === 'es' ? 'es-PE' : 'en-US', FORMATOS_LARGOS[idioma])
    .format(fecha)
    .replace('.', '');
}

async function aHtml(post: Post): Promise<string> {
  const crudo = post.contenido ?? '';
  // El CMS admite markdown, html y texto portable. Solo el markdown necesita
  // conversión; el html ya viene listo y lo demás se muestra tal cual.
  if (post.formato_contenido === 'HTML') return crudo;
  if (post.formato_contenido !== 'MARKDOWN') {
    return `<p>${crudo.replace(/</g, '&lt;')}</p>`;
  }
  const { code } = await procesador.render(crudo);
  return code;
}

async function adaptar(post: Post, idioma: Idioma, posicion: number): Promise<Articulo> {
  return {
    ...post,
    html: await aHtml(post),
    fechaLegible: fechaLegible(post.publicado_en, idioma),
    minutosLectura: post.tiempo_lectura_min ?? estimarMinutos(post.contenido ?? ''),
    imagen: post.imagen_portada?.url ?? fotoDeReserva(posicion),
    textoAlternativo: post.imagen_portada?.texto_alt || post.titulo,
    distintivo: post.categorias?.[0]?.nombre ?? '',
  };
}

/**
 * Los temas que tienen al menos un artículo publicado en ese idioma.
 *
 * Se cruzan con los artículos en vez de listarlos todos: un filtro que no
 * devuelve nada al pulsarlo es peor que no tener ese filtro.
 */
export async function temasConArticulos(idioma: Idioma): Promise<Tema[]> {
  const [todos, publicados] = await Promise.all([traerTemas(), articulos(idioma)]);
  const usados = new Set(
    publicados.flatMap((a) => (a.categorias ?? []).map((c) => c.slug)),
  );
  return todos.filter((t) => usados.has(t.slug));
}

/**
 * Todos los artículos publicados de un idioma, del más reciente al más
 * antiguo. Devuelve `[]` si el CMS no está configurado o no responde.
 */
export async function articulos(idioma: Idioma): Promise<Articulo[]> {
  const posts = await traerPosts(idioma);
  // Se ordena antes de adaptar para que la posición que decide la foto de
  // reserva sea la misma en la que saldrá el artículo.
  const ordenados = [...posts].sort((a, b) =>
    (b.publicado_en ?? '').localeCompare(a.publicado_en ?? ''),
  );
  return Promise.all(ordenados.map((post, posicion) => adaptar(post, idioma, posicion)));
}
