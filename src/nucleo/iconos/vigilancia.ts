import {
  arco,
  baseRadar,
  circulo,
  cupulaRadar,
  escudoContorno,
  linea,
  poligono,
  polilinea,
  rectangulo,
  type Icono,
} from './formas';

const camara: Icono = [
  poligono([
    [3.4, 9],
    [15.3, 4.7],
    [18, 10.3],
    [6.1, 14.6],
  ]),
  poligono([
    [16.2, 11.5],
    [21.3, 11.5],
    [19, 16.2],
    [15, 14.1],
  ]),
  circulo([9.2, 9.7], 1.5),
  polilinea([
    [2.7, 18.7],
    [6.3, 18.7],
    [8.7, 15.3],
  ]),
  linea([2.7, 21.4], [2.7, 17.5]),
];

const dron: Icono = [
  linea([2.4, 7.4], [10.1, 7.4]),
  linea([13.9, 7.4], [21.6, 7.4]),
  circulo([6.3, 7.4], 1.1),
  circulo([17.7, 7.4], 1.1),
  linea([6.3, 8.5], [9.5, 11.4]),
  linea([17.7, 8.5], [14.5, 11.4]),
  poligono([
    [9.4, 11.3],
    [14.6, 11.3],
    [15.4, 14.2],
    [8.6, 14.2],
  ]),
  circulo([12, 15.7], 1.3),
  linea([9.2, 14.2], [7.4, 18.4]),
  linea([14.8, 14.2], [16.6, 18.4]),
];

const dronVuelo: Icono = [
  linea([1.7, 8.2], [9.3, 8.2]),
  linea([14.7, 8.2], [22.3, 8.2]),
  circulo([5.5, 8.2], 1),
  circulo([18.5, 8.2], 1),
  linea([5.5, 9.2], [9.1, 11.6]),
  linea([18.5, 9.2], [14.9, 11.6]),
  poligono([
    [9, 11.5],
    [15, 11.5],
    [15.8, 14],
    [8.2, 14],
  ]),
  rectangulo(10.7, 14, 2.6, 2.1, 0.5),
  linea([8.9, 14], [7.1, 17.6]),
  linea([15.1, 14], [16.9, 17.6]),
  linea([7.1, 17.6], [16.9, 17.6]),
];

const dronCirculo: Icono = [
  rectangulo(8.6, 8.6, 6.8, 6.8, 1.6),
  circulo([12, 12], 1.8),
  polilinea([
    [8.6, 10.4],
    [4.2, 10.4],
    [4.2, 6.4],
  ]),
  polilinea([
    [15.4, 10.4],
    [19.8, 10.4],
    [19.8, 6.4],
  ]),
  polilinea([
    [8.6, 13.6],
    [4.2, 13.6],
    [4.2, 17.6],
  ]),
  polilinea([
    [15.4, 13.6],
    [19.8, 13.6],
    [19.8, 17.6],
  ]),
];

const sensor: Icono = [
  circulo([12, 12], 3.4),
  arco([10.3, 12.7], [13.5, 11.1], 2.1, false, 1),
  linea([9.6, 9.6], [6.5, 6.5]),
  circulo([5.6, 5.6], 0.9),
  linea([14.4, 9.6], [17.5, 6.5]),
  circulo([18.4, 5.6], 0.9),
  linea([9.6, 14.4], [6.5, 17.5]),
  circulo([5.6, 18.4], 0.9),
  linea([14.4, 14.4], [17.5, 17.5]),
  circulo([18.4, 18.4], 0.9),
];

const cerebro: Icono = [
  arco([12, 4.6], [7.6, 8.2], 3.2, false, 0),
  arco([7.6, 8.2], [6.2, 12], 2.6, false, 0),
  arco([6.2, 12], [7.8, 16.2], 3, false, 0),
  arco([7.8, 16.2], [12, 19.4], 3.4, false, 0),
  arco([12, 4.6], [16.4, 8.2], 3.2, false, 1),
  arco([16.4, 8.2], [17.8, 12], 2.6, false, 1),
  arco([17.8, 12], [16.2, 16.2], 3, false, 1),
  arco([16.2, 16.2], [12, 19.4], 3.4, false, 1),
  linea([12, 4.8], [12, 19.2]),
  polilinea([
    [9, 8.6],
    [10.6, 9.6],
    [9.2, 11],
  ]),
  polilinea([
    [15, 13.2],
    [13.4, 14.2],
    [14.8, 15.6],
  ]),
];

