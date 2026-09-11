/**
 * Resolución de imágenes, vídeos y documentos.
 *
 * El contenido original nombra las imágenes por su archivo sin extensión
 * (`"imagen": "article-city-ai"`), que vive en `public/images/`. Desde que se
 * pueden subir archivos desde el panel, el mismo campo puede traer una
 * dirección completa del servidor de medios.
 *
 * Estas funciones aceptan las dos formas, de modo que la migración puede
 * hacerse foto a foto sin tocar las plantillas ni romper lo que ya estaba.
 */

/** Una dirección ya resuelta: absoluta, de otro servidor, o incrustada. */
const yaEsDireccion = (valor: string): boolean =>
  /^(https?:)?\/\//.test(valor) || valor.startsWith('/') || valor.startsWith('data:');

/**
 * Dirección de una imagen. Un nombre suelto se busca en `public/images/`;
 * cualquier otra cosa se devuelve tal cual.
 */
export function urlImagen(valor: string | undefined | null): string {
  const limpio = (valor ?? '').trim();
  if (!limpio) return '';
  return yaEsDireccion(limpio) ? limpio : `/images/${limpio}.webp`;
}

/**
 * Los vídeos y los documentos no necesitan función: el contenido ya los guarda
 * como ruta completa (`/video/demo.mp4`), y un archivo subido llega también
 * como dirección completa. Las plantillas los usan tal cual y ambas formas
 * funcionan sin traducción.
 */
