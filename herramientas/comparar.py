# -*- coding: utf-8 -*-
import sys, os
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPTURAS = os.path.join(RAIZ, 'herramientas', 'capturas')
REFERENCIAS = os.path.join(RAIZ, 'herramientas', 'referencia')
SALIDA = os.path.join(RAIZ, 'herramientas', 'cotejo')
os.makedirs(SALIDA, exist_ok=True)

ANCHO = 1440


def cargar(ruta, ancho=ANCHO):
    im = Image.open(ruta).convert('RGB')
    if im.width != ancho:
        im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
    return im


def bandas(arr, umbral=9, minimo=3):
    gris = arr.mean(axis=2)
    fondo = np.median(gris, axis=1, keepdims=True)
    activo = (np.abs(gris - fondo) > umbral).sum(axis=1) > 12
    corridas, inicio = [], None
    for i, v in enumerate(activo):
        if v and inicio is None:
            inicio = i
        elif not v and inicio is not None:
            if i - inicio >= minimo:
                corridas.append((inicio, i))
            inicio = None
    if inicio is not None:
        corridas.append((inicio, len(activo)))
    return corridas


def main():
    pagina = sys.argv[1]
    y0 = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    y1 = int(sys.argv[3]) if len(sys.argv) > 3 else 0

    mio = cargar(os.path.join(CAPTURAS, f'{pagina}.png'))
    ref = cargar(os.path.join(REFERENCIAS, f'{pagina}.png'))
    print(f'mio  1440x{mio.height}')
    print(f'ref  1440x{ref.height}   delta alto = {mio.height - ref.height:+d}')

    if not y1:
        y1 = min(mio.height, ref.height)
    y1 = min(y1, mio.height, ref.height)

    a = np.asarray(mio.crop((0, y0, ANCHO, y1))).astype(int)
    b = np.asarray(ref.crop((0, y0, ANCHO, y1))).astype(int)

    dif = np.abs(a - b).sum(axis=2)
    Image.fromarray(np.clip(dif, 0, 255).astype(np.uint8)).save(
        os.path.join(SALIDA, f'{pagina}-diferencia.png')
    )

    par = Image.new('RGB', (ANCHO, (y1 - y0) * 2 + 8), (255, 0, 0))
    par.paste(mio.crop((0, y0, ANCHO, y1)), (0, 0))
    par.paste(ref.crop((0, y0, ANCHO, y1)), (0, y1 - y0 + 8))
    par.save(os.path.join(SALIDA, f'{pagina}-par.png'))

    print(f'\ndiferencia media = {dif.mean():.1f} / 765')
    print(f'{"MIO":>18}   {"REFERENCIA":>18}')
    bm = bandas(a)
    br = bandas(b)
    for i in range(max(len(bm), len(br))):
        izq = f'{bm[i][0] + y0:5d}-{bm[i][1] + y0:<5d}' if i < len(bm) else ' ' * 11
        der = f'{br[i][0] + y0:5d}-{br[i][1] + y0:<5d}' if i < len(br) else ' ' * 11
        marca = ''
        if i < len(bm) and i < len(br):
            d = (bm[i][0] - br[i][0])
            marca = f'  dy={d:+d}' if abs(d) > 2 else '  ok'
        print(f'{izq:>18}   {der:>18}{marca}')


main()
