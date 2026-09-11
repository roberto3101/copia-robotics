/**
 * Filtro por tema y paginación del índice del blog.
 *
 * El sitio es estático, así que todos los artículos ya están en la página:
 * filtrar y paginar es decidir cuáles se enseñan. Sin recargar y sin pedir
 * nada al servidor.
 *
 * Están todos en el HTML a propósito, aunque haya muchos ocultos: así los
 * buscadores los encuentran igual y, si este archivo no llegara a cargar, se
 * verían todos en vez de ninguno. La paginación es una comodidad, nunca el
 * único camino al contenido.
 */

const TODOS = 'todos';

/** Cuántos se enseñan de entrada y cuántos añade cada «ver más». */
const POR_TANDA = 9;

function enlazar(seccion: HTMLElement) {
  if (seccion.dataset.indiceListo) return;
  seccion.dataset.indiceListo = '1';

  const rejilla = seccion.querySelector<HTMLElement>('[data-rejilla-articulos]');
  if (!rejilla) return;

  const fichas = [...rejilla.querySelectorAll<HTMLElement>(':scope > li')];
  const botones = [...seccion.querySelectorAll<HTMLButtonElement>('[data-filtro]')];
  // Nombres propios: el sitio ya usa data-conteo para el contador de sus
  // catalogos y lo sobreescribiria con su propia plantilla.
  const verMas = seccion.querySelector<HTMLButtonElement>('[data-ver-mas-blog]');
  const conteo = seccion.querySelector<HTMLElement>('[data-conteo-blog]');

  let temaElegido = TODOS;
  let visibles = POR_TANDA;

  const delTema = (ficha: HTMLElement) =>
    temaElegido === TODOS ||
    (ficha.dataset.deTemas ?? '').split(' ').filter(Boolean).includes(temaElegido);

  const pintar = () => {
    const coinciden = fichas.filter(delTema);
    fichas.forEach((ficha) => {
      const puesto = coinciden.indexOf(ficha);
      ficha.hidden = puesto < 0 || puesto >= visibles;
    });

    const mostrados = Math.min(visibles, coinciden.length);
    if (verMas) {
      verMas.hidden = mostrados >= coinciden.length;
      verMas.textContent = verMas.dataset.etiquetaBlog ?? 'Ver más';
    }
    if (conteo) {
      const plantilla = conteo.dataset.plantillaBlog ?? '{visibles} de {total}';
      conteo.textContent = plantilla
        .replace('{visibles}', String(mostrados))
        .replace('{total}', String(coinciden.length));
    }
  };

  for (const boton of botones) {
    boton.addEventListener('click', () => {
      temaElegido = boton.dataset.filtro ?? TODOS;
      // Al cambiar de tema se empieza de nuevo: si no, un tema con pocos
      // artículos heredaría el «ya has visto veinte» del anterior.
      visibles = POR_TANDA;
      for (const otro of botones) {
        otro.setAttribute('aria-pressed', String(otro === boton));
      }
      pintar();
    });
  }

  verMas?.addEventListener('click', () => {
    visibles += POR_TANDA;
    pintar();
  });

  // Permite llegar con un tema ya elegido desde otro enlace.
  const pedido = new URLSearchParams(location.search).get('tema');
  const botonPedido = pedido && botones.find((b) => b.dataset.filtro === pedido);
  if (botonPedido) botonPedido.click();
  else pintar();
}

export function prepararIndiceBlog() {
  document
    .querySelectorAll<HTMLElement>('[data-indice-blog]')
    .forEach((seccion) => enlazar(seccion));
}
