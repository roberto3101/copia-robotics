import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const p = await navegador.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle0' });
await p.evaluate(() => {
  window.__traza = [];
  const anota = (etapa) => window.__traza.push({
    etapa,
    estilos: document.querySelectorAll('head style').length,
    hojas: document.styleSheets.length,
    altoCabecera: Math.round(document.querySelector('header')?.getBoundingClientRect().height ?? 0),
  });
  document.addEventListener('astro:before-swap', () => anota('antes-swap'));
  document.addEventListener('astro:after-swap', () => anota('tras-swap'));
  document.addEventListener('astro:page-load', () => anota('page-load'));
});
await p.evaluate(() => document.querySelector('header nav a[href="/soluciones/"]').click());
await new Promise((r) => setTimeout(r, 1200));
console.log(JSON.stringify(await p.evaluate(() => window.__traza), null, 1));
console.log('final', JSON.stringify(await p.evaluate(() => ({
  estilos: document.querySelectorAll('head style').length,
  hojas: document.styleSheets.length,
  alto: Math.round(document.querySelector('header').getBoundingClientRect().height),
}))));
await navegador.close();
