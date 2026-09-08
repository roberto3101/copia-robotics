const TODOS = new Set(['todas', 'todos', 'panorama']);

type Consulta = { clave: string; sector: string; texto: string };

const normalizar = (valor: string) =>
  valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

function coincide(elemento: HTMLElement, consulta: Consulta): boolean {
  const categorias = (elemento.dataset.categorias ?? '').split(' ').filter(Boolean);
  const sector = elemento.dataset.sector ?? '';
  const busqueda = normalizar(elemento.dataset.busqueda ?? elemento.textContent ?? '');

  if (!TODOS.has(consulta.clave) && consulta.clave && !categorias.includes(consulta.clave)) return false;
  if (consulta.sector && sector !== consulta.sector) return false;
  if (consulta.texto && !busqueda.includes(consulta.texto)) return false;
  return true;
}

function aplicar(grupo: HTMLElement) {
  const consulta: Consulta = {
    clave: grupo.dataset.clave ?? '',
    sector: grupo.dataset.sector ?? '',
    texto: normalizar(grupo.dataset.texto ?? ''),
  };

  const piezas = grupo.querySelectorAll<HTMLElement>('[data-pieza]');
  let visibles = 0;
  piezas.forEach((pieza) => {
    const visible = coincide(pieza, consulta);
    pieza.hidden = !visible;
    if (visible) visibles += 1;
  });

  const bloques = grupo.querySelectorAll<HTMLElement>('[data-ambitos]');
  bloques.forEach((bloque) => {
    const ambitos = (bloque.dataset.ambitos ?? '').split(' ').filter(Boolean);
    bloque.hidden = Boolean(consulta.clave) && !ambitos.includes(consulta.clave);
  });

  const vacio = grupo.querySelector<HTMLElement>('[data-sin-resultados]');
  if (vacio) vacio.hidden = visibles !== 0 || piezas.length === 0;

  const contador = grupo.querySelector<HTMLElement>('[data-conteo]');
  if (contador) {
    const plantilla = contador.dataset.conteo ?? '{n}/{total}';
    contador.textContent = plantilla
      .replace('{n}', String(visibles))
      .replace('{total}', String(piezas.length));
    contador.hidden = false;
  }

  grupo.dispatchEvent(new CustomEvent('filtro:aplicado', { detail: { visibles } }));
}

function enlazarGrupo(grupo: HTMLElement) {
  if (grupo.dataset.filtroListo) return;
  grupo.dataset.filtroListo = '1';

  const pestanas = grupo.querySelectorAll<HTMLButtonElement>('[data-clave-pestana]');
  const inicial = [...pestanas].find((p) => p.getAttribute('aria-selected') === 'true');
  if (inicial) grupo.dataset.clave = inicial.dataset.clavePestana ?? '';
  pestanas.forEach((pestana) => {
    pestana.addEventListener('click', () => {
      pestanas.forEach((otra) => otra.setAttribute('aria-selected', String(otra === pestana)));
      grupo.dataset.clave = pestana.dataset.clavePestana ?? '';
      aplicar(grupo);
      const lista = grupo.querySelector<HTMLElement>('[data-lista]');
      if (lista && window.scrollY > lista.offsetTop) {
        lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const barra = grupo.querySelector<HTMLElement>('[role="tablist"]');
  barra?.addEventListener('keydown', (evento) => {
    const teclas = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!teclas.includes(evento.key)) return;
    evento.preventDefault();
    const lista = [...pestanas];
    const actual = lista.findIndex((p) => p.getAttribute('aria-selected') === 'true');
    const siguiente =
      evento.key === 'Home'
        ? 0
        : evento.key === 'End'
          ? lista.length - 1
          : (actual + (evento.key === 'ArrowRight' ? 1 : -1) + lista.length) % lista.length;
    lista[siguiente]?.focus();
    lista[siguiente]?.click();
  });

  const buscador = grupo.querySelector<HTMLInputElement>('[data-buscador]');
  if (buscador) {
    let temporizador: number | undefined;
    const actualizar = () => {
      grupo.dataset.texto = buscador.value;
      aplicar(grupo);
    };
    buscador.addEventListener('input', () => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(actualizar, 140);
    });
    buscador.addEventListener('search', actualizar);
  }

  const selector = grupo.querySelector<HTMLSelectElement>('[data-selector-sector]');
  selector?.addEventListener('change', () => {
    grupo.dataset.sector = selector.value;
    aplicar(grupo);
  });

  aplicar(grupo);
}

export function prepararFiltros() {
  document.querySelectorAll<HTMLElement>('[data-grupo-filtro]').forEach(enlazarGrupo);
}
