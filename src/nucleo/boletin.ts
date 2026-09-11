const CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function enlazar(formulario: HTMLFormElement) {
  if (formulario.dataset.boletinListo) return;
  formulario.dataset.boletinListo = '1';

  const campo = formulario.querySelector<HTMLInputElement>('input[type="email"]');
  const aviso = formulario.querySelector<HTMLElement>('[data-aviso-boletin]');
  const exito = formulario.querySelector<HTMLElement>('[data-exito-boletin]');
  if (!campo) return;

  const validar = () => {
    const valido = CORREO.test(campo.value.trim());
    if (aviso) aviso.textContent = valido || !campo.value ? '' : (campo.dataset.error ?? '');
    campo.setAttribute('aria-invalid', valido || !campo.value ? 'false' : 'true');
    return valido;
  };

  campo.addEventListener('blur', validar);
  campo.addEventListener('input', () => {
    if (campo.getAttribute('aria-invalid') === 'true') validar();
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (exito) exito.hidden = true;

    if (!validar() || !campo.value.trim()) {
      if (aviso) aviso.textContent = campo.dataset.error ?? '';
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
      return;
    }

    const endpoint = formulario.dataset.endpoint;
    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo: campo.value.trim(),
            idioma: document.documentElement.lang.slice(0, 2) || 'es',
            origen: window.location.pathname,
          }),
        });
      } catch {
        // El alta es un extra: si la red falla no se le complica la vida al
        // visitante con un error, y el correo no se pierde porque tampoco
        // había nada que perder.
      }
    } else {
      const destino = formulario.dataset.correo ?? '';
      const asunto = formulario.dataset.asunto ?? '';
      const cuerpo = `${campo.value.trim()}`;
      window.location.href = `mailto:${destino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    }

    if (exito) exito.hidden = false;
    formulario.reset();
    campo.setAttribute('aria-invalid', 'false');
    if (aviso) aviso.textContent = '';
  });
}

export function prepararBoletin() {
  document.querySelectorAll<HTMLFormElement>('[data-formulario-boletin]').forEach(enlazar);
}
