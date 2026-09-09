import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://localhost:4322';
const ANCHO = Number(process.env.ANCHO ?? 930);
const RUTAS = [
  ['inicio', '/'], ['soluciones', '/soluciones/'], ['tecnologia', '/tecnologia/'],
  ['sectores', '/sectores/'], ['casos-de-uso', '/casos-de-uso/'],
  ['nosotros', '/nosotros/'], ['recursos', '/recursos/'],
];

const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });

for (const [nombre, ruta] of RUTAS) {
  const p = await navegador.newPage();
  await p.setViewport({ width: ANCHO, height: 900 });
  await p.goto(BASE + ruta, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));

  const alto = await p.evaluate(() => document.body.scrollHeight);
  const pasos = Math.ceil(alto / 260);
  for (let i = 0; i < pasos; i++) {
    await p.mouse.wheel({ deltaY: 300 });
    await new Promise((r) => setTimeout(r, 45));
  }
  await new Promise((r) => setTimeout(r, 700));
  await p.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 400));

  const ocultas = await p.evaluate(() =>
    [...document.querySelectorAll('main > section, main > nav')]
      .filter((s) => Number(getComputedStyle(s).opacity) < 0.9)
      .map((s) => (s.className || '').split('-module')[0])
  );
  await p.screenshot({ path: `herramientas/capturas/ancho${ANCHO}-${nombre}.png`, fullPage: true });
  console.log(`${nombre.padEnd(14)} ${alto}px${ocultas.length ? '  ocultas: ' + ocultas.join(', ') : ''}`);
  await p.close();
}

await navegador.close();
