let visor: HTMLDialogElement | null = null;
let reproductor: HTMLVideoElement | null = null;
let titulo: HTMLElement | null = null;

function cerrar() {
  if (!visor || !reproductor) return;
  reproductor.pause();
  reproductor.removeAttribute('src');
  reproductor.load();
  if (visor.open) visor.close();
}

function abrir(origen: string, nombre: string, poster: string) {
  if (!visor || !reproductor || !titulo) return;
  titulo.textContent = nombre;
  reproductor.poster = poster;
  reproductor.src = origen;
  if (!visor.open) visor.showModal();
  reproductor.play().catch(() => undefined);
}

export function prepararVisorVideo() {
  visor = document.querySelector('[data-visor-video]');
  reproductor = visor?.querySelector('[data-reproductor]') ?? null;
  titulo = visor?.querySelector('[data-titulo-visor]') ?? null;
  if (!visor || !reproductor) return;

  if (!visor.dataset.visorListo) {
    visor.dataset.visorListo = '1';
    visor.querySelector('[data-cerrar-visor]')?.addEventListener('click', cerrar);
    visor.addEventListener('close', cerrar);
    visor.addEventListener('click', (evento) => {
      if (evento.target === visor) cerrar();
    });
  }

  document.querySelectorAll<HTMLElement>('[data-video]').forEach((disparador) => {
    if (disparador.dataset.videoListo) return;
    disparador.dataset.videoListo = '1';
    disparador.addEventListener('click', (evento) => {
      evento.preventDefault();
      abrir(
        disparador.dataset.video ?? '',
        disparador.dataset.videoTitulo ?? '',
        disparador.dataset.videoPoster ?? ''
      );
    });
  });
}
