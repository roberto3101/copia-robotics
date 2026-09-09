import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars','--autoplay-policy=no-user-gesture-required'] });
const p = await navegador.newPage();
await p.setViewport({ width: 1440, height: 900 });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let fallos = 0;
const comprobar = (nombre, ok, extra = '') => {
  if (!ok) fallos++;
  console.log(`  ${ok ? 'ok  ' : 'FALLA'} ${nombre}${extra ? '  ' + extra : ''}`);
};

console.log('\n— BUSCADOR DEL SITIO —');
await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
await espera(700);
await p.evaluate(() => document.querySelector('[data-abrir-busqueda]').click());
await espera(400);
comprobar('se abre', await p.evaluate(() => document.querySelector('[data-buscador-sitio]').open));
await p.type('[data-campo-busqueda]', 'drone');
await espera(300);
const r = await p.evaluate(() => ({
  n: document.querySelectorAll('[data-resultados-busqueda] a').length,
  primero: document.querySelector('[data-resultados-busqueda] .titulo')?.textContent ?? '',
  destino: document.querySelector('[data-resultados-busqueda] a')?.getAttribute('href') ?? '',
}));
comprobar('encuentra "drone"', r.n > 0, `${r.n} resultados, 1.º "${r.primero}" -> ${r.destino}`);
await p.evaluate(() => { const c = document.querySelector('[data-campo-busqueda]'); c.value='zzzqq'; c.dispatchEvent(new Event('input',{bubbles:true})); });
await espera(300);
comprobar('estado vacío', await p.evaluate(() => !document.querySelector('[data-vacio-busqueda]').hidden));
await p.keyboard.press('Escape');
await espera(300);
comprobar('cierra con Esc', await p.evaluate(() => !document.querySelector('[data-buscador-sitio]').open));

console.log('\n— CARRUSEL DE TESTIMONIOS —');
await p.goto(BASE + '/casos-de-uso/', { waitUntil: 'networkidle0' });
await espera(700);
const antes = await p.evaluate(() => {
  const s = [...document.querySelectorAll('section')].find((x) => x.querySelector('[data-pista]') && x.textContent.includes('clientes'));
  return s.querySelector('[data-pista]').scrollLeft;
});
await p.evaluate(() => {
  const s = [...document.querySelectorAll('section')].find((x) => x.querySelector('[data-pista]') && x.textContent.includes('clientes'));
  s.querySelector('[data-desplazar="1"]').click();
});
await espera(800);
const despues = await p.evaluate(() => {
  const s = [...document.querySelectorAll('section')].find((x) => x.querySelector('[data-pista]') && x.textContent.includes('clientes'));
  return s.querySelector('[data-pista]').scrollLeft;
});
comprobar('flecha siguiente desplaza', despues > antes, `${antes} -> ${Math.round(despues)}`);

console.log('\n— BOLETÍN —');
await p.goto(BASE + '/recursos/', { waitUntil: 'networkidle0' });
await espera(700);
await p.evaluate(() => document.querySelector('[data-formulario-boletin] button[type="submit"]').click());
await espera(300);
comprobar('rechaza vacío', await p.evaluate(() => (document.querySelector('[data-aviso-boletin]').textContent || '').length > 0));
await p.type('#correo-boletin', 'no-es-correo');
await p.evaluate(() => document.querySelector('[data-formulario-boletin] button[type="submit"]').click());
await espera(300);
comprobar('rechaza inválido', await p.evaluate(() => document.querySelector('#correo-boletin').getAttribute('aria-invalid') === 'true'));

console.log('\n— DESCARGAS —');
const docs = await p.evaluate(() => [...document.querySelectorAll('a[download]')].map((a) => a.getAttribute('href')));
for (const d of docs) {
  const res = await fetch(BASE + d);
  const bytes = res.ok ? (await res.arrayBuffer()).byteLength : 0;
  comprobar(
    `descarga ${d.split('/').pop()}`,
    res.ok && bytes > 1024,
    `HTTP ${res.status} · ${(bytes / 1024).toFixed(1)} KB`
  );
}

console.log(fallos ? `\nFALLOS: ${fallos}` : '\nTodo funcional');
await navegador.close();
