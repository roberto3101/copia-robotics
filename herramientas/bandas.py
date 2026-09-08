# -*- coding: utf-8 -*-
import sys, os
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def cargar(clave):
    if clave.startswith('ref:'):
        ruta = os.path.join(RAIZ, 'herramientas', 'referencia', clave[4:] + '.png')
    else:
        ruta = os.path.join(RAIZ, 'herramientas', 'capturas', clave + '.png')
    im = Image.open(ruta).convert('RGB')
    if im.width != 1440:
        im = im.resize((1440, round(im.height * 1440 / im.width)), Image.LANCZOS)
    return np.asarray(im).astype(float)


def main():
    arr = cargar(sys.argv[1])
    y0, y1 = int(sys.argv[2]), int(sys.argv[3])
    x0 = int(sys.argv[4]) if len(sys.argv) > 4 else 40
    x1 = int(sys.argv[5]) if len(sys.argv) > 5 else 700
    umbral = float(sys.argv[6]) if len(sys.argv) > 6 else 95

    z = arr[y0:y1, x0:x1].mean(axis=2)
    act = (z > umbral).sum(axis=1) > 2
    corridas, ini = [], None
    for i, v in enumerate(act):
        if v and ini is None:
            ini = i
        elif not v and ini is not None:
            corridas.append((y0 + ini, y0 + i))
            ini = None
    if ini is not None:
        corridas.append((y0 + ini, y1))

    print(f'{sys.argv[1]}  y {y0}..{y1}  x {x0}..{x1}  umbral {umbral}')
    previo = None
    for a, b in corridas:
        cols = np.where((z[a - y0 : b - y0] > umbral).any(axis=0))[0]
        hueco = f'  hueco {a - previo:3d}' if previo is not None else ''
        print(f'  y {a:5d}..{b:<5d} alto {b-a:3d}   x {x0+cols.min():5d}..{x0+cols.max()+1:<5d} ancho {cols.max()+1-cols.min():4d}{hueco}')
        previo = b


main()
