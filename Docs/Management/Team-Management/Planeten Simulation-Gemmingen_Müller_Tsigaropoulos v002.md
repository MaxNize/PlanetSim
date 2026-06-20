# Nutzer, Prozess, Pain & Kontext

## Nutzer-Segment
- Schüler und Studierende im MINT-Bereich (Physik/Astronomie).
- Hobby-Astronomen und Physik-Interessierte.

## Prozess
- Experimentieren mit physikalischen Parametern (Masse und Abstand) (alles in 2D)
- Visualisierung von Gravitationskräften und Planetenbahnen.

## Nutzer‑Pain
- Simulation in JS ist ruckelig und langsam (<https://github.com/ben9583/solar-sim>)
- Bestehende Projekte sind schwer erweiterbar

# Lösung – Fachliche Idee
Wir bauen eine hoch performante 2D Web-Simulation für zwei Planeten, die es Schülern ermöglicht, interaktiv und flüssig Planetenkonstellationen im Browser zu erforschen. (Sollten Kapazitäten
übrigbleiben   hinarbeiten zum Sandbox-Modus)

## Lösungsidee (falls vorhanden)
- Eine interaktive Sandbox, in der Himmelskörper platziert werden können.
- Echtzeit-Berechnung der Gravitationsvektoren mittels Rust.
- Nahtlose Integration der Berechnungslogik in eine moderne Web-Oberfläche via WASM.

# Softwareprodukt/-projekt

## Produkt / Projekt
- 2-Body-Simulation: Berechnung der Interaktion zwischen 2 Körpern.
-> (wenn Kapazität übrig ist) Sandbox-Mode: Hinzufügen/Entfernen von Planeten per Mausklick.
- Parameter-Steuerung: Echtzeit-Anpassung von Masse und Zeitfluss.
- Visualisierung: Anzeige von Trajektorien (Bahnen). (Wenn Kapazität übrig ist)

## Integration Web-Anwendung & Systemnahe Programmierung
- Rust-Backend wird als .wasm Modul kompiliert.
- JavaScript/TypeScript übernimmt das DOM-Handling und die UI (Buttons, Slider).
- Kommunikation über einen Shared Memory Buffer

## Softwareeigenschaften
- Präzision: Nutzung von 64-Bit Floats für physikalische Genauigkeit.
- Portabilität: Läuft in jedem modernen Browser ohne Installation.
- Skalierbarkeit: Architektur erlaubt spätere Erweiterung (z.B. Kollisionserkennung).
# Fokus Web-Anwendung
- Canvas-API oder WebGL zur flüssigen Darstellung der berechneten Daten.
- State-Management zur Synchronisation zwischen UI und WASM-Instanz.

# Fokus Systemnahe Programmierung
- Mathematische Modellierung der Gravitation
- Effizientes Speichermanagement in Rust
- Optimierung der Berechnungsschleifen (Iteratoren, ggf. SIMD).

# Notwendigkeit für / Nutzen von systemnaher Programmierung
- Rechenintensität: Newtonsche Mechanik erfordert bei vielen Objekten $O(n^2)$ Berechnungen pro Frame.
- Vorhersagbarkeit: Vermeidung von "Jank" (Rucklern) durch JavaScripts Garbage Collector.
- Typsicherheit: Minimierung von Laufzeitfehlern bei komplexen mathematischen Operationen.

# KI-driven Engineering & Prozess
- Spec-Driven: Spec erstellen in Zusammenarbeit mit KI -> Tests erstellen aus Spec  mit KI-> Implementieren aus Spec mit KI -> Tests ausführen und beheben mit KI -> manuelles nachtesten
- Copilot-Pairing: Nutzung von KI zur Generierung von Boilerplate für die JS/Rust-Bridge (wasm-bindgen).
- Automatisierte Tests: KI-gestützte Erstellung von Unit-Tests für die Physik-Engine.

# Tech-Stack

## Web
- React (als frontend Framework)
- TypeScript (für typsichere UI-Logik).
- Vite (als schneller Build-Tool).
- Canvas API (für das Rendering).

## Rust
- wasm-bindgen (Kommunikation zwischen Rust und JS).
- web-sys (Zugriff auf Web-APIs aus Rust).
- nalgebra oder cgmath (für effiziente Vektorrechnung).
- serde (für die Serialisierung von Konfigurationsdaten).
