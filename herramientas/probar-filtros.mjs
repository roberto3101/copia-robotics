import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
const p = await navegador.newPage();
await p.setViewport({ width: 1440, height: 900 });

const visibles = () =>
  p.evaluate(() => ({
    piezas: [...document.querySelectorAll('[data-pieza]')].filter((e) => !e.hidden).length,
    total: document.querySelectorAll('[data-pieza]').length,
    bloques: [...document.querySelectorAll('[data-ambitos]')].filter((e) => !e.hidden).length,
    conteo: document.querySelector('[data-conteo]')?.textContent ?? '',
    vacio: !(document.querySelector('[data-sin-resultados]')?.hidden ?? true),
  }));

for (const [ruta, etiquetas] of [
  ['/soluciones/', ['Todas las soluciones', 'Seguridad urbana', 'Logística y transporte']],
  ['/tecnologia/', ['Visión general', 'Drones y robótica', 'Ciberseguridad']],
  ['/casos-de-uso/', ['Todos los casos', 'Minería', 'Emergencias', 'Construcción']],
  ['/recursos/', ['Todos', 'Videos', 'Documentos']],
]) {
  await p.goto(BASE + ruta, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  console.log(`\n${ruta}`);
  for (const etiqueta of etiquetas) {
    const pulsado = await p.evaluate((t) => {
      const b = [...document.querySelectorAll('[data-clave-pestana]')].find(
        (x) => x.textContent.trim() === t
      );
      if (!b) return false;
      b.click();
      return true;
    }, etiqueta);
    if (!pulsado) { console.log(`   ${etiqueta.padEnd(24)} PESTAÑA NO ENCONTRADA`); continue; }
    await new Promise((r) => setTimeout(r, 250));
    const v = await visibles();
    console.log(`   ${etiqueta.padEnd(24)} piezas ${v.piezas}/${v.total}  bloques ${v.bloques}  ${v.conteo}`);
  }
}

await p.goto(BASE + '/casos-de-uso/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 400));
await p.type('[data-buscador]', 'drones');
await new Promise((r) => setTimeout(r, 400));
console.log('\nbusqueda "drones":', JSON.stringify(await visibles()));
await p.evaluate(() => { const i = document.querySelector('[data-buscador]'); i.value=''; i.dispatchEvent(new Event('input',{bubbles:true})); });
await new Promise((r) => setTimeout(r, 300));
await p.select('[data-selector-sector]', 'logistica');
await new Promise((r) => setTimeout(r, 300));
console.log('sector logistica:', JSON.stringify(await visibles()));
await p.type('[data-buscador]', 'zzzz');
await new Promise((r) => setTimeout(r, 400));
console.log('sin coincidencias:', JSON.stringify(await visibles()));
await navegador.close();
