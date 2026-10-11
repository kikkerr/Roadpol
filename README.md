# Roadpol (Android + HTML)

Eén HTML-bestand (`Roadpol.html`) dat zowel in de Android-app als gewoon in een browser (ook iOS) werkt.

## Inhoud aanpassen
1. Pas bestanden aan in `html-bron/src/` (alcohol.html / alcohol.js voor Alcohol, wegcode.html voor Wegcode, style.css voor de opmaak).
2. `python3 html-bron/bouw_html.py` > resultaat: `html-bron/dist/Roadpol.html`.
3. Kopieer dat bestand naar `app/src/main/assets/index.html`, verhoog `versionCode` in `app/build.gradle` en upload naar GitHub.
   De APK wordt automatisch gebouwd (tabblad Actions > artifact "Roadpol-apk").

## Handtekening
`app/roadpol.keystore` is de vaste sleutel van de app. Bewaar hem: zo installeert elke nieuwe versie over de vorige heen.
