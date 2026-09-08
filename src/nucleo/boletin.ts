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

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (exito) exito.hidden = true;

    if (!validar() || !campo.value.trim()) {
      if (aviso) aviso.textContent = campo.dataset.error ?? '';
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
      return;
    }

    const destino = formulario.dataset.correo ?? '';
    const asunto = formulario.dataset.asunto ?? '';
    const cuerpo = `${campo.value.trim()}`;
    window.location.href = `mailto:${destino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

    if (exito) exito.hidden = false;
    formulario.reset();
    campo.setAttribute('aria-invalid', 'false');
    if (aviso) aviso.textContent = '';
  });
}

export function prepararBoletin() {
  document.querySelectorAll<HTMLFormElement>('[data-formulario-boletin]').forEach(enlazar);
}
