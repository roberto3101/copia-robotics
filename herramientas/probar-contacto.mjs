import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
const p = await navegador.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto(BASE + '/nosotros/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 700));

console.log('ancla presente:', await p.evaluate(() => Boolean(document.getElementById('contacto'))));

await p.evaluate(() => document.querySelector('[data-formulario-contacto] [data-enviar]').click());
await new Promise((r) => setTimeout(r, 350));
console.log('vacío -> avisos:', await p.evaluate(() =>
  [...document.querySelectorAll('[data-aviso]')].map((a) => a.textContent).filter(Boolean)
));

await p.type('#contacto-nombre', 'María Torres');
await p.type('#contacto-correo', 'correo-malo');
await p.type('#contacto-mensaje', 'Necesitamos vigilancia perimetral para una planta.');
await p.select('#contacto-consulta', 'propuesta');
await p.evaluate(() => document.querySelector('#contacto-consentimiento').click());
await p.evaluate(() => document.querySelector('[data-formulario-contacto] [data-enviar]').click());
await new Promise((r) => setTimeout(r, 350));
console.log('correo inválido -> avisos:', await p.evaluate(() =>
  [...document.querySelectorAll('[data-aviso]')].map((a) => a.textContent).filter(Boolean)
));

await p.evaluate(() => { const c = document.querySelector('#contacto-correo'); c.value = ''; });
await p.type('#contacto-correo', 'maria@empresa.pe');
const destino = await p.evaluate(() => {
  const f = document.querySelector('[data-formulario-contacto]');
  let capturado = null;
  const original = Object.getOwnPropertyDescriptor(window.location, 'href');
  f.addEventListener('submit', () => {}, { once: true });
  window.__capturarMailto = (u) => { capturado = u; };
  return 'preparado';
});
console.log('estado antes de enviar:', destino);

await p.evaluate(() => {
  document.querySelector('[data-formulario-contacto]').dataset.endpoint = '/no-existe';
  document.querySelector('[data-formulario-contacto] [data-enviar]').click();
});
await new Promise((r) => setTimeout(r, 900));
console.log('con endpoint fallido:', await p.evaluate(() => {
  const r = document.querySelector('[data-resultado]');
  return { visible: !r.hidden, estado: r.dataset.estado, texto: r.textContent.slice(0, 60) };
}));
await navegador.close();