const ojo: Icono = [
  arco([2.4, 12], [21.6, 12], 11, false, 1),
  arco([2.4, 12], [21.6, 12], 11, false, 0),
  circulo([12, 12], 3.1),
];

const escudoOjo: Icono = [
  escudoContorno,
  arco([7.6, 11.6], [16.4, 11.6], 5.2, false, 1),
  arco([7.6, 11.6], [16.4, 11.6], 5.2, false, 0),
  circulo([12, 11.6], 1.2),
];

const senal: Icono = [
  circulo([12, 12], 2),
  arco([8.4, 8.4], [8.4, 15.6], 5, false, 0),
  arco([15.6, 8.4], [15.6, 15.6], 5, false, 1),
  arco([5.7, 5.7], [5.7, 18.3], 8.9, false, 0),
  arco([18.3, 5.7], [18.3, 18.3], 8.9, false, 1),
];

const senalCaja: Icono = [
  rectangulo(3.4, 3.4, 17.2, 17.2, 3),
  circulo([12, 12], 1.7),
  arco([9, 9], [9, 15], 4.3, false, 0),
  arco([15, 9], [15, 15], 4.3, false, 1),
  linea([12, 13.7], [12, 17.8]),
];

const alerta: Icono = [
  cupulaRadar,
  baseRadar,
  linea([12, 4.4], [12, 2.6]),
  linea([5.2, 6.6], [3.9, 5.3]),
  linea([18.8, 6.6], [20.1, 5.3]),
];

const analisis: Icono = [
  cupulaRadar,
  baseRadar,
  polilinea([
    [8.6, 11.4],
    [10.2, 11.4],
    [11.4, 13.4],
    [12.8, 9],
    [13.8, 11.4],
    [15.4, 11.4],
  ]),
];

const gestion: Icono = [
  cupulaRadar,
  baseRadar,
  rectangulo(9.2, 9.2, 5.6, 4.2, 1),
  linea([12, 7], [12, 9.2]),
];

const respuesta: Icono = [
  cupulaRadar,
  baseRadar,
  polilinea([
    [9, 11.8],
    [12, 8.8],
    [15, 11.8],
  ]),
  linea([12, 8.8], [12, 13.6]),
];

const detectar: Icono = [
  escudoContorno,
  linea([12, 8.4], [12, 15.2]),
  linea([9.4, 11], [14.6, 11]),
];

const analizar: Icono = [escudoContorno, circulo([11.6, 10.6], 2.4), linea([13.4, 12.4], [15.4, 14.4])];

const responder: Icono = [
  escudoContorno,
  linea([8.8, 11.4], [15.2, 11.4]),
  linea([12, 8.2], [12, 14.6]),
  linea([9.6, 9.4], [9.6, 13.4]),
  linea([14.4, 9.4], [14.4, 13.4]),
];

const sistemas: Icono = [
  rectangulo(2.8, 6.2, 10.4, 8, 1.4),
  linea([6, 16.8], [10.2, 16.8]),
  linea([8.1, 14.2], [8.1, 16.8]),
  arco([15.4, 8.4], [15.4, 17.2], 4.4, false, 1),
  linea([15.4, 17.2], [13.8, 17.2]),
  polilinea([
    [15.9, 6.6],
    [14.3, 8.4],
    [15.9, 10.2],
  ]),
];

const puesto: Icono = [
  rectangulo(2.6, 4.6, 18.8, 12, 1.6),
  linea([8, 20.2], [16, 20.2]),
  linea([12, 16.6], [12, 20.2]),
  polilinea([
    [6, 12.6],
    [9.2, 9.2],
    [11.6, 11.6],
    [14.8, 7.8],
  ]),
  polilinea([
    [15.6, 7.8],
    [17.8, 7.8],
    [17.8, 10],
  ]),
];

