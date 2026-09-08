# -*- coding: utf-8 -*-
import os
import sys
import cv2
import numpy as np
from PIL import Image

REFERENCIA = 'herramientas/referencia'
PRUEBAS = 'herramientas/capturas'
ALTO_CABECERA = 88

PORTADAS = {
    'inicio': dict(fin=599, panel=548, zonas=[(30, 96, 1000, 596), (1420, 150, 1830, 596)]),
    'soluciones': dict(fin=681, panel=545, zonas=[(30, 96, 940, 678), (1560, 435, 1830, 678)]),
    'tecnologia': dict(fin=718, panel=545, zonas=[(30, 96, 940, 715), (1400, 360, 1830, 715)]),
    'sectores': dict(fin=555, panel=560, zonas=[(30, 96, 1000, 552), (1395, 130, 1830, 552), (985, 220, 1215, 340)]),
    'casos-de-uso': dict(fin=516, panel=560, zonas=[(30, 96, 1000, 513), (1600, 270, 1830, 420), (1090, 285, 1360, 415)]),
    'nosotros': dict(fin=600, panel=545, zonas=[(30, 96, 940, 597), (1580, 380, 1830, 597)]),
    'recursos': dict(fin=667, panel=545, zonas=[(30, 96, 980, 664), (1420, 280, 1830, 664)]),
}


def mascara(bgr, zonas, corrimiento):
    alto, ancho = bgr.shape[:2]
    total = np.zeros((alto, ancho), np.uint8)
    gris = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    realce = cv2.subtract(gris, cv2.medianBlur(gris, 31))
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    solido = cv2.inRange(hsv, np.array([95, 140, 110]), np.array([115, 255, 255]))

    for zona in zonas:
        x0, y0, x1, y1 = zona[:4]
        umbral = zona[4] if len(zona) > 4 else 14
        y0, y1 = max(0, y0 - corrimiento), min(alto, y1 - corrimiento)
        x0, x1 = max(0, x0), min(ancho, x1)
        _, letras = cv2.threshold(realce[y0:y1, x0:x1], umbral, 255, cv2.THRESH_BINARY)
        total[y0:y1, x0:x1] = cv2.bitwise_or(letras, solido[y0:y1, x0:x1])

    return cv2.dilate(total, np.ones((3, 3), np.uint8), iterations=3)


def aplanar_panel(bgr, hasta, pluma=150):
    alto, ancho = bgr.shape[:2]
    columna = np.median(bgr[:, 6:26].astype(float), axis=1)
    columna = cv2.GaussianBlur(columna.reshape(-1, 1, 3).astype(np.float32), (1, 41), 0).reshape(-1, 3)
    plano = np.repeat(columna[:, None, :], hasta + pluma, axis=1)

    mezcla = np.ones((hasta + pluma,), np.float32)
    mezcla[hasta:] = np.linspace(1.0, 0.0, pluma)
    mezcla = mezcla[None, :, None]

    region = bgr[:, : hasta + pluma].astype(np.float32)
    bgr[:, : hasta + pluma] = (plano * mezcla + region * (1 - mezcla)).astype(np.uint8)
    return bgr


def extraer(nombre, cfg, escala=1.4):
    origen = Image.open(os.path.join(REFERENCIA, f'{nombre}.png')).convert('RGB')
    banda = origen.crop((0, ALTO_CABECERA, origen.width, cfg['fin']))
    bgr = cv2.cvtColor(np.array(banda), cv2.COLOR_RGB2BGR)

    m = mascara(bgr, cfg['zonas'], ALTO_CABECERA)
    limpio = cv2.inpaint(bgr, m, 11, cv2.INPAINT_TELEA)
    limpio = cv2.inpaint(limpio, m, 5, cv2.INPAINT_NS)
    limpio = aplanar_panel(limpio, cfg['panel'])
    limpio = cv2.bilateralFilter(limpio, 7, 28, 9)

    im = Image.fromarray(cv2.cvtColor(limpio, cv2.COLOR_BGR2RGB))
    return im.resize((int(im.width * escala), int(im.height * escala)), Image.LANCZOS)


