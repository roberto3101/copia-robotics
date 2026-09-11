/**
 * Comprobación de forma entre el contenido del repositorio y el del CMS.
 *
 * Las plantillas leen los JSON sin defensa: `datos.elementos.map(e => e.icono)`,
 * `texto.split('\n')`. Si alguien borra un campo desde el panel, la compilación
 * revienta y el sitio no se despliega. Como el JSON de `src/idiomas/` es una
 * copia de lo que las plantillas esperan, sirve de referencia: un bloque del
 * CMS solo se acepta si conserva la forma del local.
 *
 * No es validación de esquema completa; es el cortafuegos barato que evita que
 * una edición descuidada tumbe un despliegue.
 */

type Clase = 'nulo' | 'lista' | 'objeto' | 'texto' | 'numero' | 'booleano';

function clase(valor: unknown): Clase {
  if (valor === null || valor === undefined) return 'nulo';
  if (Array.isArray(valor)) return 'lista';
  switch (typeof valor) {
    case 'object':
      return 'objeto';
    case 'number':
      return 'numero';
    case 'boolean':
      return 'booleano';
    default:
      return 'texto';
  }
}

export interface Discrepancia {
  ruta: string;
  motivo: string;
}

/**
 * Recorre el par de documentos y anota dónde el remoto se aparta del local.
 *
 * Reglas:
 * - toda clave del local debe existir en el remoto (quitar una rompe plantillas);
 * - los tipos deben coincidir (un texto convertido en objeto rompe `.split`);
 * - en las listas se compara cada elemento remoto contra el primero del local,
 *   que es el que define la forma de la tarjeta;
 * - una lista remota vacía se acepta: vaciar una sección es una decisión
 *   editorial legítima y `.map` sobre vacío no falla;
 * - las claves de más en el remoto se ignoran: añadir datos nunca rompe nada.
 */
export function comparar(local: unknown, remoto: unknown, ruta = ''): Discrepancia[] {
  const claseLocal = clase(local);
  const claseRemoto = clase(remoto);

  // El local nulo no impone nada: no sabemos qué forma esperaba.
  if (claseLocal === 'nulo') return [];

  if (claseRemoto === 'nulo') {
    return [{ ruta: ruta || '(raíz)', motivo: `falta (se esperaba ${claseLocal})` }];
  }
  if (claseLocal !== claseRemoto) {
    return [{ ruta: ruta || '(raíz)', motivo: `es ${claseRemoto} y se esperaba ${claseLocal}` }];
  }

  if (claseLocal === 'objeto') {
    const objetoLocal = local as Record<string, unknown>;
    const objetoRemoto = remoto as Record<string, unknown>;
    return Object.keys(objetoLocal).flatMap((clave) =>
      comparar(objetoLocal[clave], objetoRemoto[clave], ruta ? `${ruta}.${clave}` : clave)
    );
  }

  if (claseLocal === 'lista') {
    const listaLocal = local as unknown[];
    const listaRemoto = remoto as unknown[];
    if (listaLocal.length === 0 || listaRemoto.length === 0) return [];
    const molde = listaLocal[0];
    return listaRemoto.flatMap((elemento, indice) =>
      comparar(molde, elemento, `${ruta}[${indice}]`)
    );
  }

  return [];
}

/** Atajo booleano sobre `comparar`. */
export function conservaLaForma(local: unknown, remoto: unknown): boolean {
  return comparar(local, remoto).length === 0;
}
