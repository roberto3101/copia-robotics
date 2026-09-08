import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';

const rutas = {
  inicio: '/',
  soluciones: '/soluciones/',
  tecnologia: '/tecnologia/',
  sectores: '/sectores/',
  'casos-de-uso': '/casos-de-uso/',
  nosotros: '/nosotros/',
  recursos: '/recursos/',
};

const esperado = {
  inicio: [70, 399, 192, 253, 258, 271, 165, 175, 0, 177, 246],
  soluciones: [70, 488, 62, 910, 242, 246],
  tecnologia: [70, 502, 62, 410, 482, 247, 246],
  sectores: [70, 364, 1067, 114, 194, 148, 246],
  'casos-de-uso': [70, 347, 62, 811, 246, 252, 124, 246],
  nosotros: [70, 408, 323, 266, 295, 192, 218, 150, 246],
  recursos: [70, 451, 57, 1168, 168, 246],
};

const pagina = process.argv[2] ?? 'inicio';
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
const p = await navegador.newPage();
await p.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
await p.goto(BASE + rutas[pagina], { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);

const bloques = await p.evaluate(() => {
  const nodos = [
    document.querySelector('body > header'),
    ...document.querySelectorAll('main > *'),
    document.querySelector('body > footer'),
  ].filter(Boolean);
  return nodos.map((n) => {
    const r = n.getBoundingClientRect();
    const clase = (n.className || '').toString().split('__')[0].split(' ')[0];
    return { etiqueta: n.tagName.toLowerCase(), clase, y: Math.round(r.y + window.scrollY), alto: Math.round(r.height) };
  });
});

const alto = await p.evaluate(() => document.documentElement.scrollHeight);
await navegador.close();

const ref = esperado[pagina] ?? [];
const total = ref.reduce((a, b) => a + b, 0);
console.log(`${pagina}   alto real ${alto}   objetivo ${total || '?'}   delta ${total ? alto - total : '?'}`);
console.log(`${'bloque'.padEnd(28)} ${'y'.padStart(6)} ${'alto'.padStart(6)} ${'objetivo'.padStart(9)} ${'delta'.padStart(7)}`);
bloques.forEach((b, i) => {
  const o = ref[i];
  const d = o ? b.alto - o : null;
  console.log(
    `${(b.etiqueta + ' ' + b.clase).slice(0, 28).padEnd(28)} ${String(b.y).padStart(6)} ${String(b.alto).padStart(6)} ${String(o ?? '-').padStart(9)} ${(d === null ? '-' : (d > 0 ? '+' : '') + d).padStart(7)}`
  );
});
