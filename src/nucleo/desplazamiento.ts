import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window {
    __desplazamientoSuave?: Lenis;
  }
}

gsap.registerPlugin(ScrollTrigger);

const movimientoReducido = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function iniciarDesplazamiento(): Lenis | undefined {
  if (movimientoReducido()) return undefined;
  if (window.__desplazamientoSuave) return window.__desplazamientoSuave;

  const suave = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    autoRaf: false,
  });

  suave.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((tiempo: number) => suave.raf(tiempo * 1000));
  gsap.ticker.lagSmoothing(0);

  window.__desplazamientoSuave = suave;
  return suave;
}

function anclarEnlacesInternos(suave: Lenis | undefined) {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((enlace) => {
    if (enlace.dataset.anclaLista) return;
    enlace.dataset.anclaLista = '1';
    enlace.addEventListener('click', (evento) => {
      const destino = document.querySelector(enlace.getAttribute('href') ?? '');
      if (!destino) return;
      evento.preventDefault();
      if (suave) suave.scrollTo(destino as HTMLElement, { offset: -80 });
      else destino.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function revelarSecciones() {
  ScrollTrigger.getAll().forEach((disparador) => disparador.kill());

  if (movimientoReducido()) {
    gsap.set('[data-revelar]', { clearProps: 'all' });
    return;
  }

  const bloques = gsap.utils.toArray<HTMLElement>('main > section, main > nav');
  bloques.forEach((bloque, indice) => {
    bloque.dataset.revelar = '1';
    if (indice === 0) {
      gsap.set(bloque, { clearProps: 'all' });
      return;
    }
    gsap.fromTo(
      bloque,
      { opacity: 0, y: 34 },
      {
        opacity: 1,
        y: 0,
        duration: 0.72,
        ease: 'power2.out',
        scrollTrigger: { trigger: bloque, start: 'top 88%', once: true },
      }
    );
  });

  ScrollTrigger.refresh();
}

function preparar() {
  const suave = iniciarDesplazamiento();
  suave?.scrollTo(0, { immediate: true });
  anclarEnlacesInternos(suave);
  revelarSecciones();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preparar, { once: true });
} else {
  preparar();
}

document.addEventListener('astro:page-load', preparar);

document.addEventListener('astro:before-preparation', () => {
  window.__desplazamientoSuave?.stop();
});

document.addEventListener('astro:after-swap', () => {
  window.__desplazamientoSuave?.start();
});
