# -*- coding: utf-8 -*-
import sys, os, json
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANCHO = 1440


def cargar(clave):
    if clave.startswith('ref:'):
        ruta = os.path.join(RAIZ, 'herramientas', 'referencia', clave[4:] + '.png')
    else:
        ruta = os.path.join(RAIZ, 'herramientas', 'capturas', clave + '.png')
    im = Image.open(ruta).convert('RGB')
    if im.width != ANCHO:
        im = im.resize((ANCHO, round(im.height * ANCHO / im.width)), Image.LANCZOS)
    return np.asarray(im).astype(int)


def tinta(arr, x0, y0, x1, y1, umbral):
    r = arr[y0:y1, x0:x1]
    lum = r.mean(axis=2)
    on = lum > umbral
    if not on.any():
        return None
    ys, xs = np.where(on)
    return (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)


def main():
    sondas = json.load(open(sys.argv[1], encoding='utf-8'))
    a = cargar(sondas['mio'])
    b = cargar(sondas['ref'])
    print(f"{'sonda':<26} {'MIO x,y,w,h':<26} {'REFERENCIA x,y,w,h':<26} delta")
    for s in sondas['sondas']:
        caja = s['caja']
        u = s.get('umbral', 120)
        ta = tinta(a, *caja, u)
        tb = tinta(b, *caja, u)
        if not ta or not tb:
            print(f"{s['nombre']:<26} {'sin tinta' if not ta else 'ok':<26} {'sin tinta' if not tb else 'ok'}")
            continue
        fa = f'{ta[0]},{ta[1]},{ta[2]-ta[0]},{ta[3]-ta[1]}'
        fb = f'{tb[0]},{tb[1]},{tb[2]-tb[0]},{tb[3]-tb[1]}'
        d = f'dx={ta[0]-tb[0]:+d} dy={ta[1]-tb[1]:+d} dw={(ta[2]-ta[0])-(tb[2]-tb[0]):+d} dh={(ta[3]-ta[1])-(tb[3]-tb[1]):+d}'
        print(f"{s['nombre']:<26} {fa:<26} {fb:<26} {d}")


main()