const chip: Icono = [
  rectangulo(6.6, 6.6, 10.8, 10.8, 1.6),
  rectangulo(9.8, 9.8, 4.4, 4.4, 0.8),
  linea([9.4, 3.4], [9.4, 6.6]),
  linea([14.6, 3.4], [14.6, 6.6]),
  linea([9.4, 17.4], [9.4, 20.6]),
  linea([14.6, 17.4], [14.6, 20.6]),
  linea([3.4, 9.4], [6.6, 9.4]),
  linea([3.4, 14.6], [6.6, 14.6]),
  linea([17.4, 9.4], [20.6, 9.4]),
  linea([17.4, 14.6], [20.6, 14.6]),
];

const chipCirculo: Icono = [
  circulo([12, 12], 9.2),
  rectangulo(8.4, 8.4, 7.2, 7.2, 1.2),
  linea([10.6, 5.4], [10.6, 8.4]),
  linea([13.4, 5.4], [13.4, 8.4]),
  linea([10.6, 15.6], [10.6, 18.6]),
  linea([13.4, 15.6], [13.4, 18.6]),
  linea([5.4, 10.6], [8.4, 10.6]),
  linea([5.4, 13.4], [8.4, 13.4]),
  linea([15.6, 10.6], [18.6, 10.6]),
  linea([15.6, 13.4], [18.6, 13.4]),
];

const procesador: Icono = [
  circulo([8.8, 10.2], 3.4),
  circulo([8.8, 10.2], 1.2),
  circulo([16.2, 15.6], 2.4),
  circulo([16.2, 15.6], 0.8),
  linea([8.8, 3.4], [8.8, 5.2]),
  linea([2.6, 10.2], [4.4, 10.2]),
  linea([13.2, 10.2], [15, 10.2]),
  linea([16.2, 20.4], [16.2, 18.6]),
];

const integracion: Icono = [
  circulo([12, 5.4], 2.2),
  circulo([5.4, 16.6], 2.2),
  circulo([18.6, 16.6], 2.2),
  linea([10.6, 7.3], [7, 14.7]),
  linea([13.4, 7.3], [17, 14.7]),
  linea([7.6, 16.6], [16.4, 16.6]),
];

const red: Icono = [
  circulo([12, 5.2], 2.3),
  circulo([5.2, 17.4], 2.3),
  circulo([18.8, 17.4], 2.3),
  linea([10.3, 6.9], [6.6, 15.2]),
  linea([13.7, 6.9], [17.4, 15.2]),
  linea([7.5, 17.4], [16.5, 17.4]),
];

const candadoEscudo: Icono = [
  escudoContorno,
  rectangulo(9.2, 11, 5.6, 4.6, 1.1),
  arco([10.4, 11], [13.6, 11], 1.6, false, 1),
];

const infraestructura: Icono = [
  rectangulo(3.4, 9, 5, 11.6, 0.9),
  rectangulo(10.4, 4.6, 4.4, 16, 0.9),
  rectangulo(16.8, 12, 3.8, 8.6, 0.9),
  linea([5.2, 12], [6.6, 12]),
  linea([5.2, 15], [6.6, 15]),
  linea([12, 7.4], [13.4, 7.4]),
  linea([12, 10.4], [13.4, 10.4]),
  linea([12, 13.4], [13.4, 13.4]),
  linea([18.2, 14.6], [19.2, 14.6]),
];

const escudoIa: Icono = [
  escudoContorno,
  polilinea([
    [9.4, 14.6],
    [12, 8.4],
    [14.6, 14.6],
  ]),
  linea([10.3, 12.6], [13.7, 12.6]),
];

export const vigilancia: Record<string, Icono> = {
  camara,
  dron,
  dronVuelo,
  dronCirculo,
  sensor,
  cerebro,
  ojo,
  escudoOjo,
  senal,
  senalCaja,
  alerta,
  analisis,
  gestion,
  respuesta,
  detectar,
  analizar,
  responder,
  sistemas,
  puesto,
  chip,
  chipCirculo,
  procesador,
  integracion,
  red,
  candadoEscudo,
  infraestructura,
  escudoIa,
};
