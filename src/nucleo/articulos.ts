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
  /** `null` cuando el artículo no tiene portada. No se inventa ninguna. */
  imagen: string | null;
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
 * Vídeos escritos como línea suelta.
 *
 * El editor del panel tiene botones que escriben `@youtube: <url>` y
 * `@video: <url>` en una línea propia. Eso no es markdown: sin traducirlo aquí,
 * el visitante veía la línea en crudo mientras la vista previa del panel le
 * había enseñado un reproductor. La previsualización mentía.
 *
 * Se traduce antes de pasar por el procesador de markdown, que deja pasar el
 * HTML de bloque tal cual.
 */

/** Saca el identificador de un vídeo de YouTube de las formas habituales. */
function idDeYoutube(url: string): string | null {
  const limpia = url.trim();
  const patrones = [
    /(?:^|\.)youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const patron of patrones) {
    const encontrado = limpia.match(patron);
    if (encontrado) return encontrado[1];
  }
  return null;
}

function incrustarVideos(markdown: string): string {
  return markdown
    .split('\n')
    .map((linea) => {
      const limpia = linea.trim();

      if (limpia.startsWith('@youtube:')) {
        const id = idDeYoutube(limpia.slice('@youtube:'.length));
        // Solo se acepta un identificador de 11 caracteres del alfabeto de
        // YouTube. Así lo que acaba dentro del `src` nunca es texto libre
        // venido del panel. Si no encaja, se deja la línea como estaba para
        // que el autor vea que algo no cuadró.
        if (!id) return linea;
        return `\n<figure class="video-incrustado"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Vídeo" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></figure>\n`;
      }

      if (limpia.startsWith('@vimeo:')) {
        const id = limpia.slice('@vimeo:'.length).trim().match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (!id) return linea;
        return `\n<figure class="video-incrustado"><iframe src="https://player.vimeo.com/video/${id[1]}" title="Vídeo" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></figure>\n`;
      }

      if (limpia.startsWith('@video:')) {
        const url = limpia.slice('@video:'.length).trim();
        // Solo http(s) y sin caracteres que puedan cerrar el atributo.
        if (!/^https?:\/\//i.test(url) || /["'<>\s]/.test(url)) return linea;
        return `\n<figure class="video-incrustado"><video src="${url}" controls preload="metadata"></video></figure>\n`;
      }

      return linea;
    })
    .join('\n');
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
  const { code } = await procesador.render(incrustarVideos(crudo));
  return code;
}

async function adaptar(post: Post, idioma: Idioma): Promise<Articulo> {
  return {
    ...post,
    html: await aHtml(post),
    fechaLegible: fechaLegible(post.publicado_en, idioma),
    minutosLectura: post.tiempo_lectura_min ?? estimarMinutos(post.contenido ?? ''),
    // Sin portada no se pone ninguna. Antes se repartía una foto de archivo
    // para que las tarjetas no salieran desnudas, y el efecto era peor: el
    // sistema parecia inventarse imagenes que nadie habia subido.
    imagen: post.imagen_portada?.url ?? null,
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
  const ordenados = [...posts].sort((a, b) =>
    (b.publicado_en ?? '').localeCompare(a.publicado_en ?? ''),
  );
  return Promise.all(ordenados.map((post) => adaptar(post, idioma)));
}
