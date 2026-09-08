import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
const p = await navegador.newPage();
await p.setViewport({ width: 1600, height: 950 });
await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise((r) => setTimeout(r, 900));

const caja = await p.evaluate(() => {
  const m = document.querySelector('[data-resplandor]');
  const r = m.getBoundingClientRect();
  return { x: Math.round(r.x + r.width * 0.42), y: Math.round(r.y + r.height * 0.55), r: m.style.getPropertyValue('--r') };
});
console.log('radio en reposo:', JSON.stringify(caja.r || '(sin definir)'));
await p.mouse.move(caja.x, caja.y);
await new Promise((r) => setTimeout(r, 400));
console.log('tras pasar el cursor:', await p.evaluate(() => {
  const m = document.querySelector('[data-resplandor]');
  return { r: m.style.getPropertyValue('--r'), x: m.style.getPropertyValue('--x'), y: m.style.getPropertyValue('--y') };
}));
await p.screenshot({ path: 'herramientas/capturas/resplandor.png' });
await p.mouse.move(10, 10);
await new Promise((r) => setTimeout(r, 400));
console.log('al salir:', await p.evaluate(() => document.querySelector('[data-resplandor]').style.getPropertyValue('--r')));
await navegador.close();
