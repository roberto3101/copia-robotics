#!/usr/bin/env bash
SALIDA="${1:-herramientas/auditorias}"
BASE="${BASE:-http://localhost:4322}"
mkdir -p "$SALIDA"
RUTAS="/ /soluciones/ /tecnologia/ /sectores/ /casos-de-uso/ /nosotros/ /recursos/ /en/ /en/solutions/ /en/technology/ /en/sectors/ /en/use-cases/ /en/about/ /en/resources/"
printf '%-18s %5s %5s %5s %5s\n' pagina rend acce buen seo
for r in $RUTAS; do
  n=$(echo "$r" | tr '/' '_')
  npx --yes lighthouse "$BASE$r" --quiet --chrome-flags="--headless=new" --preset=desktop \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output-path="$SALIDA/lh$n.json" > /dev/null 2>&1
  node -e "
    const r = require(process.argv[1]);
    const c = r.categories;
    const v = (k) => Math.round(c[k].score * 100);
    console.log(process.argv[2].padEnd(18) + String(v('performance')).padStart(5) + String(v('accessibility')).padStart(6) + String(v('best-practices')).padStart(6) + String(v('seo')).padStart(6));
  " "$SALIDA/lh$n.json" "$r"
done
