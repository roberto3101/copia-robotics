interface Entrada {
  titulo: string;
  detalle: string;
  ruta: string;
  seccion: string;
}

const normalizar = (valor: string) =>
  valor.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function puntuar(entrada: Entrada, consulta: string): number {
  const titulo = normalizar(entrada.titulo);
  const detalle = normalizar(entrada.detalle);
  if (titulo.startsWith(consulta)) return 3;
  if (titulo.includes(consulta)) return 2;
  if (detalle.includes(consulta)) return 1;
  return 0;
}

export function prepararBusqueda() {
  const dialogo = document.querySelector<HTMLDialogElement>('[data-buscador-sitio]');
  if (!dialogo) return;

  const campo = dialogo.querySelector<HTMLInputElement>('[data-campo-busqueda]');
  const lista = dialogo.querySelector<HTMLElement>('[data-resultados-busqueda]');
  const vacio = dialogo.querySelector<HTMLElement>('[data-vacio-busqueda]');
  const guion = dialogo.querySelector<HTMLScriptElement>('[data-indice-busqueda]');
  if (!campo || !lista || !guion) return;

  const indice: Entrada[] = JSON.parse(guion.textContent ?? '[]');

  const pintar = (consulta: string) => {
    const limpia = normalizar(consulta.trim());
    const encontrados = limpia
      ? indice
          .map((entrada) => ({ entrada, peso: puntuar(entrada, limpia) }))
          .filter((r) => r.peso > 0)
          .sort((a, b) => b.peso - a.peso)
          .slice(0, 8)
          .map((r) => r.entrada)
      : indice.filter((_, i) => i < 7);

    lista.innerHTML = encontrados
      .map(
        (e) => `<li>
            <a href="${e.ruta}">
              <span class="seccion">${e.seccion}</span>
              <span class="titulo">${e.titulo}</span>
              ${e.detalle ? `<span class="detalle">${e.detalle.slice(0, 110)}</span>` : ''}
            </a>
          </li>`
      )
      .join('');
    if (vacio) vacio.hidden = encontrados.length > 0;
  };

  if (!dialogo.dataset.busquedaLista) {
    dialogo.dataset.busquedaLista = '1';

    const abrir = () => {
      if (!dialogo.open) dialogo.showModal();
      campo.value = '';
      pintar('');
      window.setTimeout(() => campo.focus(), 40);
    };
    const cerrar = () => {
      if (dialogo.open) dialogo.close();
    };

    dialogo.querySelector('[data-cerrar-busqueda]')?.addEventListener('click', cerrar);
    dialogo.addEventListener('click', (evento) => {
      if (evento.target === dialogo) cerrar();
    });
    campo.addEventListener('input', () => pintar(campo.value));
    campo.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        cerrar();
        return;
      }
      if (evento.key === 'ArrowDown') {
        evento.preventDefault();
        lista.querySelector<HTMLAnchorElement>('a')?.focus();
      }
      if (evento.key === 'Enter') {
        const primero = lista.querySelector<HTMLAnchorElement>('a');
        if (primero) {
          evento.preventDefault();
          primero.click();
        }
      }
    });

    document.addEventListener('keydown', (evento) => {
      const atajo = (evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k';
      if (atajo) {
        evento.preventDefault();
        abrir();
      }
    });

    dialogo.dataset.abridor = '1';
    (window as unknown as { abrirBusqueda?: () => void }).abrirBusqueda = abrir;
  }

  document.querySelectorAll<HTMLButtonElement>('[data-abrir-busqueda]').forEach((boton) => {
    if (boton.dataset.busquedaListo) return;
    boton.dataset.busquedaListo = '1';
    boton.addEventListener('click', () =>
      (window as unknown as { abrirBusqueda?: () => void }).abrirBusqueda?.()
    );
  });
}
