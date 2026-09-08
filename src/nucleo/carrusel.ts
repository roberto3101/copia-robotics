function enlazar(seccion: HTMLElement) {
  const pista = seccion.querySelector<HTMLElement>('[data-pista]');
  if (!pista || pista.dataset.carruselListo) return;
  pista.dataset.carruselListo = '1';

  const controles = seccion.querySelectorAll<HTMLButtonElement>('[data-desplazar]');

  const actualizarControles = () => {
    const maximo = pista.scrollWidth - pista.clientWidth - 2;
    controles.forEach((control) => {
      const sentido = Number(control.dataset.desplazar);
      const limite = sentido < 0 ? pista.scrollLeft <= 2 : pista.scrollLeft >= maximo;
      control.disabled = maximo <= 0 || limite;
    });
  };

  controles.forEach((control) => {
    control.addEventListener('click', () => {
      const sentido = Number(control.dataset.desplazar);
      const primera = pista.firstElementChild as HTMLElement | null;
      const paso = primera ? primera.getBoundingClientRect().width + 18 : 320;
      pista.scrollBy({ left: sentido * paso, behavior: 'smooth' });
    });
  });

  pista.addEventListener('scroll', actualizarControles, { passive: true });
  window.addEventListener('resize', actualizarControles);
  actualizarControles();
}

export function prepararCarruseles() {
  document.querySelectorAll<HTMLElement>('section').forEach(enlazar);
}
