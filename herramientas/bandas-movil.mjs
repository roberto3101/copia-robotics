import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://localhost:4322';
const ANCHO = Number(process.env.ANCHO ?? 412);
const RUTAS = ['/', '/soluciones/', '/tecnologia/', '/sectores/', '/casos-de-uso/', '/nosotros/', '/recursos/'];

const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
for (const ruta of RUTAS) {
  const p = await navegador.newPage();
  await p.setViewport({ width: ANCHO, height: 900, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(BASE + ruta, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  const bandas = await p.$$('section[class*="banda"]');
  let i = 0;
  for (const banda of bandas) {
    await banda.scrollIntoView();
    await new Promise((r) => setTimeout(r, 400));
    const nombre = (ruta === '/' ? 'inicio' : ruta.replaceAll('/', '')) + (bandas.length > 1 ? `-${++i}` : '');
    await banda.screenshot({ path: `herramientas/capturas/movil-${nombre}.png` });
    console.log(`movil-${nombre}.png`);
  }
  await p.close();
}
await navegador.close();
