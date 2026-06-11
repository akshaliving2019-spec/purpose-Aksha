# -*- coding: utf-8 -*-
"""Validación de las fuentes de datos del cálculo AKSHA (uso local).
1. Integridad de archivos .se1: Swiss vs modelo independiente Moshier.
2. Estrellas fijas vs posiciones astronómicas publicadas.
3. Cobertura temporal de los archivos (1800-2400).
4. Husos horarios históricos (IANA tzdata)."""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
import swisseph as swe

EPHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "api", "ephe")
swe.set_ephe_path(EPHE)

SIGNOS = ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
          "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"]

jd = swe.julday(1963, 7, 28, 21.0)  # Nydia, 16:00 Bogotá = 21:00 UTC

print("=== 1. Integridad .se1: Swiss vs Moshier (diferencia en segundos de arco) ===")
for nombre, p in [("Sol", swe.SUN), ("Luna", swe.MOON), ("Mercurio", swe.MERCURY),
                  ("Venus", swe.VENUS), ("Marte", swe.MARS), ("Júpiter", swe.JUPITER),
                  ("Saturno", swe.SATURN), ("Plutón", swe.PLUTO)]:
    s, _ = swe.calc_ut(jd, p, swe.FLG_SWIEPH)
    m, _ = swe.calc_ut(jd, p, swe.FLG_MOSEPH)
    print(f"  {nombre}: {abs(s[0] - m[0]) * 3600:.2f}\"")

print("\n=== 2. Estrellas fijas 1963 vs valores publicados ===")
print("  (esperado 1963: Regulus ~29° Leo, Spica ~23° Libra, Aldebarán ~9° Géminis)")
for star in ["Regulus", "Spica", "Aldebaran"]:
    lon = swe.fixstar_ut(star, jd, swe.FLG_SWIEPH)[0][0] % 360
    g = lon % 30
    print(f"  {star}: {int(g):02d}°{int(g % 1 * 60):02d}' {SIGNOS[int(lon // 30)]}")

print("\n=== 3. Cobertura temporal (Quirón exige el archivo de asteroides) ===")
for anio in [1900, 1950, 2026, 2100, 2399]:
    try:
        swe.calc_ut(swe.julday(anio, 6, 15, 12.0), swe.CHIRON, swe.FLG_SWIEPH)
        print(f"  {anio}: ok")
    except swe.Error:
        print(f"  {anio}: FUERA DE RANGO")

print("\n=== 4. Husos horarios históricos (IANA tzdata) ===")
from datetime import datetime
from zoneinfo import ZoneInfo
tz = ZoneInfo("America/Bogota")
d63 = datetime(1963, 7, 28, 16, 0, tzinfo=tz)
d92 = datetime(1992, 7, 28, 16, 0, tzinfo=tz)
print(f"  Bogotá 1963: UTC{d63.utcoffset()} (esperado -5:00)")
print(f"  Bogotá 1992: UTC{d92.utcoffset()} (esperado -4:00 — Colombia tuvo hora de verano solo ese año)")
