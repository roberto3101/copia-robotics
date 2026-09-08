import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const SALIDA = 'herramientas/capturas';

const paginas = [
  ['inicio', '/'],
  ['soluciones', '/soluciones/'],
  ['tecnologia', '/tecnologia/'],
  ['sectores', '/sectores/'],
  ['casos-de-uso', '/casos-de-uso/'],
  ['nosotros', '/nosotros/'],
  ['recursos', '/recursos/'],
];

const pedidas = process.argv.slice(2);
const seleccion = pedidas.length ? paginas.filter(([n]) => pedidas.includes(n)) : paginas;

await mkdir(SALIDA, { recursive: true });

const navegador = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--force-device-scale-factor=1', '--hide-scrollbars', '--font-render-hinting=none'],
});

for (const [nombre, ruta] of seleccion) {
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
  const respuesta = await pagina.goto(BASE + ruta, { waitUntil: 'networkidle0', timeout: 60000 });
  if (!respuesta || respuesta.status() >= 400) {
    console.log(`  ${nombre}: HTTP ${respuesta?.status()}`);
    await pagina.close();
    continue;
  }
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.evaluate(async () => {
    await new Promise((listo) => {
      let y = 0;
      const paso = () => {
        window.scrollTo(0, y);
        y += 600;
        if (y < document.body.scrollHeight) requestAnimationFrame(paso);
        else {
          window.scrollTo(0, 0);
          setTimeout(listo, 250);
        }
      };
      paso();
    });
  });
  const alto = await pagina.evaluate(() => document.documentElement.scrollHeight);
  await pagina.screenshot({ path: `${SALIDA}/${nombre}.png`, fullPage: true });
  console.log(`  ${nombre.padEnd(14)} 1440x${alto}`);
  await pagina.close();
}

await navegador.close();
