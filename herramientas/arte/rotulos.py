# -*- coding: utf-8 -*-
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
from extraer import PORTADAS, extraer  # noqa: E402

TIPOGRAFIA = 'C:/Windows/Fonts/bahnschrift.ttf'
EJE_GRUESO = 700
ALTO_CABECERA = 88

ROTULOS_SOLUCIONES = [
    dict(borrar=(1104, 318, 1224, 360), caja=(1106, 316, 1222, 362), es='DETECTA', en='DETECT'),
    dict(borrar=(1402, 374, 1522, 416), caja=(1404, 372, 1520, 418), es='ANALIZA', en='ANALYZE'),
    dict(borrar=(1278, 478, 1406, 520), caja=(1280, 476, 1404, 522), es='RESPONDE', en='RESPOND'),
]


def borrar_rotulos(bgr, rotulos, corrimiento):
    mascara = np.zeros(bgr.shape[:2], np.uint8)
    for r in rotulos:
        x0, y0, x1, y1 = r['borrar']
        mascara[y0 - corrimiento:y1 - corrimiento, x0:x1] = 255
    return cv2.inpaint(bgr, mascara, 9, cv2.INPAINT_TELEA)


def dibujar(imagen, rotulos, idioma, corrimiento, alto_mayuscula=24, margen=9):
    capa = Image.new('RGBA', imagen.size, (0, 0, 0, 0))
    lienzo = ImageDraw.Draw(capa)

    for r in rotulos:
        texto = r[idioma]
        x0, y0, x1, y1 = r['caja']
        y0 -= corrimiento
        y1 -= corrimiento
        disponible = (x1 - x0) - 2 * margen

        tamano = 8
        while True:
            prueba = ImageFont.truetype(TIPOGRAFIA, tamano + 1)
            try:
                prueba.set_variation_by_axes([EJE_GRUESO, 100])
            except Exception:
                pass
            caja = prueba.getbbox('H')
            if caja[3] - caja[1] > alto_mayuscula or tamano > 120:
                break
            tamano += 1

        fuente = ImageFont.truetype(TIPOGRAFIA, tamano)
        try:
            fuente.set_variation_by_axes([EJE_GRUESO, 100])
        except Exception:
            pass

        letras = Image.new('RGBA', (max(disponible * 3, 600), (y1 - y0) * 3), (0, 0, 0, 0))
        pincel = ImageDraw.Draw(letras)
        espaciado = max(1, round(tamano * 0.06))
        x = 0
        for caracter in texto:
            pincel.text((x, 0), caracter, font=fuente, fill=(238, 246, 255, 255))
            x += round(pincel.textlength(caracter, font=fuente)) + espaciado
        recorte = letras.crop(letras.getbbox())

        escala = min(disponible / recorte.width, 1.35)
        destino = recorte.resize((round(recorte.width * escala), round(recorte.height * escala)), Image.LANCZOS)

        px = x0 + ((x1 - x0) - destino.width) // 2
        py = y0 + ((y1 - y0) - destino.height) // 2
        resplandor = destino.filter(ImageFilter.GaussianBlur(3))
        capa.alpha_composite(resplandor, (px, py))
        capa.alpha_composite(destino, (px, py))

    return Image.alpha_composite(imagen.convert('RGBA'), capa).convert('RGB')


def publicar_soluciones(ancho=2000, calidad=88):
    cfg = PORTADAS['soluciones']
    for idioma, sufijo in [('en', '-en')]:
        base = extraer('soluciones', cfg, escala=1.0)
        bgr = cv2.cvtColor(np.array(base), cv2.COLOR_RGB2BGR)
        limpio = borrar_rotulos(bgr, ROTULOS_SOLUCIONES, ALTO_CABECERA)
        im = Image.fromarray(cv2.cvtColor(limpio, cv2.COLOR_BGR2RGB))
        im = dibujar(im, ROTULOS_SOLUCIONES, idioma, ALTO_CABECERA)
        im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
        destino = os.path.join('public/images', f'portada-soluciones{sufijo}.webp')
        im.save(destino, 'WEBP', quality=calidad, method=6)
        print(f'{os.path.basename(destino):32s} {im.width}x{im.height}  {os.path.getsize(destino)//1024}KB')


if __name__ == '__main__':
    publicar_soluciones()
