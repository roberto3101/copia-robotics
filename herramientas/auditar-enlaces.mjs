import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4331';
const rutas = ['/', '/soluciones/', '/tecnologia/', '/sectores/', '/casos-de-uso/', '/nosotros/', '/recursos/'];

const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
const p = await navegador.newPage();

const anclas = new Set();
const enlaces = new Map();
const interactivos = [];

for (const r of rutas) {
  await p.goto(BASE + r, { waitUntil: 'networkidle0' });
  const datos = await p.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    const a = [...document.querySelectorAll('a[href]')].map((e) => e.getAttribute('href'));
    const botones = [...document.querySelectorAll('button')].map((b) => ({
      texto: (b.textContent || '').trim().slice(0, 30) || b.getAttribute('aria-label') || '?',
      tipo: b.type,
      rol: b.getAttribute('role'),
    }));
    const campos = [...document.querySelectorAll('input, select, textarea')].map((c) => ({
      etiqueta: c.getAttribute('aria-label') || c.getAttribute('placeholder') || c.name || c.tagName,
      tipo: c.type || c.tagName.toLowerCase(),
    }));
    const formularios = document.querySelectorAll('form').length;
    return { ids, a, botones, campos, formularios };
  });
  datos.ids.forEach((i) => anclas.add(r + '#' + i));
  datos.a.forEach((h) => {
    if (!enlaces.has(h)) enlaces.set(h, new Set());
    enlaces.get(h).add(r);
  });
  interactivos.push({ ruta: r, botones: datos.botones, campos: datos.campos, formularios: datos.formularios });
}

console.log('=== ENLACES INTERNOS ===');
const internos = [...enlaces.keys()].filter((h) => h.startsWith('/') || h.startsWith('#'));
for (const h of internos.sort()) {
  const [camino, ancla] = h.split('#');
  let estado = '';
  if (camino) {
    const res = await p.goto(BASE + camino, { waitUntil: 'domcontentloaded' }).catch(() => null);
    const codigo = res?.status() ?? 0;
    estado = codigo === 200 ? 'ok' : `HTTP ${codigo}`;
    if (codigo === 200 && ancla) {
      const existe = await p.evaluate((a) => Boolean(document.getElementById(a)), ancla);
      if (!existe) estado = `ANCLA #${ancla} INEXISTENTE`;
    }
  } else if (ancla) {
    estado = 'ancla local';
  }
  if (estado !== 'ok') console.log(`  ${estado.padEnd(30)} ${h}   <- ${[...enlaces.get(h)].join(', ')}`);
}

console.log('\n=== CONTROLES SIN DESTINO ===');
for (const i of interactivos) {
  console.log(`  ${i.ruta}  botones=${i.botones.length}  campos=${i.campos.length}  formularios=${i.formularios}`);
  i.botones.forEach((b) => console.log(`      boton[${b.rol ?? b.tipo}] "${b.texto}"`));
}
await navegador.close();
