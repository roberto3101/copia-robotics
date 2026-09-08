import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4331';

const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
const p = await navegador.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);

const rutas = ['Soluciones', 'Tecnología', 'Sectores', 'Casos de uso', 'Nosotros', 'Recursos', 'Inicio'];
let fallos = 0;

for (const etiqueta of rutas) {
  const antes = p.url();
  await p.evaluate((texto) => {
    const enlace = [...document.querySelectorAll('header nav a')].find(
      (a) => a.textContent.trim() === texto
    );
    enlace?.click();
  }, etiqueta);

  const muestras = [];
  for (let i = 0; i < 14; i++) {
    const m = await p.evaluate(() => {
      const cabecera = document.querySelector('header');
      const enlaces = document.querySelectorAll('link[rel="stylesheet"]').length;
      const h = cabecera ? Math.round(cabecera.getBoundingClientRect().height) : 0;
      return { alto: h, hojas: enlaces, ruta: location.pathname };
    });
    muestras.push(m);
    await new Promise((r) => setTimeout(r, 45));
  }
  await p.evaluate(() => document.fonts.ready);
  const roto = muestras.filter((m) => m.alto > 90 || m.alto === 0);
  const despues = p.url();
  const estado = roto.length ? `FOUC ${roto.length}/14 alturas=${[...new Set(roto.map((r) => r.alto))].join(',')}` : 'ok';
  if (roto.length) fallos++;
  console.log(`${etiqueta.padEnd(14)} ${antes.replace(BASE, '') || '/'} -> ${despues.replace(BASE, '') || '/'}   ${estado}`);
}

const persistido = await p.evaluate(() => ({
  activo: document.querySelector('header a[aria-current="page"]')?.textContent.trim() ?? null,
  ruta: location.pathname,
}));
console.log('activo tras navegar:', JSON.stringify(persistido));
console.log(fallos ? `\nFALLOS: ${fallos}` : '\nSin FOUC en ninguna navegación');
await navegador.close();
