/**
 * Cliente del CMS Codeplex.
 *
 * El sitio sigue siendo estático: esto se ejecuta una sola vez durante
 * `astro build`, no en el navegador. Trae todos los bloques publicados de cada
 * idioma en una llamada y los deja listos para `contenido()`.
 *
 * Si el CMS no está configurado, no responde o devuelve basura, el sitio se
 * compila igual con los JSON de `src/idiomas/`. Esa es la regla de la que
 * cuelga todo lo demás: una caída del panel no puede impedir un despliegue.
 */

const entorno = (clave: string): string =>
  (import.meta.env?.[clave] as string | undefined)?.trim() ??
  (typeof process !== 'undefined' ? (process.env?.[clave] ?? '').trim() : '');

/** URL base de la API, por ejemplo `https://cms.codeplex.pe`. */
export const URL_CMS = entorno('CMS_URL').replace(/\/+$/, '');
/** Código del sitio en el CMS. En mayúsculas, como exige la tabla `sitio`. */
export const SITIO_CMS = entorno('CMS_SITIO') || 'AIROBOTICS';
/** Segundos antes de rendirse y compilar con el contenido local. */
const ESPERA_MAXIMA = Number(entorno('CMS_ESPERA_SEGUNDOS') || 15);

export const cmsConfigurado = URL_CMS !== '';

/**
 * URL del CMS tal como la ve el navegador del visitante.
 *
 * Suele coincidir con `CMS_URL`, pero se separan porque la compilación puede
 * hablar con la API por una red interna mientras el público la alcanza por
 * otro nombre. Se hornea en el HTML, así que no hace falta que el navegador
 * lea variables de entorno.
 */
const URL_CMS_NAVEGADOR = (entorno('PUBLIC_CMS_URL') || URL_CMS).replace(/\/+$/, '');

/**
 * Compone la URL de un endpoint público del sitio, por ejemplo `contacto`.
 * Devuelve cadena vacía si el CMS no está configurado, que es la señal que
 * usan los formularios para volver al comportamiento `mailto:`.
 */
export function endpointPublico(ruta: string): string {
  if (!URL_CMS_NAVEGADOR) return '';
  return `${URL_CMS_NAVEGADOR}/api/publico/sitios/${encodeURIComponent(SITIO_CMS)}/${ruta}`;
}

export type BloquesPorClave = Record<string, Record<string, unknown>>;

interface Sobre<T> {
  exito: boolean;
  datos: T;
  error?: { codigo: string; mensaje: string };
}

interface RespuestaContenido {
  sitio: string;
  idioma: string;
  total: number;
  publicado_en: string;
  bloques: BloquesPorClave;
}

async function pedir<T>(ruta: string): Promise<T | null> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), ESPERA_MAXIMA * 1000);
  try {
    const respuesta = await fetch(`${URL_CMS}${ruta}`, {
      headers: { Accept: 'application/json' },
      signal: controlador.signal,
    });
    if (!respuesta.ok) {
      console.warn(`[cms] ${ruta} respondió ${respuesta.status}`);
      return null;
    }
    const sobre = (await respuesta.json()) as Sobre<T>;
    if (!sobre.exito) {
      console.warn(`[cms] ${ruta} devolvió error: ${sobre.error?.mensaje ?? 'sin detalle'}`);
      return null;
    }
    return sobre.datos;
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.warn(`[cms] ${ruta} falló: ${motivo}`);
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}

/**
 * Descarga los bloques publicados de un idioma. Devuelve `null` —y no un
 * objeto vacío— cuando algo falla, para que quien llama distinga "el CMS dice
 * que no hay nada" de "no pude preguntarle".
 */
export async function traerBloques(idioma: string): Promise<BloquesPorClave | null> {
  if (!cmsConfigurado) return null;
  const datos = await pedir<RespuestaContenido>(
    `/api/publico/sitios/${encodeURIComponent(SITIO_CMS)}/contenido?idioma=${encodeURIComponent(idioma)}`
  );
  if (!datos || typeof datos.bloques !== 'object' || datos.bloques === null) return null;
  return datos.bloques;
}

// ---------------------------------------------------------------- artículos

export interface Post {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  formato_contenido: string;
  idioma: string;
  estado: string;
  publicado_en: string | null;
  tiempo_lectura_min: number | null;
  seo_titulo: string;
  seo_descripcion: string;
  imagen_portada?: { url: string; texto_alt: string } | null;
  autor?: { nombre_publico: string; slug: string } | null;
  categorias?: Array<{ nombre: string; slug: string }>;
  etiquetas?: Array<{ nombre: string; slug: string }>;
}

interface Paginado<T> {
  elementos: T[];
  pagina: number;
  tamano_pagina: number;
  total_filas: number;
  total_paginas: number;
}

/**
 * Lista los artículos publicados de un idioma. Devuelve `[]` si el CMS no está
 * disponible: la sección de recursos se compila sin artículos en vez de
 * romper el despliegue entero.
 */
export async function traerPosts(idioma: string, limite = 60): Promise<Post[]> {
  if (!cmsConfigurado) return [];
  const datos = await pedir<Paginado<Post>>(
    `/api/publico/sitios/${encodeURIComponent(SITIO_CMS)}/posts` +
      `?idioma=${encodeURIComponent(idioma)}&pagina=1&tamano_pagina=${limite}`
  );
  return datos?.elementos ?? [];
}

export interface Tema {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  color: string;
}

/**
 * Los temas bajo los que se agrupan los artículos. Devuelve `[]` si el CMS no
 * responde: el blog se queda sin filtros pero sigue leyéndose.
 */
export async function traerTemas(): Promise<Tema[]> {
  if (!cmsConfigurado) return [];
  const datos = await pedir<Tema[] | { elementos: Tema[] }>(
    `/api/publico/sitios/${encodeURIComponent(SITIO_CMS)}/categorias`,
  );
  if (!datos) return [];
  return Array.isArray(datos) ? datos : (datos.elementos ?? []);
}

export async function traerPost(idioma: string, slug: string): Promise<Post | null> {
  if (!cmsConfigurado) return null;
  return pedir<Post>(
    `/api/publico/sitios/${encodeURIComponent(SITIO_CMS)}/posts/${encodeURIComponent(slug)}` +
      `?idioma=${encodeURIComponent(idioma)}`
  );
}
