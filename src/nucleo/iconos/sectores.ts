import {
  arco,
  circulo,
  escudoContorno,
  linea,
  poligono,
  polilinea,
  rectangulo,
  type Icono,
} from './formas';

const municipio: Icono = [
  polilinea([
    [2.8, 9.4],
    [12, 4.2],
    [21.2, 9.4],
  ]),
  linea([4.8, 9.4], [4.8, 18.6]),
  linea([9.2, 9.4], [9.2, 18.6]),
  linea([14.8, 9.4], [14.8, 18.6]),
  linea([19.2, 9.4], [19.2, 18.6]),
  linea([2.8, 18.6], [21.2, 18.6]),
  linea([2.8, 21], [21.2, 21]),
];

const escudo: Icono = [
  escudoContorno,
  polilinea([
    [9.4, 11.6],
    [11.4, 14.2],
    [14.8, 9.6],
  ]),
];

const escudoCheck: Icono = [
  escudoContorno,
  polilinea([
    [8.8, 11.8],
    [11.2, 14.2],
    [15.2, 9.6],
  ]),
];

const escudoPin: Icono = [
  escudoContorno,
  polilinea([
    [12, 16],
    [9.2, 12],
    [9.2, 10.4],
  ]),
  arco([9.2, 10.4], [14.8, 10.4], 2.8, false, 1),
  linea([14.8, 10.4], [14.8, 12]),
  linea([14.8, 12], [12, 16]),
  circulo([12, 10.4], 0.9),
];

const industria: Icono = [
  polilinea([
    [3, 20.4],
    [3, 9.6],
    [8, 12.8],
    [8, 9.6],
    [13, 12.8],
    [13, 6.4],
    [16.4, 20.4],
  ]),
  polilinea([
    [16.4, 6.4],
    [20.6, 6.4],
    [20.6, 20.4],
  ]),
  linea([2.4, 20.6], [21.6, 20.6]),
  linea([6, 16.6], [7.6, 16.6]),
  linea([11, 16.6], [12.6, 16.6]),
];

const mineria: Icono = [
  linea([5, 15.6], [9.4, 11.2]),
  linea([14.6, 6], [20, 11.4]),
  linea([9.6, 6.2], [17.8, 14.4]),
  arco([3.6, 20.4], [8.2, 15.8], 4.6, false, 1),
  arco([15.8, 15.8], [20.4, 20.4], 4.6, false, 1),
  linea([6.2, 9.6], [14.4, 17.8]),
];

const construccion: Icono = [
  linea([3.4, 20.6], [20.6, 20.6]),
  polilinea([
    [5.6, 20.6],
    [5.6, 6.4],
    [18.4, 9.8],
    [18.4, 20.6],
  ]),
  linea([5.6, 10.4], [18.4, 6.4]),
  linea([9.4, 12.6], [9.4, 20.6]),
  linea([13.6, 13.6], [13.6, 20.6]),
];

const logistica: Icono = [
  rectangulo(2.6, 7.4, 10.2, 8.4, 1),
  polilinea([
    [12.8, 10.2],
    [16.4, 10.2],
    [19.4, 13.2],
    [19.4, 15.8],
    [12.8, 15.8],
  ]),
  circulo([7, 17.6], 1.8),
  circulo([17, 17.6], 1.8),
  linea([8.8, 17.6], [15.2, 17.6]),
  linea([2.6, 17.6], [5.2, 17.6]),
  linea([18.8, 17.6], [21.4, 17.6]),
];

const camion: Icono = [
  rectangulo(2.6, 7.4, 10.2, 8.4, 1),
  polilinea([
    [12.8, 10.2],
    [16.4, 10.2],
    [19.4, 13.2],
    [19.4, 15.8],
    [12.8, 15.8],
  ]),
  circulo([7, 17.6], 1.8),
  circulo([17, 17.6], 1.8),
  linea([8.8, 17.6], [15.2, 17.6]),
];

const cajaLogistica: Icono = [
  poligono([
    [12, 3.6],
    [20.4, 7.6],
    [20.4, 16.4],
    [12, 20.4],
    [3.6, 16.4],
    [3.6, 7.6],
  ]),
  polilinea([
    [3.6, 7.6],
    [12, 11.6],
    [20.4, 7.6],
  ]),
  linea([12, 11.6], [12, 20.4]),
];

const carrito: Icono = [
  circulo([9.4, 19.4], 1.5),
  circulo([17.4, 19.4], 1.5),
  polilinea([
    [2.6, 3.6],
    [5.4, 3.6],
    [8, 14.8],
    [19, 14.8],
    [21.4, 6.8],
    [6.4, 6.8],
  ]),
];

const finanzas: Icono = [
  circulo([12, 12], 9.2),
  polilinea([
    [14.8, 8.8],
    [11.2, 7.6],
    [9.2, 9.4],
    [10.8, 11.6],
    [13.6, 12.6],
    [14.8, 14.6],
    [12.6, 16.4],
    [9, 15.4],
  ]),
  linea([12, 5.6], [12, 18.4]),
];

const educacion: Icono = [
  poligono([
    [12, 4.6],
    [21.4, 8.8],
    [12, 13],
    [2.6, 8.8],
  ]),
  polilinea([
    [6.6, 10.6],
    [6.6, 15.6],
    [12, 18.4],
    [17.4, 15.6],
    [17.4, 10.6],
  ]),
  linea([20.4, 9.2], [20.4, 14.6]),
];

