import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const SALIDA = 'herramientas/capturas/responsive';

const anchos = [360, 414, 768, 1024, 1280, 1440, 1920];
const rutas = {
  inicio: '/',
  soluciones: '/soluciones/',
  tecnologia: '/tecnologia/',
  sectores: '/sectores/',
  'casos-de-uso': '/casos-de-uso/',
  nosotros: '/nosotros/',
  recursos: '/recursos/',
};

await mkdir(SALIDA, { recursive: true });
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
const pedidas = process.argv.slice(2);
const seleccion = pedidas.length ? pedidas : Object.keys(rutas);

for (const nombre of seleccion) {
  for (const ancho of anchos) {
    const p = await navegador.newPage();
    await p.setViewport({ width: ancho, height: 900, deviceScaleFactor: 1 });
    await p.goto(BASE + rutas[nombre], { waitUntil: 'networkidle0' });
    await p.evaluate(() => document.fonts.ready);
    const desborde = await p.evaluate(() => {
      const raiz = document.documentElement;
      const culpables = [];
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > raiz.clientWidth + 1 || r.left < -1)) {
          const c = String(el.className).split(' ')[0].slice(0, 34);
          if (c && !culpables.includes(c)) culpables.push(c);
        }
      });
      return { scroll: raiz.scrollWidth, cliente: raiz.clientWidth, culpables: culpables.slice(0, 6) };
    });
    const marca = desborde.scroll > desborde.cliente + 1 ? 'DESBORDE' : 'ok';
    console.log(`${nombre.padEnd(14)} ${String(ancho).padStart(5)}  ${marca}${marca === 'DESBORDE' ? '  ' + desborde.culpables.join(', ') : ''}`);
    if (ancho === 360 || ancho === 768) {
      await p.screenshot({ path: `${SALIDA}/${nombre}-${ancho}.png`, fullPage: true });
    }
    await p.close();
  }
}
await navegador.close();
