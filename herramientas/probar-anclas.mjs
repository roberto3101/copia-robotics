import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://localhost:4322';
const DESTINOS = [
  '/nosotros/#contacto',
  '/en/about/#contacto',
  '/casos-de-uso/#caso-destacado',
  '/en/use-cases/#caso-destacado',
];

const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
let fallos = 0;

for (const destino of DESTINOS) {
  for (const ancho of [390, 930, 1440]) {
    const p = await navegador.newPage();
    await p.setViewport({ width: ancho, height: 900 });
    await p.goto(BASE + destino, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1300));
    const estado = await p.evaluate(() => {
      const objetivo = document.querySelector(location.hash);
      if (!objetivo) return { falta: true };
      const caja = objetivo.getBoundingClientRect();
      const seccion = objetivo.closest('section') || objetivo;
      return {
        arriba: Math.round(caja.top),
        opacidad: Number(getComputedStyle(seccion).opacity),
        alto: window.innerHeight,
      };
    });
    const bien = !estado.falta && estado.opacidad > 0.9 && estado.arriba > -40 && estado.arriba < estado.alto;
    if (!bien) fallos += 1;
    console.log(`  ${bien ? 'ok  ' : 'FALLO'} ${destino.padEnd(32)} ${String(ancho).padStart(5)}  arriba ${estado.arriba}px · opacidad ${estado.opacidad}`);
    await p.close();
  }
}

console.log(fallos ? `\nFALLOS: ${fallos}` : '\nTodas las anclas aterrizan en su destino');
await navegador.close();