if __name__ == '__main__':
    for nombre in (sys.argv[1:] or list(PORTADAS)):
        im = extraer(nombre, PORTADAS[nombre])
        im.save(os.path.join(PRUEBAS, f'arte-{nombre}.png'))
        print(f'{nombre:14s} {im.width}x{im.height}')


def publicar(ancho=2000, calidad=76):
    for nombre, cfg in PORTADAS.items():
        im = extraer(nombre, cfg, escala=1.0)
        im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
        destino = os.path.join('public/images', f'portada-{nombre}.webp')
        im.save(destino, 'WEBP', quality=calidad, method=6)
        print(f'{os.path.basename(destino):28s} {im.width}x{im.height}  {os.path.getsize(destino)//1024}KB')


BANDAS = {
    'cambio-inicio': dict(pagina='inicio', ini=599, fin=846, panel=430,
                          zonas=[(20, 599, 780, 846), (1560, 599, 1830, 846)]),
    'llamada-inicio': dict(pagina='inicio', ini=2270, fin=2510, panel=430,
                           zonas=[(20, 2270, 900, 2510), (1300, 2270, 1830, 2510)]),
    'llamada-soluciones': dict(pagina='soluciones', ini=1962, fin=2268, panel=430,
                               zonas=[(20, 1962, 935, 2268), (930, 1962, 1830, 2268, 30)]),
    'llamada-tecnologia': dict(pagina='tecnologia', ini=1958, fin=2270, panel=430,
                               zonas=[(20, 1958, 935, 2270), (930, 1958, 1830, 2270, 30)]),
    'llamada-sectores': dict(pagina='sectores', ini=2307, fin=2508, panel=430,
                             zonas=[(20, 2307, 900, 2508), (940, 2307, 1830, 2508, 34)]),
    'llamada-casos-de-uso': dict(pagina='casos-de-uso', ini=2278, fin=2450, panel=430,
                                 zonas=[(20, 2278, 900, 2450), (940, 2278, 1830, 2450, 34)]),
    'llamada-nosotros': dict(pagina='nosotros', ini=2255, fin=2448, panel=430,
                             zonas=[(20, 2255, 900, 2448), (1250, 2255, 1830, 2448)]),
    'llamada-recursos': dict(pagina='recursos', ini=2225, fin=2455, panel=430,
                             zonas=[(20, 2225, 900, 2455), (1250, 2225, 1830, 2455)]),
}


def extraer_banda(cfg, escala=1.0):
    origen = Image.open(os.path.join(REFERENCIA, f"{cfg['pagina']}.png")).convert('RGB')
    banda = origen.crop((0, cfg['ini'], origen.width, cfg['fin']))
    bgr = cv2.cvtColor(np.array(banda), cv2.COLOR_RGB2BGR)
    m = mascara(bgr, cfg['zonas'], cfg['ini'])
    limpio = cv2.inpaint(bgr, m, 11, cv2.INPAINT_TELEA)
    limpio = cv2.inpaint(limpio, m, 5, cv2.INPAINT_NS)
    limpio = aplanar_panel(limpio, cfg['panel'], pluma=190)
    limpio = cv2.bilateralFilter(limpio, 7, 26, 9)
    im = Image.fromarray(cv2.cvtColor(limpio, cv2.COLOR_BGR2RGB))
    if escala != 1.0:
        im = im.resize((int(im.width * escala), int(im.height * escala)), Image.LANCZOS)
    return im


def publicar_bandas(ancho=1900, calidad=88):
    for nombre, cfg in BANDAS.items():
        im = extraer_banda(cfg)
        im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
        destino = os.path.join('public/images', f'{nombre}.webp')
        im.save(destino, 'WEBP', quality=calidad, method=6)
        print(f'{nombre:24s} {im.width}x{im.height}  {os.path.getsize(destino)//1024}KB')
