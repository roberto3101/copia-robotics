import { cmsConfigurado, traerBloques, type BloquesPorClave } from './cms';
import { comparar } from './forma';

export const idiomas = ['es', 'en'] as const;
export type Idioma = (typeof idiomas)[number];
export const idiomaPorDefecto: Idioma = 'es';

export const etiquetaHtml: Record<Idioma, string> = {
  es: 'es-PE',
  en: 'en-US',
};

const paquetes = import.meta.glob<Record<string, unknown>>('../idiomas/**/*.json', {
  eager: true,
  import: 'default',
});

/**
 * Contenido del CMS, indexado por idioma y clave (`inicio/portada`).
 *
 * Se rellena una sola vez al cargar el módulo, durante la compilación. Los
 * archivos de `src/idiomas/` siguen siendo la base y lo que llega del CMS se
 * superpone. Así el sitio compila con contenido correcto aunque el panel esté
 * caído, y una clave que aún no se haya migrado sigue saliendo del repositorio.
 */
const desdeCms: Partial<Record<Idioma, BloquesPorClave>> = {};

/**
 * Descarta los bloques del CMS que no conservan la forma del JSON local.
 *
 * Las plantillas leen estos datos sin defensa, así que un campo borrado desde
 * el panel tumbaría la compilación entera. Cuando eso pasa se usa el bloque
 * local, se avisa en el registro de la compilación y el despliegue sigue.
 */
function filtrarPorForma(idioma: Idioma, bloques: BloquesPorClave): BloquesPorClave {
  const aceptados: BloquesPorClave = {};

  for (const [ruta, documento] of Object.entries(bloques)) {
    const local = paquetes[`../idiomas/${idioma}/${ruta}.json`];
    // Un bloque que no existe en el repositorio es contenido nuevo creado en
    // el panel: no hay forma contra la que contrastarlo, se acepta tal cual.
    if (!local) {
      aceptados[ruta] = documento;
      continue;
    }
    const discrepancias = comparar(local, documento);
    if (discrepancias.length === 0) {
      aceptados[ruta] = documento;
      continue;
    }
    console.warn(
      `[cms] ${idioma}/${ruta} descartado: no conserva la forma esperada ` +
        `(${discrepancias.length} ${discrepancias.length === 1 ? 'diferencia' : 'diferencias'}). ` +
        `Se compila con el contenido del repositorio.`
    );
    for (const { ruta: campo, motivo } of discrepancias.slice(0, 5)) {
      console.warn(`[cms]   · ${campo} ${motivo}`);
    }
    if (discrepancias.length > 5) {
      console.warn(`[cms]   · … y ${discrepancias.length - 5} más`);
    }
  }
  return aceptados;
}

if (cmsConfigurado) {
  const resultados = await Promise.all(
    idiomas.map(async (idioma) => [idioma, await traerBloques(idioma)] as const)
  );
  for (const [idioma, bloques] of resultados) {
    if (bloques) desdeCms[idioma] = filtrarPorForma(idioma, bloques);
  }
  const resumen = idiomas
    .map((idioma) => `${idioma}: ${Object.keys(desdeCms[idioma] ?? {}).length}`)
    .join(', ');
  console.log(`[cms] bloques aplicados — ${resumen}`);
} else {
  console.log('[cms] CMS_URL sin definir: se compila con el contenido de src/idiomas/');
}

/**
 * Devuelve el contenido de un bloque. Prioriza el CMS y cae al JSON local.
 *
 * Sigue siendo síncrona a propósito: las plantillas la llaman desde su
 * frontmatter y no queremos convertir 85 llamadas en `await`.
 */
export function contenido<T = Record<string, any>>(idioma: Idioma, ruta: string): T {
  const publicado = desdeCms[idioma]?.[ruta];
  if (publicado) return publicado as T;

  const clave = `../idiomas/${idioma}/${ruta}.json`;
  const paquete = paquetes[clave];
  if (!paquete) throw new Error(`Contenido inexistente: ${clave}`);
  return paquete as T;
}

/** Indica si un bloque llegó del CMS o salió del repositorio. Útil al depurar. */
export function origenContenido(idioma: Idioma, ruta: string): 'cms' | 'local' {
  return desdeCms[idioma]?.[ruta] ? 'cms' : 'local';
}

export function esIdioma(valor: string | undefined): valor is Idioma {
  return idiomas.includes(valor as Idioma);
}
