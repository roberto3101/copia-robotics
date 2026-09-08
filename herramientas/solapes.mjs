import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://localhost:4322';
const RUTAS = [
  '/', '/soluciones/', '/tecnologia/', '/sectores/', '/casos-de-uso/', '/nosotros/', '/recursos/',
  '/en/', '/en/solutions/', '/en/technology/', '/en/sectors/', '/en/use-cases/', '/en/about/', '/en/resources/',
];
const ANCHOS = [360, 390, 414, 480, 640, 768, 1024];

const detectar = () => {
  const visible = (el) => {
    const e = getComputedStyle(el);
    return e.display !== 'none' && e.visibility !== 'hidden' && Number(e.opacity) > 0.05;
  };

  const decorativo = (el) => el.closest('[aria-hidden="true"], svg, dialog, [data-visor-video], [data-buscador]');

  const flotante = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const pos = getComputedStyle(n).position;
      if (pos === 'absolute' || pos === 'fixed' || pos === 'sticky') return true;
    }
    return false;
  };

  const conTextoPropio = (el) =>
    Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);

  const piezas = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!conTextoPropio(el) || !visible(el) || decorativo(el) || flotante(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    piezas.push({ el, r, texto: el.textContent.trim().slice(0, 42) });
  }

  const emparentados = (a, b) => a.contains(b) || b.contains(a);
  const choques = [];
  for (let i = 0; i < piezas.length; i++) {
    for (let j = i + 1; j < piezas.length; j++) {
      const a = piezas[i];
      const b = piezas[j];
      if (emparentados(a.el, b.el)) continue;
      const ancho = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const alto = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (ancho <= 3 || alto <= 3) continue;
      const menorAlto = Math.min(a.r.height, b.r.height);
      const menorAncho = Math.min(a.r.width, b.r.width);
      if (alto / menorAlto < 0.28 || ancho / menorAncho < 0.28) continue;
      choques.push({
        a: a.texto,
        b: b.texto,
        ancho: Math.round(ancho),
        alto: Math.round(alto),
        cubre: Math.round((100 * ancho * alto) / (menorAncho * menorAlto)),
        seccion: (a.el.closest('section, footer, header')?.id) || a.el.closest('section, footer, header')?.tagName || '?',
      });
    }
  }
  return choques;
};

const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
let fallos = 0;

for (const ruta of RUTAS) {
  for (const ancho of ANCHOS) {
    const p = await navegador.newPage();
    await p.setViewport({ width: ancho, height: 900 });
    await p.goto(BASE + ruta, { waitUntil: 'networkidle0' });
    await p.evaluate(() => {
      document.querySelectorAll('[data-animar], .astro-animate').forEach((n) => (n.style.opacity = '1'));
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise((r) => setTimeout(r, 350));
    await p.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 250));
    const choques = await p.evaluate(detectar);
    if (choques.length) {
      fallos += choques.length;
      console.log(`${ruta.padEnd(18)} ${String(ancho).padStart(4)}  ${choques.length} solape(s)`);
      for (const c of choques.slice(0, 6)) {
        console.log(`      [${c.seccion}] "${c.a}"  x  "${c.b}"  ${c.ancho}x${c.alto}px · cubre ${c.cubre}%`);
      }
    }
    await p.close();
  }
}

console.log(fallos ? `\n${fallos} solape(s) en total` : '\nSin solapes de texto');
await navegador.close();