const salud: Icono = [
  rectangulo(4.4, 3.6, 15.2, 16.8, 1.6),
  linea([12, 8.2], [12, 14.6]),
  linea([8.8, 11.4], [15.2, 11.4]),
  linea([2.6, 20.4], [21.4, 20.4]),
];

const vivienda: Icono = [
  polilinea([
    [3.4, 10.4],
    [12, 3.6],
    [20.6, 10.4],
    [20.6, 20.4],
    [3.4, 20.4],
    [3.4, 10.4],
  ]),
  polilinea([
    [9.4, 20.4],
    [9.4, 14.2],
    [14.6, 14.2],
    [14.6, 20.4],
  ]),
];

const energia: Icono = [
  poligono([
    [13.4, 2.6],
    [5.6, 13.4],
    [10.8, 13.4],
    [9.8, 21.4],
    [18.4, 10.4],
    [13.2, 10.4],
  ]),
];

const hoja: Icono = [
  arco([20.4, 3.6], [6.2, 18.8], 15, false, 0),
  linea([6.2, 18.8], [4.6, 14.6]),
  arco([3.6, 20.4], [16.6, 9.6], 16, false, 1),
];

const ancla: Icono = [
  circulo([12, 5], 2.2),
  linea([12, 7.2], [12, 20.4]),
  linea([7.6, 10.4], [16.4, 10.4]),
  arco([3.8, 14.2], [20.2, 14.2], 9.4, false, 0),
];

const personas: Icono = [
  circulo([8.4, 8.4], 2.8),
  circulo([16.4, 9.6], 2.2),
  arco([2.8, 18.6], [14, 18.6], 5.6),
  arco([15, 14.4], [21.2, 18.6], 4.6),
];

const ciudad: Icono = [
  rectangulo(3.4, 8.6, 6.4, 12, 0.8),
  rectangulo(12.4, 4.4, 6.4, 16.2, 0.8),
  linea([5.4, 11.6], [7.8, 11.6]),
  linea([5.4, 14.6], [7.8, 14.6]),
  linea([5.4, 17.6], [7.8, 17.6]),
  linea([14.4, 7.4], [16.8, 7.4]),
  linea([14.4, 10.4], [16.8, 10.4]),
  linea([14.4, 13.4], [16.8, 13.4]),
  linea([14.4, 16.4], [16.8, 16.4]),
  linea([2.4, 20.6], [21.6, 20.6]),
];

const ciudadEscudo: Icono = [
  escudoContorno,
  polilinea([
    [8.4, 15.4],
    [8.4, 9.8],
    [12, 7.8],
    [15.6, 9.8],
    [15.6, 15.4],
    [8.4, 15.4],
  ]),
  polilinea([
    [10.6, 15.4],
    [10.6, 12.8],
    [13.4, 12.8],
    [13.4, 15.4],
  ]),
];

const edificio: Icono = [
  rectangulo(5.4, 3.4, 13.2, 17.2, 1.2),
  linea([8.6, 7.4], [10.6, 7.4]),
  linea([13.4, 7.4], [15.4, 7.4]),
  linea([8.6, 11], [10.6, 11]),
  linea([13.4, 11], [15.4, 11]),
  polilinea([
    [10.4, 20.6],
    [10.4, 16.2],
    [13.6, 16.2],
    [13.6, 20.6],
  ]),
  linea([2.6, 20.6], [21.4, 20.6]),
];

const casco: Icono = [
  arco([3.6, 16.4], [20.4, 16.4], 8.4),
  linea([2.6, 16.4], [21.4, 16.4]),
  polilinea([
    [9.6, 8.8],
    [9.6, 4.4],
    [14.4, 4.4],
    [14.4, 8.8],
  ]),
  linea([9.6, 16.4], [9.6, 9]),
  linea([14.4, 16.4], [14.4, 9]),
];

const alertaSello: Icono = [escudoContorno, linea([12, 8], [12, 12.4]), circulo([12, 15.4], 0.9, true)];

const pieza: Icono = [
  polilinea([
    [9.4, 3.6],
    [9.4, 5.8],
    [7, 5.8],
    [7, 9.4],
    [4.6, 9.4],
    [4.6, 14.6],
    [7, 14.6],
    [7, 18.2],
    [9.4, 18.2],
    [9.4, 20.4],
    [14.6, 20.4],
    [14.6, 18.2],
    [17, 18.2],
    [17, 14.6],
    [19.4, 14.6],
    [19.4, 9.4],
    [17, 9.4],
    [17, 5.8],
    [14.6, 5.8],
    [14.6, 3.6],
    [9.4, 3.6],
  ]),
];

export const sectores: Record<string, Icono> = {
  municipio,
  escudo,
  escudoCheck,
  escudoPin,
  industria,
  mineria,
  construccion,
  logistica,
  camion,
  cajaLogistica,
  carrito,
  finanzas,
  educacion,
  salud,
  vivienda,
  energia,
  hoja,
  ancla,
  personas,
  ciudad,
  ciudadEscudo,
  edificio,
  casco,
  alertaSello,
  pieza,
};
