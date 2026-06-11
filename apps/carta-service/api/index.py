# -*- coding: utf-8 -*-
"""
AKSHA LIFE — Cálculo universal de carta natal con Swiss Ephemeris (pyswisseph).

Funciona para CUALQUIER cliente: recibe fecha, hora y lugar de nacimiento y
devuelve un JSON con planetas, casas (Placidus), ASC, MC, aspectos natales
verificados matemáticamente (algoritmo A1→A2→A3 del sistema AKSHA) y,
opcionalmente, tránsitos para una fecha dada.

Uso CLI:
  python calcular_carta.py --fecha 28/07/1963 --hora 16:00 --lugar "Bogotá, Colombia"
  python calcular_carta.py --fecha 28/07/1963 --hora 16:00 --lat 4.711 --lon -74.072 --tz America/Bogota
  python calcular_carta.py --fecha 28/07/1963 --hora 16:00 --lugar Bogotá --transitos 2026-06-09 --lugar-transitos Miami

Este mismo archivo funciona como Serverless Function de Vercel (runtime Python):
  POST /api/calcular_carta  body: {"fecha":"28/07/1963","hora":"16:00","lugar":"Bogotá, Colombia"}
"""

import argparse
import hmac
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta

import swisseph as swe

# ─────────────────────────────────────────────────────────────────────────────
# Configuración de efemérides: usa archivos .se1 si existen (precisión máxima
# + Quirón); si no, cae a Moshier (precisión suficiente para planetas).
# ─────────────────────────────────────────────────────────────────────────────
EPHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ephe")
HAY_ARCHIVOS_EFEMERIDES = os.path.isfile(os.path.join(EPHE_PATH, "sepl_18.se1"))
if HAY_ARCHIVOS_EFEMERIDES:
    swe.set_ephe_path(EPHE_PATH)
    FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED
else:
    FLAGS = swe.FLG_MOSEPH | swe.FLG_SPEED

SIGNOS = [
    "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
    "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis",
]

PLANETAS = [
    ("Sol", swe.SUN),
    ("Luna", swe.MOON),
    ("Mercurio", swe.MERCURY),
    ("Venus", swe.VENUS),
    ("Marte", swe.MARS),
    ("Júpiter", swe.JUPITER),
    ("Saturno", swe.SATURN),
    ("Urano", swe.URANUS),
    ("Neptuno", swe.NEPTUNE),
    ("Plutón", swe.PLUTO),
    ("Nodo Norte", swe.TRUE_NODE),
    ("Quirón", swe.CHIRON),
]

# Ciudades frecuentes (lat, lon, zona horaria IANA). Para cualquier otra ciudad
# se usa geocodificación gratuita de Open-Meteo (sin API key).
CIUDADES = {
    "bogota": (4.711, -74.0721, "America/Bogota"),
    "bogotá": (4.711, -74.0721, "America/Bogota"),
    "medellin": (6.2442, -75.5812, "America/Bogota"),
    "medellín": (6.2442, -75.5812, "America/Bogota"),
    "cali": (3.4516, -76.5320, "America/Bogota"),
    "barranquilla": (10.9685, -74.7813, "America/Bogota"),
    "cartagena": (10.3910, -75.4794, "America/Bogota"),
    "miami": (25.7617, -80.1918, "America/New_York"),
    "new york": (40.7128, -74.0060, "America/New_York"),
    "nueva york": (40.7128, -74.0060, "America/New_York"),
    "caracas": (10.4806, -66.9036, "America/Caracas"),
    "buenos aires": (-34.6037, -58.3816, "America/Argentina/Buenos_Aires"),
    "ciudad de mexico": (19.4326, -99.1332, "America/Mexico_City"),
    "ciudad de méxico": (19.4326, -99.1332, "America/Mexico_City"),
    "guadalajara": (20.6597, -103.3496, "America/Mexico_City"),
    "santiago": (-33.4489, -70.6693, "America/Santiago"),
    "lima": (-12.0464, -77.0428, "America/Lima"),
    "quito": (-0.1807, -78.4678, "America/Guayaquil"),
    "guayaquil": (-2.1700, -79.9224, "America/Guayaquil"),
    "la paz": (-16.4897, -68.1193, "America/La_Paz"),
    "asuncion": (-25.2637, -57.5759, "America/Asuncion"),
    "asunción": (-25.2637, -57.5759, "America/Asuncion"),
    "montevideo": (-34.9011, -56.1645, "America/Montevideo"),
    "san jose": (9.9281, -84.0907, "America/Costa_Rica"),
    "san josé": (9.9281, -84.0907, "America/Costa_Rica"),
    "panama": (8.9824, -79.5199, "America/Panama"),
    "panamá": (8.9824, -79.5199, "America/Panama"),
    "tegucigalpa": (14.0723, -87.1921, "America/Tegucigalpa"),
    "managua": (12.1150, -86.2362, "America/Managua"),
    "san salvador": (13.6929, -89.2182, "America/El_Salvador"),
    "guatemala": (14.6349, -90.5069, "America/Guatemala"),
    "santo domingo": (18.4861, -69.9312, "America/Santo_Domingo"),
    "san juan": (18.4655, -66.1057, "America/Puerto_Rico"),
    "la habana": (23.1136, -82.3666, "America/Havana"),
    "madrid": (40.4168, -3.7038, "Europe/Madrid"),
    "barcelona": (41.3851, 2.1734, "Europe/Madrid"),
    "los angeles": (34.0522, -118.2437, "America/Los_Angeles"),
    "houston": (29.7604, -95.3698, "America/Chicago"),
    "chicago": (41.8781, -87.6298, "America/Chicago"),
    "orlando": (28.5384, -81.3789, "America/New_York"),
}

