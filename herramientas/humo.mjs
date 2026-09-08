import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });

for (const tema of ['oscuro', 'claro']) {
  const p = await navegador.newPage();
  await p.setViewport({ width: 1600, height: 950, deviceScaleFactor: 1 });
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
  if (tema === 'claro') {
    await p.evaluate(() => {
      document.documentElement.dataset.tema = 'claro';
      localStorage.setItem('tema', 'claro');
    });
  }
  await new Promise((r) => setTimeout(r, 500));
  const marca = await p.$('[data-resplandor]');
  await marca.scrollIntoView();
  await new Promise((r) => setTimeout(r, 800));
  await marca.screenshot({ path: `herramientas/capturas/humo-${tema}.png` });
  console.log(tema, 'listo');
  await p.close();
}
await navegador.close();
