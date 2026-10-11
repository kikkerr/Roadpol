#!/usr/bin/env python3
"""Roadpol: bouwt src/ om tot één zelfstandig HTML-bestand (dist/Roadpol.html).

Gebruik:  python3 bouw_html.py
Alle onderdelen (wegcode, alcohol, ...) zitten in src/. Het resultaat is één bestand
dat je rechtstreeks in een browser kan openen (ook iOS) of in de Android-app kan steken.
"""
import base64, io, os, re, sys, urllib.parse
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
OUT = os.path.join(HERE, 'dist')
os.makedirs(OUT, exist_ok=True)

def rd(n): return open(os.path.join(SRC, n), encoding='utf-8').read()

# ---------- logo in verschillende formaten ----------
im = Image.open(os.path.join(SRC, 'icoon_stop.png')).convert('RGBA')
def b64(px):
    b = io.BytesIO(); im.resize((px, px), Image.LANCZOS).save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
LOGO, FAV, TOUCH, IC192 = b64(256), b64(64), b64(180), b64(192)
manifest = urllib.parse.quote('{"name":"Roadpol","short_name":"Roadpol","start_url":".","display":"standalone",'
  '"background_color":"#1e3a5f","theme_color":"#1e3a5f","icons":[{"src":"%s","sizes":"192x192","type":"image/png"}]}' % IC192)

# ---------- iconen ----------
def svg(inner): return '<svg viewBox="0 0 24 24" aria-hidden="true">%s</svg>' % inner
ICON = {
 'wegcode': svg('<path d="M8.5 3 4 21M15.5 3 20 21M12 4.5v3M12 10.5v3M12 16.5v3"/>'),
 'drugs': svg('<g transform="rotate(-45 12 12)"><rect x="2.5" y="8" width="19" height="8" rx="4"/><path d="M12 8v8"/></g>'),
 'alcohol': svg('<path d="M6.5 3h11l-1 6a4.5 4.5 0 0 1-9 0z"/><path d="M12 13.5V20M8 21h8"/>'),
 'keuring': svg('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8.5 13l2.5 2.5 4.5-5"/>'),
 'inschrijving': svg('<rect x="2.5" y="6.5" width="19" height="11" rx="2.5"/><path d="M6 9.5v5M10 10.5h8M10 13.5h5"/>'),
 'verzekering': svg('<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6z"/><path d="M8.8 12l2.4 2.4 4-4.4"/>'),
 'tools': svg('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
}
BACK = ('<a class="back" href="#/" aria-label="Terug naar start">'
        '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></a>')

# (slug, titel, omschrijving, klaar?)
ONDERDELEN = [
 ('wegcode', 'Wegcode', 'Overtredingen, graden en boetes', True),
 ('drugs', 'Drugs', '', False),
 ('alcohol', 'Alcohol', 'Waarden en procedure', True),
 ('keuring', 'Keuring', '', False),
 ('inschrijving', 'Inschrijving', '', False),
 ('verzekering', 'Verzekering', '', False),
 ('tools', 'Tools', '', False),
]
CHEV = '<svg class="go" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>'

# ---------- startscherm ----------
tegels = []
for i, (slug, titel, oms, klaar) in enumerate(ONDERDELEN):
    cls = 'tile' + (' wide' if i == 0 else '') + (' rdy' if klaar else '')
    extra = CHEV if klaar else '<i>binnenkort</i>'
    sub = '<small>%s</small>' % oms if oms else ''
    tegels.append('<a class="%s" href="#/%s" style="--i:%d"><span class="ti">%s</span><span class="tt"><b>%s</b>%s</span>%s</a>'
                  % (cls, slug, i, ICON[slug], titel, sub, extra))
home = ('<div id="v-home" class="view on"><div class="hero"><div class="logo"></div><h1>Roadpol</h1>'
        '<p>Hulpmiddel op de baan</p></div><div class="tiles">%s</div></div>') % ''.join(tegels)

# ---------- wegcode ----------
wegcode = ('<div id="v-wegcode" class="view"><header><div class="hrow">' + BACK +
  '<div class="htitle"><small>Roadpol</small><b>Wegcode</b></div>'
  '<div class="chip">admin. toeslag<b>10,67 €</b></div>'
  '<button class="hbtn" id="wc-search" type="button" aria-label="Zoeken"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></button></div>'
  '<div class="hx"><nav><a href="#algemeen">Algemeen</a><a href="#top1">1°</a><a href="#top2">2°</a><a href="#top3">3°</a><a href="#top4">4°</a></nav>'
  '<input id="q" type="search" placeholder="Zoek: gordel, gsm, voorrang, rood licht…" autocomplete="off"></div></header>'
  + rd('wegcode.html').replace('</main>',
    '<div class="vfoot"><div class="logo"></div>Roadpol<br>Bronnen: KB 30/09/2005 · KB 01/12/1975</div></main>')
  + '</div>')

# ---------- alcohol ----------
alcohol = '<div id="v-alcohol" class="view">' + rd('alcohol.html').replace('{{BACK}}', BACK) + '</div>'

# ---------- lege onderdelen ----------
def leeg(slug, titel):
    return ('<div id="v-%s" class="view"><header><div class="hrow">%s<div class="htitle"><small>Roadpol</small><b>%s</b></div></div></header>'
            '<main><div class="empty"><div class="ti">%s</div><h2>%s</h2>'
            '<p>Hier staat nog geen inhoud. Dit onderdeel wordt binnenkort aangevuld.</p></div></main></div>'
            % (slug, BACK, titel, ICON[slug], titel))
leeg_html = ''.join(leeg(s, t) for s, t, o, klaar in ONDERDELEN if not klaar)

splash = ('<div id="splash"><div class="logo"></div><h1>Roadpol</h1><p>Hulpmiddel op de baan</p></div>')
fab = '<a id="fab" href="#top" aria-label="Naar boven">↑</a>'

css = rd('style.css').replace('{{LOGO}}', LOGO) + '''
#splash{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:radial-gradient(circle at 50% 38%,#2b5385,#1e3a5f 55%,#0e2038);color:#fff;transition:opacity .45s ease,visibility .45s}
#splash.out{opacity:0;visibility:hidden}
#splash .logo{width:132px;height:132px;border-radius:34px;animation:pop .7s cubic-bezier(.2,1.4,.4,1) both}
#splash h1{margin:0;font-size:36px;font-weight:800;letter-spacing:.4px;animation:rise .6s .15s both}
#splash p{margin:0;opacity:.75;letter-spacing:.5px;animation:rise .6s .3s both}
@keyframes rise{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:.9}}
'''

head = ('<!doctype html>\n<html lang="nl"><head><meta charset="utf-8">\n'
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  '<title>Roadpol</title><meta name="theme-color" content="#1e3a5f">'
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
  '<meta name="apple-mobile-web-app-title" content="Roadpol"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
  '<link rel="icon" type="image/png" sizes="64x64" href="%s"><link rel="apple-touch-icon" href="%s">'
  '<link rel="manifest" href="data:application/manifest+json,%s">\n<style>%s</style></head>\n' % (FAV, TOUCH, manifest, css))

body = ('<body id="top" data-v="home">' + splash + home + wegcode + alcohol + leeg_html + fab +
        '\n<script>' + rd('wegcode.js') + '</script>\n<script>' + rd('alcohol.js') + '</script>\n<script>' + rd('app.js') + '</script>\n</body></html>')

out = head + body
path = os.path.join(OUT, 'Roadpol.html')
open(path, 'w', encoding='utf-8').write(out)
print('OK', path, round(len(out) / 1024), 'KB')
