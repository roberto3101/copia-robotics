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

export function contenido<T = Record<string, any>>(idioma: Idioma, ruta: string): T {
  const clave = `../idiomas/${idioma}/${ruta}.json`;
  const paquete = paquetes[clave];
  if (!paquete) throw new Error(`Contenido inexistente: ${clave}`);
  return paquete as T;
}

export function esIdioma(valor: string | undefined): valor is Idioma {
  return idiomas.includes(valor as Idioma);
}