# Aspectos AKSHA — ángulo exacto, orbe, símbolo y tipo
ASPECTOS = [
    ("Conjunción", 0, 5, "☌", "NEUTRO"),
    ("Sextil", 60, 4, "✶", "MOTOR"),
    ("Cuadratura", 90, 5, "□", "FRENO"),
    ("Trígono", 120, 5, "△", "MOTOR"),
    ("Quincuncio", 150, 3, "⚻", "AJUSTE"),
    ("Oposición", 180, 5, "☍", "FRENO MAYOR"),
]


# ─────────────────────────────────────────────────────────────────────────────
# Utilidades
# ─────────────────────────────────────────────────────────────────────────────
def grados_a_signo(lon):
    """360° eclípticos → (signo, grados, minutos, etiqueta '05°03'' Leo')."""
    lon = lon % 360.0
    signo = SIGNOS[int(lon // 30)]
    total_min = lon % 30.0 * 60.0
    g = int(total_min // 60)
    m = int(round(total_min % 60))
    if m == 60:
        g, m = g + 1, 0
    return signo, g, m, f"{g:02d}°{m:02d}' {signo}"


def casa_de(lon_planeta, cuspides):
    """Casa Placidus: la casa cuya cúspide ≤ longitud < cúspide siguiente."""
    lon_planeta = lon_planeta % 360.0
    for i in range(12):
        c1 = cuspides[i] % 360.0
        c2 = cuspides[(i + 1) % 12] % 360.0
        if c1 <= c2:
            if c1 <= lon_planeta < c2:
                return i + 1
        else:  # el rango cruza 0° Aries
            if lon_planeta >= c1 or lon_planeta < c2:
                return i + 1
    return 0


def geocodificar(lugar):
    """Resuelve cualquier lugar a (lat, lon, tz IANA). Tabla local primero,
    después Open-Meteo (gratis, sin key). Lanza ValueError si no se encuentra."""
    clave = lugar.lower().strip()
    for ciudad, datos in CIUDADES.items():
        if ciudad in clave:
            return datos
    nombre = lugar.split(",")[0].strip()
    url = (
        "https://geocoding-api.open-meteo.com/v1/search?name="
        + urllib.parse.quote(nombre)
        + "&count=1&language=es&format=json"
    )
    with urllib.request.urlopen(url, timeout=10) as r:
        data = json.loads(r.read().decode("utf-8"))
    if not data.get("results"):
        raise ValueError(f"No se pudo geocodificar el lugar: {lugar!r}. "
                         "Proporciona lat/lon/tz explícitos.")
    res = data["results"][0]
    return res["latitude"], res["longitude"], res.get("timezone", "UTC")


def a_jd_utc(fecha, hora, lat, lon, tz):
    """fecha DD/MM/YYYY (o YYYY-MM-DD) + hora local 'HH:MM' + tz → día juliano UT."""
    if "/" in fecha:
        dia, mes, anio = (int(x) for x in fecha.split("/"))
    else:
        anio, mes, dia = (int(x) for x in fecha.split("-"))
    hh, mm = (int(x) for x in (hora or "12:00").split(":")[:2])

    if isinstance(tz, (int, float)):
        tzinfo = timezone(timedelta(hours=float(tz)))
    else:
        from zoneinfo import ZoneInfo
        tzinfo = ZoneInfo(tz)

    local = datetime(anio, mes, dia, hh, mm, tzinfo=tzinfo)
    utc = local.astimezone(timezone.utc)
    hora_decimal = utc.hour + utc.minute / 60.0 + utc.second / 3600.0
    return swe.julday(utc.year, utc.month, utc.day, hora_decimal), utc


def calcular_posiciones(jd):
    """Posiciones eclípticas de los 12 puntos AKSHA para un día juliano dado."""
    posiciones = []
    for nombre, codigo in PLANETAS:
        try:
            datos, _ = swe.calc_ut(jd, codigo, FLAGS)
        except swe.Error:
            # Quirón requiere seas_18.se1; si falta, lo omitimos con aviso.
            if nombre == "Quirón":
                continue
            raise
        lon_e, velocidad = datos[0], datos[3]
        signo, g, m, etiqueta = grados_a_signo(lon_e)
        posiciones.append({
            "nombre": nombre,
            "longitud": round(lon_e, 4),
            "signo": signo,
            "grados": g,
            "minutos": m,
            "posicion": etiqueta,
            "retrogrado": velocidad < 0,
        })
    return posiciones


def calcular_aspectos(puntos):
    """Algoritmo AKSHA A1→A2→A3: distancias angulares entre todos los pares y
    clasificación con orbes (Conj/Op/Cuad/Tríg ±5°, Sextil ±4°, Quinc ±3°)."""
    aspectos = []
    for i in range(len(puntos)):
        for j in range(i + 1, len(puntos)):
            a, b = puntos[i], puntos[j]
            d = abs(a["longitud"] - b["longitud"]) % 360.0
            if d > 180.0:
                d = 360.0 - d
            for nombre, angulo, orbe, simbolo, tipo in ASPECTOS:
                desvio = abs(d - angulo)
                if desvio <= orbe:
                    aspectos.append({
                        "planeta_a": a["nombre"],
                        "planeta_b": b["nombre"],
                        "distancia": round(d, 2),
                        "aspecto": nombre,
                        "simbolo": simbolo,
                        "tipo": tipo,
                        "orbe": round(desvio, 2),
                    })
                    break
    return aspectos


def calcular_carta(fecha, hora, lugar=None, lat=None, lon=None, tz=None, nombre=None):
    """Carta natal completa para cualquier persona. Devuelve dict listo para JSON."""
    if lat is None or lon is None or tz is None:
        if not lugar:
            raise ValueError("Se requiere 'lugar' o bien lat+lon+tz explícitos.")
        lat, lon, tz = geocodificar(lugar)

    jd, utc = a_jd_utc(fecha, hora, lat, lon, tz)

    planetas = calcular_posiciones(jd)

    cuspides, ascmc = swe.houses(jd, lat, lon, b"P")
    cuspides = list(cuspides[:12])
    asc, mc = ascmc[0], ascmc[1]

    for p in planetas:
        p["casa"] = casa_de(p["longitud"], cuspides)

    signo_asc, g_asc, m_asc, etiqueta_asc = grados_a_signo(asc)
    signo_mc, g_mc, m_mc, etiqueta_mc = grados_a_signo(mc)

    puntos_aspectos = planetas + [
        {"nombre": "ASC", "longitud": asc},
        {"nombre": "MC", "longitud": mc},
    ]
    aspectos = calcular_aspectos(puntos_aspectos)

    carta = {
        "nombre": nombre,
        "datos_nacimiento": {
            "fecha": fecha,
            "hora_local": hora,
            "lugar": lugar,
            "latitud": round(float(lat), 4),
            "longitud_geo": round(float(lon), 4),
            "zona_horaria": str(tz),
            "utc": utc.strftime("%Y-%m-%d %H:%M UTC"),
            "dia_juliano": round(jd, 6),
        },
        "sistema_casas": "Placidus",
        "efemerides": "Swiss Ephemeris " + swe.version
                      + ("" if HAY_ARCHIVOS_EFEMERIDES else " (modo Moshier)"),
        "ascendente": {"longitud": round(asc, 4), "signo": signo_asc,
                       "grados": g_asc, "minutos": m_asc, "posicion": etiqueta_asc},
        "medio_cielo": {"longitud": round(mc, 4), "signo": signo_mc,
                        "grados": g_mc, "minutos": m_mc, "posicion": etiqueta_mc},
        "cuspides_casas": {f"casa_{i+1}": round(c, 4) for i, c in enumerate(cuspides)},
        "planetas": planetas,
        "aspectos_natales": aspectos,
    }
    carta["texto"] = formatear_texto(carta)
    return carta


def calcular_transitos(fecha_transito, hora_transito, lat, lon, tz, carta_natal):
    """Posiciones de tránsito + aspectos de tránsito a puntos natales."""
    jd, utc = a_jd_utc(fecha_transito, hora_transito or "12:00", lat, lon, tz)
    transitos = calcular_posiciones(jd)

    natales = carta_natal["planetas"] + [
        {"nombre": "ASC", "longitud": carta_natal["ascendente"]["longitud"]},
        {"nombre": "MC", "longitud": carta_natal["medio_cielo"]["longitud"]},
    ]

    aspectos_transito = []
    for t in transitos:
        for n in natales:
            d = abs(t["longitud"] - n["longitud"]) % 360.0
            if d > 180.0:
                d = 360.0 - d
            for nombre_asp, angulo, orbe, simbolo, tipo in ASPECTOS:
                desvio = abs(d - angulo)
                if desvio <= orbe:
                    aspectos_transito.append({
                        "transito": t["nombre"],
                        "posicion_transito": t["posicion"],
                        "aspecto": nombre_asp,
                        "simbolo": simbolo,
                        "tipo": tipo,
                        "natal": n["nombre"],
                        "orbe": round(desvio, 2),
                        "exacto": desvio <= 1.0,
                    })
                    break
    return {
        "fecha": utc.strftime("%Y-%m-%d %H:%M UTC"),
        "posiciones": transitos,
        "aspectos_a_natal": aspectos_transito,
    }


def formatear_texto(carta):
    """Bloque de texto legible que se inserta en el prompt de Claude."""
    lineas = [
        "CARTA NATAL — SWISS EPHEMERIS (cálculo verificado)",
        "─────────────────────────────────────────",
    ]
    if carta.get("nombre"):
        lineas.append(f"Nombre: {carta['nombre']}")
    dn = carta["datos_nacimiento"]
    lugar_txt = dn["lugar"] or f"{dn['latitud']}, {dn['longitud_geo']}"
    lineas.append(f"Fecha: {dn['fecha']} · Hora local: {dn['hora_local']} · Lugar: {lugar_txt}")
    lineas.append(f"Coordenadas: {dn['latitud']}, {dn['longitud_geo']} · Zona: {dn['zona_horaria']} · {dn['utc']}")
    lineas.append(f"Sistema de casas: {carta['sistema_casas']}")
    lineas.append("─────────────────────────────────────────")
    for p in carta["planetas"]:
        rx = " Rx" if p["retrogrado"] else ""
        lineas.append(f"{p['nombre']}: {p['posicion']}{rx} · Casa {p['casa']}")
    lineas.append(f"ASC: {carta['ascendente']['posicion']} · MC: {carta['medio_cielo']['posicion']}")
    lineas.append("─────────────────────────────────────────")
    lineas.append("ASPECTOS NATALES VERIFICADOS (algoritmo AKSHA A1→A2→A3):")
    for a in carta["aspectos_natales"]:
        lineas.append(
            f"{a['planeta_a']} {a['simbolo']} {a['planeta_b']} — {a['aspecto']}"
            f" ({a['distancia']}°, orbe {a['orbe']}°) · {a['tipo']}"
        )
    if "transitos" in carta:
        t = carta["transitos"]
        lineas.append("─────────────────────────────────────────")
        lineas.append(f"TRÁNSITOS ACTIVOS — {t['fecha']}:")
        for p in t["posiciones"]:
            rx = " Rx" if p["retrogrado"] else ""
            lineas.append(f"{p['nombre']} tránsito: {p['posicion']}{rx}")
        lineas.append("ASPECTOS DE TRÁNSITO A LA CARTA NATAL:")
        for a in t["aspectos_a_natal"]:
            ex = " ⚡EXACTO" if a["exacto"] else ""
            lineas.append(
                f"{a['transito']} ({a['posicion_transito']}) {a['simbolo']} "
                f"{a['natal']} natal — {a['aspecto']} (orbe {a['orbe']}°){ex}"
            )
    return "\n".join(lineas)


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────
def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")  # consolas Windows usan cp1252
    ap = argparse.ArgumentParser(description="AKSHA — carta natal universal (Swiss Ephemeris)")
    ap.add_argument("--fecha", required=True, help="DD/MM/YYYY o YYYY-MM-DD")
    ap.add_argument("--hora", default="12:00", help="HH:MM hora local")
    ap.add_argument("--lugar", help="Ciudad, País (geocodificación automática)")
    ap.add_argument("--lat", type=float)
    ap.add_argument("--lon", type=float)
    ap.add_argument("--tz", help="Zona IANA (America/Bogota) u offset horario (-5)")
    ap.add_argument("--nombre", help="Nombre del cliente")
    ap.add_argument("--transitos", help="Fecha de tránsitos YYYY-MM-DD (opcional)")
    ap.add_argument("--hora-transitos", default="12:00")
    ap.add_argument("--lugar-transitos", default="Miami")
    ap.add_argument("--solo-texto", action="store_true", help="Imprime solo el bloque de texto")
    args = ap.parse_args()

    tz = args.tz
    if tz is not None:
        try:
            tz = float(tz)
        except ValueError:
            pass

    carta = calcular_carta(args.fecha, args.hora, lugar=args.lugar,
                           lat=args.lat, lon=args.lon, tz=tz, nombre=args.nombre)

    if args.transitos:
        t_lat, t_lon, t_tz = geocodificar(args.lugar_transitos)
        carta["transitos"] = calcular_transitos(
            args.transitos, args.hora_transitos, t_lat, t_lon, t_tz, carta)
        carta["texto"] = formatear_texto(carta)

    if args.solo_texto:
        print(carta["texto"])
    else:
        print(json.dumps(carta, ensure_ascii=False, indent=2))


# ─────────────────────────────────────────────────────────────────────────────
# Handler para Vercel (Python Serverless Function)
# ─────────────────────────────────────────────────────────────────────────────
from http.server import BaseHTTPRequestHandler

# Secreto compartido con el orquestador (CARTA_SHARED_SECRET en ambos
# proyectos de Vercel). Si está configurado, el POST exige
# Authorization: Bearer <secreto>; si no, el servicio queda abierto
# (solo para desarrollo / transición).
SECRETO_SERVICIO = os.environ.get("CARTA_SHARED_SECRET", "").strip()


class handler(BaseHTTPRequestHandler):
    def _responder(self, codigo, cuerpo):
        datos = json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(datos)))
        self.end_headers()
        self.wfile.write(datos)

    def _autorizado(self):
        if not SECRETO_SERVICIO:
            return True
        auth = self.headers.get("Authorization", "")
        return hmac.compare_digest(auth, "Bearer " + SECRETO_SERVICIO)

    def do_GET(self):
        self._responder(200, {
            "servicio": "AKSHA calcular_carta",
            "efemerides": "Swiss Ephemeris " + swe.version,
            "uso": "POST {fecha, hora, lugar | lat+lon+tz, nombre?, transitos?, lugar_transitos?}",
        })

    def do_POST(self):
        if not self._autorizado():
            return self._responder(401, {"error": "No autorizado"})
        try:
            largo = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(largo).decode("utf-8")) if largo else {}
            carta = calcular_carta(
                body["fecha"], body.get("hora", "12:00"),
                lugar=body.get("lugar"), lat=body.get("lat"),
                lon=body.get("lon"), tz=body.get("tz"),
                nombre=body.get("nombre"),
            )
            if body.get("transitos"):
                lt = body.get("lugar_transitos", "Miami")
                t_lat, t_lon, t_tz = geocodificar(lt)
                carta["transitos"] = calcular_transitos(
                    body["transitos"], body.get("hora_transitos", "12:00"),
                    t_lat, t_lon, t_tz, carta)
                carta["texto"] = formatear_texto(carta)
            self._responder(200, carta)
        except Exception as e:  # noqa: BLE001 — el cliente necesita el motivo
            self._responder(400, {"error": str(e)})


if __name__ == "__main__":
    main()
