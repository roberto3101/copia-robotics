import type { Idioma } from './idiomas';

export type ClaveSeccion =
  | 'inicio'
  | 'soluciones'
  | 'tecnologia'
  | 'sectores'
  | 'casos'
  | 'nosotros'
  | 'recursos';

export const mapaRutas: Record<ClaveSeccion, Record<Idioma, string>> = {
  inicio: { es: '/', en: '/en/' },
  soluciones: { es: '/soluciones/', en: '/en/solutions/' },
  tecnologia: { es: '/tecnologia/', en: '/en/technology/' },
  sectores: { es: '/sectores/', en: '/en/sectors/' },
  casos: { es: '/casos-de-uso/', en: '/en/use-cases/' },
  nosotros: { es: '/nosotros/', en: '/en/about/' },
  recursos: { es: '/recursos/', en: '/en/resources/' },
};

export const paqueteDeSeccion: Record<ClaveSeccion, string> = {
  inicio: 'inicio',
  soluciones: 'soluciones',
  tecnologia: 'tecnologia',
  sectores: 'sectores',
  casos: 'casos-de-uso',
  nosotros: 'nosotros',
  recursos: 'recursos',
};

export function ruta(clave: ClaveSeccion, idioma: Idioma): string {
  return mapaRutas[clave][idioma];
}

export function rutasAlternas(clave: ClaveSeccion): Record<Idioma, string> {
  return mapaRutas[clave];
}
