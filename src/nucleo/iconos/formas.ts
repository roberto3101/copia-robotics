export type Punto = [number, number];

export type Relleno = boolean | 'fondo';

export type Forma =
  | { tipo: 'linea'; desde: Punto; hasta: Punto }
  | { tipo: 'circulo'; centro: Punto; radio: number; relleno?: Relleno }
  | { tipo: 'rectangulo'; x: number; y: number; ancho: number; alto: number; esquina?: number; relleno?: Relleno }
  | { tipo: 'poligono'; puntos: Punto[]; relleno?: Relleno }
  | { tipo: 'polilinea'; puntos: Punto[] }
  | { tipo: 'arco'; desde: Punto; hasta: Punto; radio: number; mayor?: boolean; sentido?: 0 | 1 }
  | { tipo: 'curva'; d: string; relleno?: Relleno };

export type Icono = Forma[];

export function linea(desde: Punto, hasta: Punto): Forma {
  return { tipo: 'linea', desde, hasta };
}

export function circulo(centro: Punto, radio: number, relleno: Relleno = false): Forma {
  return { tipo: 'circulo', centro, radio, relleno };
}

export function rectangulo(
  x: number,
  y: number,
  ancho: number,
  alto: number,
  esquina = 0,
  relleno: Relleno = false
): Forma {
  return { tipo: 'rectangulo', x, y, ancho, alto, esquina, relleno };
}

export function poligono(puntos: Punto[], relleno: Relleno = false): Forma {
  return { tipo: 'poligono', puntos, relleno };
}

export function polilinea(puntos: Punto[]): Forma {
  return { tipo: 'polilinea', puntos };
}

export function arco(desde: Punto, hasta: Punto, radio: number, mayor = false, sentido: 0 | 1 = 1): Forma {
  return { tipo: 'arco', desde, hasta, radio, mayor, sentido };
}

export function curva(d: string, relleno: Relleno = false): Forma {
  return { tipo: 'curva', d, relleno };
}

export const escudoContorno = poligono([
  [12, 2.6],
  [4.7, 5.7],
  [4.7, 11.9],
  [12, 21.4],
  [19.3, 11.9],
  [19.3, 5.7],
]);

export const cupulaRadar = arco([4.4, 14.6], [19.6, 14.6], 7.6);
export const baseRadar = linea([2.6, 14.6], [21.4, 14.6]);
