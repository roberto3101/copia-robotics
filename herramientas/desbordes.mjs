import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://localhost:4322';
const RUTAS = [
  '/', '/soluciones/', '/tecnologia/', '/sectores/', '/casos-de-uso/', '/nosotros/', '/recursos/',
  '/en/', '/en/solutions/', '/en/technology/', '/en/sectors/', '/en/use-cases/', '/en/about/', '/en/resources/',
];
const ANCHOS = [360, 390, 414, 480, 560, 640, 720, 768, 840, 900, 930, 980, 1024, 1100, 1200, 1280, 1366, 1440, 1600, 1920];

const detectar = () => {
  const fugas = [];
  const bloques = document.querySelectorAll('main > section, main > nav, footer');

  bloques.forEach((bloque) => {
    const caja = bloque.getBoundingClientRect();
    const nombre = (bloque.className || bloque.tagName).toString().split(' ')[0];

    bloque.querySelectorAll('*').forEach((nodo) => {
      const estilo = getComputedStyle(nodo);
      if (estilo.display === 'none' || estilo.visibility === 'hidden' || Number(estilo.opacity) < 0.05) return;
      if (nodo.closest('[aria-hidden="true"], dialog')) return;

      let recortado = false;
      for (let n = nodo.parentElement; n && n !== bloque; n = n.parentElement) {
        const e = getComputedStyle(n);
        if (e.overflowX !== 'visible' || e.overflowY !== 'visible') recortado = true;
      }
      if (recortado) return;

      const texto = Array.from(nodo.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      const propia = nodo.getBoundingClientRect();
      if (propia.width < 3 || propia.height < 3) return;
      if (!texto && !nodo.matches('img, svg, ul, ol')) return;

      const abajo = propia.bottom - caja.bottom;
      const arriba = caja.top - propia.top;
      const derecha = propia.right - caja.right;
      const izquierda = caja.left - propia.left;
      const peor = Math.max(abajo, arriba, derecha, izquierda);
      if (peor > 2) {
        fugas.push({
          bloque: nombre,
          etiqueta: nodo.tagName.toLowerCase(),
          texto: (nodo.textContent || '').trim().slice(0, 38),
          abajo: Math.round(abajo),
          arriba: Math.round(arriba),
          derecha: Math.round(derecha),
          izquierda: Math.round(izquierda),
        });
      }
    });
  });

  const vistos = new Set();
  return fugas.filter((f) => {
    const clave = `${f.bloque}|${f.texto}|${f.abajo}|${f.derecha}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
};

const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
let total = 0;

for (const ruta of RUTAS) {
  for (const ancho of ANCHOS) {
    const p = await navegador.newPage();
    await p.setViewport({ width: ancho, height: 900 });
    await p.goto(BASE + ruta, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 220));
    const fugas = await p.evaluate(detectar);
    if (fugas.length) {
      total += fugas.length;
      console.log(`${ruta.padEnd(18)} ${String(ancho).padStart(5)}  ${fugas.length} fuga(s)`);
      for (const f of fugas.slice(0, 5)) {
        const lados = ['abajo', 'arriba', 'derecha', 'izquierda']
          .filter((l) => f[l] > 2)
          .map((l) => `${l} ${f[l]}px`)
          .join(', ');
        console.log(`      ${f.bloque.slice(0, 26).padEnd(26)} <${f.etiqueta}> "${f.texto}"  ${lados}`);
      }
    }
    await p.close();
  }
}

console.log(total ? `\n${total} fuga(s) fuera de su sección` : '\nSin fugas fuera de sección');
await navegador.close();
