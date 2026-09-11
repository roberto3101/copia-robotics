# Integración con el CMS Codeplex

El sitio pasó de tener el contenido escrito en el repositorio a leerlo del CMS
`Sistema_Blogs_Codeplex`. Sigue siendo estático: la API se consulta una sola
vez durante `astro build`, nunca desde el navegador del visitante.

## La regla de la que cuelga todo

**Sin `CMS_URL`, el sitio compila exactamente como antes**, con los JSON de
`src/idiomas/`. Y aunque el CMS esté configurado, si no responde o devuelve un
bloque con la forma cambiada, se usa el del repositorio y el despliegue sigue
adelante.

Esto no es una concesión: es lo que permite que alguien trabaje en el diseño
sin levantar el backend, y que una caída del panel un viernes por la tarde no
impida publicar una corrección urgente.

## Puesta en marcha

### 1. Crear el sitio en el CMS

En el panel: **Sitios → Nuevo**. El código va en mayúsculas.

| Campo | Valor |
| --- | --- |
| Código | `AIROBOTICS` |
| Dominio | `www.airobotics.pe` |
| Idioma por defecto | `es` |

### 2. Importar el contenido por primera vez

Desde `Sistema_Blogs_Codeplex/backend`:

```bash
go run ./cmd/importar_contenido -sitio AIROBOTICS -origen ../../copia-diseño/src/idiomas -simular
```

`-simular` no escribe nada: informa de cuántos archivos encontró y avisa si un
bloque existe en un idioma y falta en el otro. Si el resumen cuadra (116
archivos, 58 por idioma), se repite sin `-simular`.

Un bloque que ya existe no se toca. Con `-sobrescribir` el archivo entra como
borrador pendiente de revisar, nunca pisando directamente lo publicado.

### 3. Configurar el sitio

Copiar `.env.example` a `.env` y rellenar:

```
CMS_URL=https://cms.codeplex.pe
CMS_SITIO=AIROBOTICS
```

En Vercel, las mismas variables en **Settings → Environment Variables**.

### 4. Cerrar el circuito de publicación

En Vercel: **Settings → Git → Deploy Hooks → Create Hook**, rama `main`. La URL
que devuelve va al backend:

```
URL_WEBHOOK_PUBLICACION=https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy
SECRETO_WEBHOOK_PUBLICACION=una-clave-larga-y-aleatoria
```

A partir de ahí, publicar desde el panel reconstruye el sitio solo.

## Cómo se edita cada cosa

| Qué | Dónde | Efecto |
| --- | --- | --- |
| Textos, portadas, catálogos, pie | Panel → **Contenido del sitio** | Publicar reconstruye la web |
| Artículos del blog | Panel → **Posts** | Publicar reconstruye la web |
| Imágenes y vídeos de artículos | Editor de posts, subida directa | Quedan en el CMS |
| Destinatarios del formulario | Bloque `ajustes/correo` | Inmediato, no hace falta reconstruir |
| Consultas recibidas | Panel → **Mensajes** | — |
| Credenciales SMTP | Entorno del backend | Reiniciar el backend |

### Guardar no es publicar

Igual que con los posts: se guarda cuantas veces haga falta sin que la web
cambie, y solo al pulsar **Publicar** llega a producción. El bloque con cambios
sin publicar queda marcado en la lista, y cada publicación deja una copia en el
historial por si hay que volver atrás.

## Lo que el panel no puede cambiar

Tres cosas siguen viviendo en el código, y conviene saberlo antes de prometer
lo contrario a nadie:

- **Los iconos.** Los 78 están declarados como primitivas geométricas en
  `src/nucleo/iconos/`. Un bloque puede elegir entre los existentes por su
  nombre, pero añadir uno nuevo es un cambio de código.
- **Las imágenes de fondo de sección.** Portadas, bandas de llamada y fondos
  están escritos en las páginas `.astro` (48 rutas). Cambiar la foto de una
  portada es editar el archivo.
- **La estructura de un bloque.** Se pueden cambiar textos, reordenar listas y
  añadir o quitar elementos, pero no inventar campos que la plantilla no
  espere: el sitio descarta un bloque cuya forma no cuadre.

## El cuerpo del artículo se inyecta tal cual

El markdown del panel se convierte a HTML con el mismo procesador que usa Astro
para los `.md` del proyecto, y se inserta con `set:html`. Eso significa que el
HTML crudo dentro del markdown **pasa al sitio sin filtrar** — y los posts con
`formato_contenido: HTML` van enteros sin tocar.

Es el mismo trato que da WordPress y hace falta para incrustar un vídeo o un
mapa. La consecuencia es que **quien pueda redactar posts puede ejecutar
JavaScript en el sitio público**, así que las cuentas con ese permiso deben
tratarse como cuentas de confianza.

Si alguna vez se abre la redacción a terceros, hay que sanear el HTML antes de
`set:html` en `src/componentes/secciones/recursos/Articulo.astro`.

## El cortafuegos de forma

Las plantillas leen el JSON sin defensa (`datos.elementos.map(e => e.icono)`,
`texto.split('\n')`). Si alguien borra un campo desde el panel, la compilación
reventaría y no habría despliegue.

Por eso, antes de aceptar un bloque del CMS se compara su forma con la del JSON
del repositorio. Si no cuadra, se descarta ese bloque, se usa el local y el
registro de la compilación dice exactamente qué campo falta:

```
[cms] es/inicio/portada descartado: no conserva la forma esperada (7 diferencias).
[cms]   · lineasTitulo falta (se esperaba lista)
[cms]   · accionPrincipal falta (se esperaba texto)
```

La consecuencia práctica: si un cambio del panel no aparece en la web, lo
primero que hay que mirar es el registro del despliegue en Vercel.

Vive en `src/nucleo/forma.ts`.

## Archivos nuevos

```
src/nucleo/
  cms.ts          cliente de la API (bloques, posts, endpoints públicos)
  forma.ts        comparación de forma entre repositorio y CMS
  articulos.ts    artículos del blog, markdown a HTML
  idiomas.ts      MODIFICADO: superpone el CMS sobre los JSON locales
componentes/secciones/recursos/
  Articulo.astro  página de artículo
pages/
  recursos/articulos/[slug].astro
  en/resources/articles/[slug].astro
```

Los 46 componentes que llaman a `contenido()` no cambiaron: la función sigue
siendo síncrona y lee de un mapa que se rellena una vez al arrancar la
compilación.
