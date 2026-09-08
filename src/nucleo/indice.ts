import { contenido, type Idioma } from './idiomas';
import { mapaRutas, paqueteDeSeccion, type ClaveSeccion } from './rutas';

export interface Entrada {
  titulo: string;
  detalle: string;
  ruta: string;
  seccion: string;
}

const SUBENTRADAS: Partial<Record<ClaveSeccion, string[]>> = {
  inicio: ['cambio', 'funcionamiento', 'soluciones', 'sectores', 'resultados', 'casos'],
  soluciones: ['catalogo'],
  tecnologia: ['panorama', 'componentes'],
  sectores: ['catalogo', 'caso-exito'],
  casos: ['catalogo', 'destacado', 'testimonios'],
  nosotros: ['historia', 'valores', 'equipo', 'cifras', 'alianzas', 'contacto'],
  recursos: ['articulos', 'videos', 'documentos'],
};

export function construirIndice(idioma: Idioma): Entrada[] {
  const navegacion = contenido(idioma, 'comunes/navegacion');
  const entradas: Entrada[] = [];

  navegacion.elementos.forEach((elemento: { clave: ClaveSeccion; etiqueta: string }) => {
    const paquete = paqueteDeSeccion[elemento.clave];
    const metadatos = contenido(idioma, `${paquete}/metadatos`);
    const ruta = mapaRutas[elemento.clave][idioma];

    entradas.push({
      titulo: elemento.etiqueta,
      detalle: metadatos.descripcion,
      ruta,
      seccion: elemento.etiqueta,
    });

    (SUBENTRADAS[elemento.clave] ?? []).forEach((bloque) => {
      let datos: Record<string, any>;
      try {
        datos = contenido(idioma, `${paquete}/${bloque}`);
      } catch {
        return;
      }
      const titulo = datos.titulo ?? datos.insignia;
      if (!titulo) return;
      entradas.push({
        titulo: String(titulo).replace(/\s+/g, ' ').trim(),
        detalle: String(datos.subtitulo ?? datos.texto ?? datos.nota ?? '').replace(/\s+/g, ' ').trim(),
        ruta,
        seccion: elemento.etiqueta,
      });

      (datos.elementos ?? []).forEach((pieza: Record<string, any>) => {
        const nombre = pieza.nombre ?? pieza.titulo;
        if (!nombre) return;
        entradas.push({
          titulo: String(nombre).replace(/\s+/g, ' ').trim(),
          detalle: String(pieza.texto ?? pieza.descripcion ?? pieza.subtitulo ?? '').replace(/\s+/g, ' ').trim(),
          ruta,
          seccion: elemento.etiqueta,
        });
      });
    });
  });

  const vistas = new Set<string>();
  return entradas.filter((e) => {
    const clave = `${e.ruta}|${e.titulo}`;
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  });
}
