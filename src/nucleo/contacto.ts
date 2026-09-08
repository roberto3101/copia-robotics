const CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function avisoDe(control: Control): HTMLElement | null {
  return control.closest('p')?.querySelector('[data-aviso]') ?? null;
}

function mensajeDe(control: Control): string {
  if (control instanceof HTMLInputElement && control.type === 'checkbox') {
    return control.checked ? '' : (control.dataset.error ?? '');
  }
  const valor = control.value.trim();
  if (control.required && !valor) return control.dataset.error ?? '';
  if (control instanceof HTMLInputElement && control.type === 'email' && valor && !CORREO.test(valor)) {
    return control.dataset.error ?? '';
  }
  if (valor && !control.checkValidity()) return control.dataset.error ?? '';
  return '';
}

function pintar(control: Control): boolean {
  const mensaje = mensajeDe(control);
  const aviso = avisoDe(control);
  if (aviso) aviso.textContent = mensaje;
  control.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
  control.closest('p')?.classList.toggle('con-error', Boolean(mensaje));
  return !mensaje;
}

function componerCorreo(formulario: HTMLFormElement, datos: FormData): string {
  const destino = formulario.dataset.correo ?? '';
  const asunto = formulario.dataset.asunto ?? '';
  const consulta = formulario.querySelector<HTMLSelectElement>('[name="consulta"]');
  const etiquetaConsulta = consulta?.selectedOptions[0]?.textContent?.trim() ?? '';

  const lineas = [
    `${formulario.querySelector('label[for="contacto-nombre"]')?.textContent}: ${datos.get('nombre')}`,
    `${formulario.querySelector('label[for="contacto-correo"]')?.textContent}: ${datos.get('correo')}`,
    `${formulario.querySelector('label[for="contacto-empresa"]')?.textContent}: ${datos.get('empresa') || '-'}`,
    `${formulario.querySelector('label[for="contacto-telefono"]')?.textContent}: ${datos.get('telefono') || '-'}`,
    `${formulario.querySelector('label[for="contacto-consulta"]')?.textContent}: ${etiquetaConsulta}`,
    '',
    String(datos.get('mensaje') ?? ''),
  ];

  return `mailto:${destino}?subject=${encodeURIComponent(`${asunto}: ${etiquetaConsulta}`)}&body=${encodeURIComponent(lineas.join('\n'))}`;
}

function enlazar(formulario: HTMLFormElement) {
  if (formulario.dataset.contactoListo) return;
  formulario.dataset.contactoListo = '1';

  const controles = [...formulario.querySelectorAll<Control>('input, select, textarea')].filter(
    (c) => c.name !== 'sitioWeb'
  );
  const boton = formulario.querySelector<HTMLButtonElement>('[data-enviar]');
  const resultado = formulario.querySelector<HTMLElement>('[data-resultado]');
  const etiquetaBoton = boton?.querySelector('span');
  const textoInicial = etiquetaBoton?.textContent ?? '';

  controles.forEach((control) => {
    control.addEventListener('blur', () => pintar(control));
    control.addEventListener('input', () => {
      if (control.getAttribute('aria-invalid') === 'true') pintar(control);
    });
    control.addEventListener('change', () => pintar(control));
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (resultado) resultado.hidden = true;

    const trampa = formulario.querySelector<HTMLInputElement>('[name="sitioWeb"]');
    if (trampa?.value) return;

    const validos = controles.map(pintar);
    if (validos.includes(false)) {
      const primero = controles.find((c) => c.getAttribute('aria-invalid') === 'true');
      primero?.focus();
      primero?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const datos = new FormData(formulario);
    const endpoint = formulario.dataset.endpoint;

    if (boton && etiquetaBoton) {
      boton.disabled = true;
      etiquetaBoton.textContent = boton.dataset.enviando ?? textoInicial;
    }

    let estado: 'exito' | 'exitoRemoto' | 'fallo' = 'exito';

    if (endpoint) {
      try {
        const respuesta = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(datos.entries())),
        });
        estado = respuesta.ok ? 'exitoRemoto' : 'fallo';
      } catch {
        estado = 'fallo';
      }
    } else {
      window.location.href = componerCorreo(formulario, datos);
    }

    if (boton && etiquetaBoton) {
      boton.disabled = false;
      etiquetaBoton.textContent = textoInicial;
    }

    if (resultado) {
      const clave =
        estado === 'exitoRemoto' ? 'exitoRemoto' : estado === 'fallo' ? 'fallo' : 'exito';
      resultado.textContent = resultado.dataset[clave] ?? '';
      resultado.dataset.estado = estado === 'fallo' ? 'fallo' : 'exito';
      resultado.hidden = false;
    }

    if (estado !== 'fallo') {
      formulario.reset();
      controles.forEach((c) => {
        c.setAttribute('aria-invalid', 'false');
        c.closest('p')?.classList.remove('con-error');
        const aviso = avisoDe(c);
        if (aviso) aviso.textContent = '';
      });
    }
  });
}

export function prepararContacto() {
  document.querySelectorAll<HTMLFormElement>('[data-formulario-contacto]').forEach(enlazar);
}
