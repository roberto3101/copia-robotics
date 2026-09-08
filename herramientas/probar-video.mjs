import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars','--autoplay-policy=no-user-gesture-required'] });
const p = await navegador.newPage();
await p.setViewport({ width: 1440, height: 900 });

for (const ruta of ['/recursos/', '/casos-de-uso/', '/soluciones/', '/tecnologia/']) {
  await p.goto(BASE + ruta, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  const disparadores = await p.evaluate(() =>
    [...document.querySelectorAll('[data-video]')].map((d) => ({
      video: d.dataset.video, titulo: (d.dataset.videoTitulo || '').slice(0, 34),
    }))
  );
  console.log(`\n${ruta}  disparadores=${disparadores.length}`);
  if (!disparadores.length) continue;
  await p.evaluate(() => document.querySelector('[data-video]').click());
  await new Promise((r) => setTimeout(r, 700));
  const estado = await p.evaluate(() => {
    const d = document.querySelector('[data-visor-video]');
    const v = d.querySelector('[data-reproductor]');
    return { abierto: d.open, src: v.getAttribute('src'), reproduciendo: !v.paused, error: v.error?.code ?? null, titulo: d.querySelector('[data-titulo-visor]').textContent.slice(0,34) };
  });
  console.log('   ', JSON.stringify(estado));
  await p.evaluate(() => document.querySelector('[data-cerrar-visor]').click());
  await new Promise((r) => setTimeout(r, 250));
  console.log('    tras cerrar:', await p.evaluate(() => {
    const d = document.querySelector('[data-visor-video]');
    return { abierto: d.open, src: d.querySelector('[data-reproductor]').getAttribute('src') };
  }));
}
await navegador.close();
