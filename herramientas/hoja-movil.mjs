import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://localhost:4322';
const ANCHO = Number(process.env.ANCHO ?? 412);
const RUTAS = ['/', '/soluciones/', '/tecnologia/', '/sectores/', '/casos-de-uso/', '/nosotros/', '/recursos/'];

const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
for (const ruta of RUTAS) {
  const p = await navegador.newPage();
  await p.setViewport({ width: ANCHO, height: 900, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await p.goto(BASE + ruta, { waitUntil: 'networkidle0' });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 500));
  const nombre = ruta === '/' ? 'inicio' : ruta.replaceAll('/', '');
  await p.screenshot({ path: `herramientas/capturas/pag-${nombre}.png`, fullPage: true });
  console.log(nombre, (await p.evaluate(() => document.body.scrollHeight)) + 'px');
  await p.close();
}
await navegador.close();
