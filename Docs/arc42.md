# arc42 Architekturdokumentation — Planet Simulation

> Dieses Dokument folgt dem [arc42](https://arc42.de/)-Template (12 Kapitel) und beschreibt die Architektur des
> Projekts "Planet Simulation" (Prüfungsprojekt Modul Fortgeschrittene Programmierung). Es fasst die vorhandene,
> über `Docs/` verteilte Dokumentation (ADRs, SPECs, Guides, Definitions of Done) konsolidiert zusammen und
> verlinkt bei Bedarf auf die Detaildokumente statt sie zu duplizieren.
>
> **Team**: Gemmingen, Müller, Tsigaropoulos · **Jira-Projekt**: FP · **Stand**: 2026-08-14

---

## 1. Einführung und Ziele

### 1.1 Aufgabenstellung

Die Planet Simulation ist eine browserbasierte, interaktive 2D-Simulation für gravitative Mechanik (Zwei- bzw.
Dreikörperproblem). Sie richtet sich an Studierende und physikinteressierte Hobbyanwender:innen, die
Planetenbahnen und Gravitationskräfte in Echtzeit erkunden möchten, ohne dass träge, JavaScript-basierte
Simulationen die Interaktion ausbremsen.

Aus dem Projekt-README (`README.md`):

> Existing JavaScript-based physics simulations are slow and difficult to extend. Students and hobbyist
> astronomers need a fluid, responsive tool to explore gravitational interactions in real-time.

Die Lösung: Ein Browser-Sandbox, in dem Nutzer:innen Massen und Startbedingungen interaktiv verändern,
Gravitationskräfte und Bahnen visualisieren und dabei durchgehend 60 FPS erleben — durch Auslagerung der
Physik-Berechnung nach Rust/WebAssembly.

### 1.2 Qualitätsziele

Priorisierte Qualitätsziele (aus README, `testing-philosophy.md` und SPEC-001):

| Priorität | Qualitätsziel | Konkretisierung |
|---|---|---|
| 1 | **Performance** | Durchgehend ~60 FPS im Browser, keine GC-Stotterer während der Simulation |
| 2 | **Korrektheit der Physik** | Numerisch stabile Integration (Energieerhaltung, siehe `physics-guide.md`) |
| 3 | **Wartbarkeit** | Harte 200-Zeilen-Grenze pro Datei, klare Modulgrenzen, hohe Testabdeckung |
| 4 | **Nachvollziehbarkeit** | Spec-getriebener Workflow (SPEC → Test → Implementierung → Review) |
| 5 | **Erlernbarkeit** | Verständliche UI für Studierende (Presets, Parametersteuerung, i18n) |

### 1.3 Stakeholder

| Rolle | Erwartungshaltung |
|---|---|
| Studierende / Endnutzer:innen | Intuitive, performante Simulation zum Experimentieren mit Orbits |
| Team (Gemmingen, Müller, Tsigaropoulos) | Wartbare, spec-getriebene Codebasis für die Prüfungsleistung |
| Lehrende / Prüfer:innen | Nachvollziehbare Architektur- und Entscheidungsdokumentation (ADRs, arc42, SPECs) |

---

## 2. Randbedingungen

### 2.1 Technische Randbedingungen

- **Monorepo**: `frontend/` (TypeScript/React) + `wasm/` (Rust) + `Docs/` (siehe SPEC-001).
- **Zielplattform**: moderner Browser mit WebAssembly-Unterstützung, keine Server-seitige Physik.
- **Node-Version**: gepinnt via `.nvmrc` (Node 25); **Rust**: `stable`-Toolchain via `.rust-toolchain.toml`.
- **Harte 200-Zeilen-Grenze** pro Quelldatei (TS/Rust/Docs), durchgesetzt via ESLint `max-lines` /
  Clippy `too-many-lines-threshold`, Ausnahmen nur über `max-lines-exceptions.json`.
- **64-Bit-Fließkommazahlen** für physikalische Präzision (siehe `physics-guide.md`).

### 2.2 Organisatorische Randbedingungen

- Prüfungsprojekt mit festem Team (3 Personen), Vorgehen spec-getrieben (SPEC-XXX-Dateien in
  `Docs/Management/Project-Management/Specs/`).
- Commit-Konventionen: Conventional Commits mit Scopes (`wasm`, `ui`, `physics`, `perf`, `build`, `docs`);
  Branch-Präfixe `feature/`, `fix/`, `docs/`, `refactor/`, `chore/` (siehe SPEC-001, ADR-003).
- CI/CD über GitHub Actions.

### 2.3 Konventionen

- **Projektsprache Code/Docs**: Englisch (ADR-001) — dieses arc42-Dokument ist eine bewusste deutschsprachige
  Ausnahme für die Prüfungsdokumentation.
- Doku-Konventionen: siehe `Docs/Guides/documentation-conventions.md`.
- Architekturentscheidungen werden als ADRs unter `Docs/ADRs/` festgehalten (Kontext → Optionen → Entscheidung).

---

## 3. Kontextabgrenzung

### 3.1 Fachlicher Kontext

```text
┌───────────────────┐        Mausklicks, Slider,        ┌───────────────────────────┐
│  Nutzer:in         │────────Presets, Sandbox-Edits────▶│   Planet Simulation (App)  │
│ (Browser)          │◀───────Canvas-Rendering, State────│                            │
└───────────────────┘                                    └───────────────────────────┘
```

Die Anwendung hat **keine externen Systeme** im Sinne von Drittanbieter-APIs oder Datenbanken — sie ist eine
vollständig client-seitige Single-Page-Anwendung. Einzige "externe" Abhängigkeit zur Laufzeit ist der Browser
selbst (WebAssembly-Runtime, Canvas API).

### 3.2 Technischer Kontext

```text
┌──────────────────────────────────────────┐
│           Browser (Client)                │
│  ┌─────────────────────────────────────┐  │
│  │   React UI (TypeScript)              │  │
│  │   Components, Hooks, Canvas          │  │
│  └───────────────┬───────────────────────┘  │
│                  │ WASM-Bindgen Bridge      │
│                  │ (SimulatorBridge)        │
│  ┌───────────────▼───────────────────────┐  │
│  │   Physik-Engine (Rust → WASM)        │  │
│  │   Newton'sche Gravitation, Verlet-   │  │
│  │   Integrator                          │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

Ausgeliefert wird die Anwendung als statisches Bundle (Vite-Build) in einem Docker-Container (siehe Kapitel 7).

---

## 4. Lösungsstrategie

Kernentscheidungen, die die Architektur prägen (Details siehe `Docs/ADRs/`):

1. **Hybrid Rust/WASM + React**: Physik-intensive Berechnungen sind zustandslos in Rust implementiert und nach
   WebAssembly kompiliert (Performance-Qualitätsziel), UI-Zustand und Rendering bleiben in React/TypeScript
   (Produktivität, Ökosystem). Begründung siehe `Docs/Guides/architecture.md`.
2. **Unidirektionaler Datenfluss**: `User Input → React State → SimulatorBridge.step(dt) → WASM → StepResult →
   Canvas`. Kein bidirektionaler Zustand zwischen JS und WASM — die WASM-Seite ist pro Aufruf zustandslos
   bezüglich UI-Belangen, der volle Simulationszustand wird explizit über `setState`/`step` ausgetauscht.
3. **Spec-getriebener Entwicklungsprozess**: Jedes Feature beginnt mit einer SPEC (Akzeptanzkriterien), gefolgt
   von TDD (Rot → Grün → Refactor), siehe `architecture.md` Abschnitt "Adding a New Feature".
4. **Colocated Components** (ADR-003): Jede Komponente ist ein Ordner mit Implementierung und Tests
   nebeneinander, statt getrennter `components/` und `tests/`-Bäume.
5. **Zwei Simulationsmodi** (`3body`/Preset vs. `sandbox`): Preset-Modus nutzt feste physikalische Rollen
   (`primary`, `secondary`, `testParticle`); Sandbox-Modus verwaltet eine flexible Liste editierbarer Körper
   (`sandboxBodies`). Diese bewusste Trennung ist Quelle mehrerer UI-Constraints (z. B. FP-39: Bearbeiten ist
   nur im Sandbox-Modus sinnvoll, da nur dort ein editierbares Datenmodell existiert).
6. **Harte Qualitäts-Gates in CI**: 200-Zeilen-Limit, ESLint/Clippy strict, `fallow` (Unused-Code/Complexity),
   Coverage-Ziele — Wartbarkeit wird technisch statt nur organisatorisch erzwungen (SPEC-001).

---

## 5. Bausteinsicht

### 5.1 Whitebox Gesamtsystem

```text
Planet Simulation (Monorepo)
├── frontend/   — Vite + React + TypeScript SPA
├── wasm/       — Rust-Physik-Engine, kompiliert zu WebAssembly
└── Docs/       — Architektur-/Prozessdokumentation, Specs, ADRs
```

### 5.2 Ebene 1 — Frontend (`frontend/src/`)

| Baustein | Verantwortung |
|---|---|
| `components/` | Visuelle React-Komponenten (z. B. `Canvas`, `SimulationShell`, `BodyEditDialog`, `BodyPlacementDialog`, `BodyContextMenu`, `ParameterControls`) |
| `context/` | Globaler Simulationszustand: `SimulationProvider`, `useSandbox` (Sandbox-Körper-Verwaltung), `useTrailHistory`, `presets.ts` (Earth-Moon/Binary-Stars), `I18nContext` |
| `hooks/` | Wiederverwendbare Logik: `useSimulation`, `useSimulationStep`, `useSimulationControls`, `useCanvasInteraction` (Maus-/Kontextmenü-Interaktion), `useAnimationFrame` |
| `services/` | `wasmBridge.ts` (Wrapper um die WASM-`Simulator`-Instanz), `wasm.ts` (asynchroner Loader), `CanvasRenderer.ts` (2D-Rendering-Pipeline), `canvasHelpers.ts` |
| `types/` | Domänentypen (`SimulationMode`, `SandboxBody`, physikalische Typen) |
| `utils/` | Reine Hilfsfunktionen (z. B. `calculateOrbitalVelocity`) |
| `i18n/` | Übersetzungstabellen (de/en) |

Die zentrale Zustandsverwaltung läuft über `SimulationProvider` (`context/SimulationProvider.tsx`), der per
React Context (`SimulationContext`) allen Komponenten `currentState`, `mode`, `sandboxBodies` sowie Aktionen
(`updateBody`, `addBody`, `removeBody`, `setMode`, `setPreset`, …) bereitstellt.

### 5.3 Ebene 1 — Physik-Engine (`wasm/src/`)

| Baustein | Verantwortung |
|---|---|
| `lib.rs` | Re-Export der öffentlichen WASM-Bindings |
| `physics/types.rs` | Kernstrukturen: `Body`, `State`, `PhysicsConfig` |
| `physics/gravity.rs` | Newton'sches Gravitationsgesetz, Lagrange-Punkt-Berechnung |
| `physics/integrator.rs` | Symplektischer Velocity-Verlet-Integrator |
| `wasm/mod.rs` | `Simulator`-Wrapper-Klasse, exponiert Methoden (`step`, `setState`, `getLagrangePoints`) an JavaScript |

### 5.4 Abhängigkeitsgraph (Feature-Ebene)

Der vollständige Feature-Abhängigkeitsgraph (SPEC-001…SPEC-017) ist in `Docs/Guides/architecture.md#dependency-graph`
dokumentiert und wird hier nicht dupliziert.

---

## 6. Laufzeitsicht

### 6.1 Simulationsschritt (Standardfall)

```text
1. Nutzer:in startet/pausiert Simulation oder ändert Parameter (UI)
2. Animation-Loop (Ziel: 60 FPS) ruft SimulatorBridge.step(dt) auf
3. Bridge übergibt dt (Sekunden) an den Rust-Simulator
4. Rust: Velocity-Verlet-Integrator aktualisiert Positionen/Geschwindigkeiten/Zeit
5. Neuer Zustand wird als StepResult (inkl. Systemenergie) nach JS serialisiert
6. SimulationProvider.handleStep reichert Körper an (enrichBodies: id/name/color/locked
   aus sandboxBodies bzw. synthetische ids im Preset-Modus) und setzt currentState
7. CanvasRenderer zeichnet primary/secondary/testParticle bzw. sandboxBodies neu
```

### 6.2 Objekt bearbeiten (Sandbox-Modus)

```text
1. Rechtsklick auf Körper → useCanvasInteraction.handleContextMenu (nur wenn mode === 'sandbox', s. FP-39)
2. BodyContextMenu → "Edit" → BodyEditDialog öffnet mit aktuellem SandboxBody
3. Bestätigung → Canvas.onEditConfirm → updateBody(id, updates)
4. useSandbox.updateBody mappt sandboxBodies, merged updates für passende id
5. commitSandboxBodies schreibt state in React (setSandboxBodies/setCurrentState)
   und synchron in den laufenden Simulator (simulator.setState)
```

### 6.3 Moduswechsel (Preset ↔ Sandbox)

```text
1. setMode('sandbox') → useSandbox.setMode befüllt sandboxBodies aus dem aktuellen
   currentState (primary/secondary/testParticle → drei SandboxBody-Einträge)
2. setMode('3body') → sandboxBodies bleibt/wird geleert; Physik läuft auf den festen
   primary/secondary/testParticle-Feldern weiter
```

---

## 7. Verteilungssicht

- Container via Docker Compose, Alpine-Nginx-Image.
- CI/CD über GitHub Actions. Workflows: `test.yml`, `deploy-docs.yml`, `docs.yml`, `release.yml`,
  `security.yml` (`.github/workflows/`).

---

## 8. Querschnittliche Konzepte

### 8.1 Physikmodell

Klassische Newton'sche Mechanik (Zweikörper- bzw. eingeschränktes Dreikörperproblem), 64-Bit-Präzision,
symplektischer Velocity-Verlet-Integrator zur Energieerhaltung. Vollständige Herleitung, Formeln und
Einheiten: `Docs/Guides/physics-guide.md`.

### 8.2 Internationalisierung (i18n)

UI-Texte sind über `I18nContext`/`frontend/src/i18n/translations.ts` in Deutsch und Englisch verfügbar
(`LanguageSelector`-Komponente).

### 8.3 Teststrategie

Testpyramide mit Schwerpunkt Unit-Tests (~90 %) und Integrationstests (~10 %) für WASM-Bridge und
Canvas-Rendering. Coverage-Ziel: 100 % für Physik-Kernlogik, >80 % für Frontend-Hooks/Utils. Details:
`Docs/Guides/testing/testing-philosophy.md`, `testing-best-practices.md`, `unit-testing.md`.
E2E-Abdeckung (Playwright) ist mit FP-42 umgesetzt (siehe Testberichte unter
`Docs/Guides/testing/reports/`).

### 8.4 Code-Qualität & Wartbarkeit

- Harte 200-Zeilen-Grenze je Datei (ESLint `max-lines` / Clippy-Threshold), Ausnahmen nur via
  `max-lines-exceptions.json`.
- `fallow` (Frontend) und `cargo-udeps`/`cargo-modules orphans` (Rust) als Checks gegen toten Code,
  unnötige Komplexität und Duplikation (`npm run check:quality`).
- ESLint/Prettier/Stylelint/Clippy/`cargo fmt` als verbindliche Formatierungs-/Lint-Gates.
- Vollständiges Regelwerk: SPEC-001.

### 8.5 Fehlerbehandlung

WASM-Aufrufe (`simulator.setState`, `getLagrangePoints`) sind defensiv mit `try/catch` umschlossen und loggen
statt zu werfen, um die UI bei transienten Fehlern nicht abstürzen zu lassen (siehe `SimulationProvider.tsx`).

---

## 9. Architekturentscheidungen

Entscheidungen werden als ADRs (Kontext → Optionen → Entscheidung) unter `Docs/ADRs/` geführt:

| ADR | Entscheidung |
|---|---|
| [ADR-001](./ADRs/ADR-001-project-language.md) | Projektsprache: Englisch (Code & Standarddokumentation) |
| [ADR-003](./ADRs/ADR-003-colocated-files.md) | Colocated Components (Implementierung + Tests im selben Ordner) |

Feature-/Architektur-Spezifikationen mit detaillierten Entscheidungen zu Umsetzung und Akzeptanzkriterien:
`Docs/Management/Project-Management/Specs/SPEC-001` bis `SPEC-017` (siehe Abhängigkeitsgraph in Kapitel 5.4).

---

## 10. Qualitätsanforderungen

### 10.1 Qualitätsbaum (Auszug)

```text
Qualität
├── Performance
│   └── 60 FPS Rendering, keine GC-Jank während Simulation
├── Korrektheit
│   ├── Physikalische Invarianten (Energieerhaltung < 0.1 % Abweichung bei Kreisbahnen)
│   └── Deterministisches Verhalten pro Modus (Preset vs. Sandbox)
├── Wartbarkeit
│   ├── 200-Zeilen-Limit je Datei
│   └── Klare Modulgrenzen Frontend/WASM
└── Bedienbarkeit
    ├── Verständliche Einheiten (→ FP-34)
    └── Konsistentes Styling (→ FP-44)
```

### 10.2 Qualitätsszenarien

| Szenario | Erwartetes Verhalten |
|---|---|
| Nutzer:in ändert Massen-Slider während laufender Simulation | Physik reagiert ohne Neustart, Trail bleibt erhalten (siehe `SimulationProvider` Kommentar zu Trail-Reset) |
| Nutzer:in bearbeitet einen Sandbox-Körper | Änderung wird sofort persistiert und im nächsten Simulationsschritt übernommen (Regressionsschutz: `Canvas.test.tsx`, FP-39) |
| Nutzer:in bearbeitet einen Körper im Preset-Modus | Kontextmenü ist deaktiviert, da Preset-Rollen kein editierbares Datenmodell besitzen (FP-39) |
| Referenz-Kreisbahn simuliert über N Schritte | Energieabweichung < 0.1 % (Physik-Referenztest, DOD-Physics-WASM) |

Vollständige Kriterien je Feature: `Docs/Management/Project-Management/Definitions of Done/`.

---

## 11. Risiken und technische Schulden

| Risiko / Schuld | Beschreibung | Bezug |
|---|---|---|
| Implizite Modus-Kopplung | UI war nicht gegen `mode` abgesichert, obwohl `sandboxBodies` nur im Sandbox-Modus existiert (Ursache von FP-39). Ähnliches kann anderswo fortbestehen. | FP-39 |
| Einheiten-Lesbarkeit | Physikalische Rohwerte (z. B. `6.371e6` m) werden UI-seitig teils unformatiert dargestellt, was die Interpretierbarkeit für Studierende einschränkt. | FP-34 |
| Uneinheitliches Styling | Kein zentral geprüftes Styling-System; Inline-Styles (z. B. `BodyContextMenu.tsx`) und Komponenten-Styles sind nicht durchgängig konsolidiert. | FP-44 |
| Sandbox-Objekterstellung (Placement-Flow) | Der aktuelle Objekt-Erstellungs-Flow im Sandbox-Modus gilt als reworkbedürftig (UX). | FP-38 |
| Fehlendes Objekt-Tracking/Miniview | Es existiert aktuell keine Möglichkeit, einzelne Objekte gezielt zu verfolgen oder in einer fokussierten Miniansicht zu betrachten. | FP-36, FP-37 |
| Fehlendes Favicon | Kein Branding-Favicon vorhanden. | FP-33 |

Dieses Kapitel wird bei Bearbeitung der referenzierten Tickets aktualisiert.

---

## 12. Glossar

| Begriff | Bedeutung |
|---|---|
| **Preset-Modus** (`mode: '3body'`) | Modus mit festen physikalischen Rollen `primary`, `secondary`, `testParticle`, initialisiert über Presets (`earth-moon`, `binary-stars`) |
| **Sandbox-Modus** (`mode: 'sandbox'`) | Modus mit einer flexiblen, nutzerdefinierten Liste von Körpern (`sandboxBodies`), die hinzugefügt, bearbeitet, gelöscht und gesperrt werden können |
| **SandboxBody** | Datentyp für einen editierbaren Körper im Sandbox-Modus (`id`, `position`, `velocity`, `mass`, `radius`, `color`, `name`, `locked`) |
| **SimulatorBridge** | TypeScript-Wrapper um die WASM-`Simulator`-Instanz; kapselt `step`, `setState`, `getLagrangePoints` |
| **StepResult** | Von der Physik-Engine nach jedem `step(dt)`-Aufruf zurückgegebener, serialisierter Zustand (Positionen, Geschwindigkeiten, Energie) |
| **Velocity-Verlet-Integrator** | Symplektisches numerisches Integrationsverfahren zur Lösung der Bewegungsgleichungen mit guter Langzeit-Energieerhaltung |
| **Lagrange-Punkte** | Gleichgewichtspunkte im eingeschränkten Dreikörperproblem, berechnet in `physics/gravity.rs` |
| **Trail** | Visualisierte Bahnspur eines Körpers über die letzten N Simulationsschritte (`useTrailHistory`) |
| **SPEC** | Feature-Spezifikation mit User Story und Akzeptanzkriterien unter `Docs/Management/Project-Management/Specs/` |
| **ADR** | Architecture Decision Record — dokumentierte Architekturentscheidung unter `Docs/ADRs/` |
| **DoD** | Definition of Done — verbindliche Fertigstellungskriterien je Bereich (`Docs/Management/Project-Management/Definitions of Done/`) |
