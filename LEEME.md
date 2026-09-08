# AI Robotics Perú — CERBERUS

Réplica en Astro de los siete diseños de referencia, bilingüe (español / inglés), con textos
externalizados en JSON modular y estilos en módulos CSS por componente.

[![Desplegar con Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Froberto3101%2Fcopia-robotics)

## Publicar

Repositorio: <https://github.com/roberto3101/copia-robotics>

Pulsa el botón de arriba, o en Vercel: **Add New → Project → Import** el repositorio.
Detecta Astro por `vercel.json` y publica sin configuración extra. Salida estática en
`dist/`, Node 20 (`.nvmrc`).

```bash
git push
```

## Puesta en marcha

```bash
npm install
npm run dev
```

| Guion | Efecto |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en `http://127.0.0.1:4321` |
| `npm run build` | Compilación estática en `dist/` |
| `npm run preview` | Sirve `dist/` para auditar |
| `npm run capturar` | Captura cada página a 1440 px |
| `npm run secciones` | Compara alturas de sección con la referencia |
| `npm run responsive` | Busca desbordes de 360 a 1920 px |

## Estructura

```
src/
  estilos/            tokens.css (claro/oscuro), base.css, tipografias.css
  idiomas/
    es/  en/          contenido por sección, un archivo por bloque
  nucleo/
    idiomas.ts        carga de contenido y catálogo de idiomas
    rutas.ts          mapa de rutas por idioma
    iconos/           iconos declarados con primitivas geométricas
  componentes/
    base/             Boton, Icono, Bandera, Contenedor, TituloPortada…
    marca/            Logotipo, SelloCerberus
    navegacion/       Cabecera, PieSitio, SelectorIdioma
    secciones/        bloques compartidos y carpetas por página
  plantillas/
    PlantillaBase.astro   cabeza SEO, datos estructurados, cabecera y pie
  pages/              rutas en español; en/ para la sección en inglés
herramientas/         utilidades de cotejo con los diseños de referencia
```

Cada componente tiene su `*.module.css` al lado. Los únicos estilos globales son
`tokens.css` (variables de tema claro y oscuro) y `base.css` (normalización mínima).

## Contenido

Todo el texto vive en `src/idiomas/<idioma>/<seccion>/<bloque>.json`. No hay cadenas
literales en las plantillas. Las claves siguen el mismo lenguaje de dominio en ambos
idiomas, de modo que `es/` y `en/` son espejos exactos: 56 archivos por idioma.

Para añadir un bloque nuevo: crear el JSON en ambos idiomas y leerlo con
`contenido(idioma, 'seccion/bloque')`.

## Rutas

| Sección | Español | Inglés |
| --- | --- | --- |
| Inicio | `/` | `/en/` |
| Soluciones | `/soluciones/` | `/en/solutions/` |
| Tecnología | `/tecnologia/` | `/en/technology/` |
| Sectores | `/sectores/` | `/en/sectors/` |
| Casos de uso | `/casos-de-uso/` | `/en/use-cases/` |
| Nosotros | `/nosotros/` | `/en/about/` |
| Recursos | `/recursos/` | `/en/resources/` |

El selector de la cabecera lleva a la misma sección en el otro idioma y cada página
declara `hreflang` recíproco más `x-default`.

## SEO

`PlantillaBase.astro` emite título, descripción, palabras clave, canónica, `robots`,
`hreflang`, Open Graph, Twitter Card, manifiesto, iconos y un grafo JSON-LD con
`Organization`, `WebSite`, `WebPage` y `BreadcrumbList`. El mapa del sitio se genera con
`@astrojs/sitemap` e incluye las alternativas por idioma. `public/robots.txt` apunta a él.

## Cotejo con los diseños

Los siete PNG de referencia están en `herramientas/referencia/` (fuera de `public/`, no se
publican). Las utilidades comparan el sitio renderizado contra ellos a 1440 px:

```bash
node herramientas/capturar.mjs            # captura completa de cada página
node herramientas/secciones.mjs inicio    # alturas de sección frente al objetivo
node herramientas/responsive.mjs          # desbordes en 360…1920
python herramientas/comparar.py inicio    # imagen de diferencia y bandas
python herramientas/bandas.py ref:inicio 469 661
python herramientas/medir.py herramientas/sondas/inicio-portada.json
```

El lienzo de referencia es 1440 × 2160. Las medidas del diseño se derivan dividiendo las
coordenadas del PNG (1843 px de ancho) entre 1,2799.

## Movimiento y transiciones

`src/nucleo/desplazamiento.ts` inicia Lenis (desplazamiento suave) y lo conecta al ticker de
GSAP con ScrollTrigger para revelar cada sección al entrar en pantalla. Todo se desactiva con
`prefers-reduced-motion`.

Las transiciones entre páginas usan el `ClientRouter` nativo de Astro: cabecera y pie llevan
`transition:persist`, así que no parpadean al navegar, y el contenido entra con un fundido de
0,32 s. El router se activa solo en la compilación de producción; en `npm run dev` Vite sirve
los estilos como `<style>` inyectados por JavaScript y el intercambio de cabecera provocaría un
destello. Para ver las transiciones en local: `npm run build && npm run preview`.

## Imágenes

Fotografías genéricas de Pexels (licencia libre), normalizadas a WebP y con una gradación
fría común para igualar la paleta nocturna de la referencia. `public/images/_sources.json`
registra el identificador de origen de cada archivo. El montaje de las unidades CERBERUS
sale del PNG entregado, recortado sobre alfa.

## Accesibilidad

Auditoría Lighthouse (escritorio): SEO 100, Rendimiento 100, Buenas prácticas 100,
Accesibilidad 92–93.

Los dos puntos que restan provienen de decisiones del diseño original y se mantienen para
no alterar la réplica:

- El azul de marca `--marca-500: #0a90fe` con texto blanco da 3,26:1, por debajo del 4,5:1
  que exige WCAG AA para texto normal. Cambiar `--marca-500` a `#0a63b8` en
  `src/estilos/tokens.css` alcanza el contraste exigido a costa de oscurecer los botones.
- Los enlaces del pie repiten el interlineado de 16,5 px del diseño, menor que los 24 px de
  destino táctil de WCAG 2.2. Subir `line-height` y `min-height` en
  `PieSitio.module.css` lo corrige y estira el pie unos 60 px.

Ambos ajustes ya están escritos para `@media (prefers-contrast: more)`, de modo que quien
active el contraste alto del sistema recibe la variante conforme.
