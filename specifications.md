# Connection Manager Chrome Extension – Technical Spec (v1.1)

_Last updated: 2025-08-15_

## 0) Überblick

- **Manifest:** MV3
- **Speicher:** IndexedDB (lokal, keine Cloud/Sync)
- **Zielseiten:** `https://*.linkedin.com/*`
- **Sprachen:** Deutsch (de), Englisch (en) – automatische Auswahl via `navigator.language`
- **Import/Export:** JSON (Replace)
- **Build:** Vite mit separaten Configs für Content Script und andere Teile

---

## 1) Projektstruktur (Aktualisiert)

```
/linkedin-connections
  ├─ public/
  │   ├─ manifest.json
  │   └─ options.html
  ├─ src/
  │   ├─ content/
  │   │   ├─ content.ts
  │   │   ├─ overlay.tsx
  │   │   ├─ dom-selectors.ts
  │   │   └─ url-normalizer.ts
  │   ├─ background/
  │   │   └─ service-worker.ts
  │   ├─ options/
  │   │   ├─ options.ts
  │   │   └─ options.css
  │   ├─ types/
  │   │   ├─ db/
  │   │   │   ├─ idb.ts
  │   │   │   └─ schema.ts
  │   │   ├─ i18n/
  │   │   │   ├─ locales.ts
  │   │   │   └─ t.ts
  │   │   └─ index.ts
  │   ├─ scoring/
  │   │   └─ scoring.ts
  │   ├─ styles/
  │   │   └─ shared.css
  │   └─ utils/
  │       ├─ time.ts
  │       └─ validate.ts
  ├─ package.json
  ├─ tsconfig.json
  ├─ vite.config.ts
  ├─ vite.content.config.ts
  └─ vite.others.config.ts
```

---

## 2) TypeScript-Interfaces (Aktualisiert)

```ts
// src/types/index.ts
export type Lang = "de" | "en";

export interface CategoryDef {
  id: string;
  label_de: string;
  label_en: string;
  value: number; // 0–100
  color: string; // CSS color value (hex, rgb, etc.) - NEU
}

export interface EventTypeDef {
  id: string;
  label_de: string;
  label_en: string;
}

export type DecayMode = "exponential" | "linear" | "off";

export interface DecaySettings {
  mode: DecayMode; // default: 'exponential'
  decayStartDays: number; // default: 21
  halfLifeDays: number; // default: 90 (nur relevant für exponential)
}

export interface Weights {
  categories: number; // sum to 1 with events + affinity
  events: number;
  affinity: number;
}

export interface ScoreBand {
  id: string;
  label_de: string;
  label_en: string;
  min: number; // inclusive
  max: number; // inclusive
}

export interface SettingsDoc {
  id: "default";
  lang: Lang; // derived at first run
  weights: Weights;
  decay: DecaySettings;
  categories: CategoryDef[];
  eventTypes: EventTypeDef[];
  scoreBands: ScoreBand[];
}

export interface ContactDoc {
  profileUrl: string; // canonical key
  displayName: string;
  categoryId: string; // exactly one
  affinity: number; // 0–100
  notes?: string;
  lastInteraction?: string; // ISO string (computed convenience)
}

export interface EventDoc {
  id: string; // uuid
  profileUrl: string; // FK
  typeId: string;
  timestamp: string; // ISO
  points: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface ExportBundleV1 {
  version: "1.0";
  settings: SettingsDoc;
  contacts: ContactDoc[];
  events: EventDoc[];
}
```

---

## 3) IndexedDB-Schema & Wrapper (Aktualisiert)

```ts
// src/types/db/schema.ts
export const DB_NAME = "li-notes";
export const DB_VERSION = 1;
export const STORES = {
  settings: "settings",
  contacts: "contacts",
  events: "events",
} as const;
```

```ts
// src/types/db/idb.ts (vollständig implementiert)
export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("contacts")) {
        const s = db.createObjectStore("contacts", { keyPath: "profileUrl" });
        s.createIndex("byName", "displayName", { unique: false });
        s.createIndex("byCategory", "categoryId", { unique: false });
      }
      if (!db.objectStoreNames.contains("events")) {
        const s = db.createObjectStore("events", { keyPath: "id" });
        s.createIndex("byProfileUrl", "profileUrl", { unique: false });
        s.createIndex("byTimestampDesc", "timestamp", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Vollständige API implementiert:
export async function getSettings(db: IDBDatabase): Promise<SettingsDoc>;
export async function putSettings(
  db: IDBDatabase,
  s: SettingsDoc
): Promise<void>;
export async function getContact(
  db: IDBDatabase,
  profileUrl: string
): Promise<ContactDoc | undefined>;
export async function putContact(db: IDBDatabase, c: ContactDoc): Promise<void>;
export async function listEventsFor(
  db: IDBDatabase,
  profileUrl: string
): Promise<EventDoc[]>;
export async function putEvent(db: IDBDatabase, ev: EventDoc): Promise<void>;
export async function deleteEvent(
  db: IDBDatabase,
  eventId: string
): Promise<void>;
```

---

## 4) Scoring-Engine (Aktualisiert)

```ts
// src/scoring/scoring.ts (vollständig implementiert)
export function decayFactor(ageDays: number, d: DecaySettings): number {
  if (d.mode === "off") return 1;
  if (ageDays <= d.decayStartDays) return 1;
  const x = ageDays - d.decayStartDays;
  if (d.mode === "exponential") return Math.pow(0.5, x / d.halfLifeDays);
  const span = 2 * d.halfLifeDays; // linear falloff
  return Math.max(0, 1 - x / span);
}

export function eventScore(
  events: EventDoc[],
  now: Date,
  decay: DecaySettings
): number {
  if (!events.length) return 0;
  const sum = events.reduce((acc, ev) => {
    const ageDays = Math.max(
      0,
      (now.getTime() - new Date(ev.timestamp).getTime()) / 86400000
    );
    const f = decayFactor(ageDays, decay);
    const pts01 = ev.points * 20; // 1..5 → 20..100
    return acc + pts01 * f;
  }, 0);
  // Verwendung von Summe statt Durchschnitt für mehr Interaktionen = höherer Score
  return Math.max(0, sum);
}

export function totalScore(
  categoryValue: number,
  eScore: number,
  affinity: number,
  w: Weights
): number {
  const total =
    w.categories * categoryValue + w.events * eScore + w.affinity * affinity;
  return Math.round(Math.max(0, Math.min(100, total)));
}
```

**UI-Breakdown (Textbeispiel):**

```
Gesamtscore = 0.2×Kategorie(60) + 0.1×Interaktionen(72) + 0.33×Empfinden(80) = 71
```

---

## 5) Content Script – Implementiert

```ts
// src/content/content.ts (vollständig implementiert)
// MutationObserver-basierte DOM-Überwachung mit Debouncing
// Automatische Bindung an Profile-Links mit data-li-notes-bound="1" Markierung
```

```ts
// src/content/dom-selectors.ts (erweitert)
// Erweiterte Selektoren für verschiedene LinkedIn-Kontexte:
// - Feed-Posts
// - Kommentare
// - Suchergebnisse
// - Verbindungen
// - Nachrichten
// - Benachrichtigungen
// - Profilseiten
```

```ts
// src/content/url-normalizer.ts (implementiert)
export function normalizeLinkedInProfileUrl(href: string): string | null {
  try {
    const u = new URL(href);
    if (!u.hostname.endsWith("linkedin.com")) return null;
    const m = u.pathname.match(/\/in\/([^/]+)\/?/);
    return m ? `https://www.linkedin.com/in/${m[1]}` : null;
  } catch {
    return null;
  }
}
```

```ts
// src/content/overlay.tsx (vollständig implementiert)
// Shadow DOM-basierte Overlay-Komponente mit:
// - Tooltip mit Score, Name, letzte Interaktion, Notiz-Vorschau
// - Drei Buttons: Interaktion +, Notiz +, Details
// - Vollständige Dialog-Implementierung für alle Aktionen
// - Kategorie-Farbverlauf als visueller Indikator
// - Invisible Bridge für bessere Hover-Erfahrung
```

**DOM-Integration:**

- `MutationObserver` auf `document.body` mit automatischer Bindung
- `data-li-notes-bound="1"` zur Vermeidung von Doppelbindung
- Intelligente Hover-Behandlung mit Bridge-Element

---

## 6) Options Page – Implementiert

```ts
// src/options/options.ts (vollständig implementiert)
// Vanilla JS-basierte Options-Seite mit:
// - Gewichte-Editor (Kategorien, Events, Empfinden)
// - Verfall-Einstellungen (Start, Halbwert, Modus)
// - Validierung der Gewichte-Summe = 1
// - Erfolgs-/Fehlermeldungen
```

**Features:**

- Live-Validierung der Gewichte-Summe
- Speichern mit Feedback
- Automatisches Löschen von Erfolgsmeldungen nach 3 Sekunden

---

## 7) Import/Export & Validierung (Implementiert)

```ts
// src/utils/validate.ts (implementiert)
export function validateBundleJson(
  anyJson: unknown
): { ok: true; data: ExportBundleV1 } | { ok: false; errors: string[] } {
  // Grundlegende JSON-Validierung
  // Versionsprüfung ("1.0")
  // Pflichtfelder-Prüfung (settings, contacts, events)
}
```

**Import (Replace) Ablauf:**

1. JSON lesen → validieren → `version` prüfen ("1.0")
2. DB leeren (`contacts`, `events`, `settings`)
3. Schreiben: `settings` → `contacts` → `events`
4. `lastInteraction` pro Kontakt berechnen (max Timestamp je Profil)

---

## 8) Manifest (Aktualisiert)

```json
{
  "manifest_version": 3,
  "name": "Connection Manager",
  "version": "1.0.0",
  "description": "Lokale Zusatzinfos & Score für LinkedIn-Kontakte (IndexedDB, JSON Import/Export)",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://*.linkedin.com/*"],
  "background": {
    "service_worker": "src/background/service-worker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://*.linkedin.com/*"],
      "js": ["src/content/content.js"],
      "run_at": "document_idle"
    }
  ],
  "options_page": "options.html",
  "web_accessible_resources": [
    {
      "resources": ["src/styles/shared.css"],
      "matches": ["https://*.linkedin.com/*"]
    }
  ]
}
```

---

## 9) i18n – Implementiert

```ts
// src/types/i18n/locales.ts (implementiert)
export const LOCALES = {
  de: {
    score: "Gesamtscore",
    lastInteraction: "Letzte Interaktion",
    addInteraction: "Interaktion +",
    addNote: "Notiz +",
    details: "Details",
    category: "Kategorie",
    affinity: "Empfinden",
    // ... weitere Übersetzungen
  },
  en: {
    score: "Total score",
    lastInteraction: "Last interaction",
    addInteraction: "Interaction +",
    addNote: "Note +",
    details: "Details",
    category: "Category",
    affinity: "Affinity",
    // ... weitere Übersetzungen
  },
} as const;

export function getLang(): Lang {
  const l = (navigator.language || "de").toLowerCase();
  return l.startsWith("de") ? "de" : "en";
}

export function t(key: keyof (typeof LOCALES)["de"]): string {
  const lang = getLang();
  return LOCALES[lang][key] ?? String(key);
}
```

---

## 10) Build-System (NEU)

```ts
// vite.config.ts (Hauptkonfiguration)
// Build für Background Service Worker und Options Page
// ES-Module Format
// Alias-Konfiguration für bessere Imports

// vite.content.config.ts (Content Script)
// IIFE Format für Content Script
// Separate Build-Pipeline für Content Script
// CSS-Extraktion zu shared.css
```

**Build-Skripte:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && npm run build:content && npm run build:others",
    "build:content": "vite build --config vite.content.config.ts",
    "build:others": "vite build --config vite.others.config.ts"
  }
}
```

---

## 11) Default-Daten (Aktualisiert)

```ts
export const DEFAULT_SETTINGS: SettingsDoc = {
  id: "default",
  lang: "de",
  weights: { categories: 0.2, events: 0.1, affinity: 0.33 }, // Aktualisierte Gewichte
  decay: { mode: "exponential", decayStartDays: 21, halfLifeDays: 90 },
  categories: [
    {
      id: "business",
      label_de: "Geschäftsbeziehung",
      label_en: "Business relationship",
      value: 80,
      color: "#28a745", // Grün
    },
    {
      id: "colleague",
      label_de: "Kollege",
      label_en: "Colleague",
      value: 60,
      color: "#007bff", // Blau
    },
    {
      id: "acquaintance",
      label_de: "Bekanntschaft",
      label_en: "Acquaintance",
      value: 40,
      color: "#ffc107", // Gelb/Orange
    },
  ],
  eventTypes: [
    { id: "meeting", label_de: "Treffen", label_en: "Meeting" },
    { id: "call", label_de: "Telefonat", label_en: "Call" },
    { id: "lunch", label_de: "Mittagessen", label_en: "Lunch" },
  ],
  scoreBands: [
    { id: "weak", label_de: "Schwach", label_en: "Weak", min: 0, max: 24 },
    { id: "low", label_de: "Gering", label_en: "Low", min: 25, max: 49 },
    { id: "medium", label_de: "Mittel", label_en: "Medium", min: 50, max: 74 },
    { id: "strong", label_de: "Stark", label_en: "Strong", min: 75, max: 89 },
    {
      id: "vstrong",
      label_de: "Sehr stark",
      label_en: "Very strong",
      min: 90,
      max: 100,
    },
  ],
};
```

---

## 12) Implementierte Features

### ✅ Vollständig implementiert:

- **IndexedDB-Schema** mit allen Stores und Indizes
- **Scoring-Engine** mit Decay-Funktionen
- **Content Script** mit DOM-Erkennung und Overlay
- **URL-Normalisierung** für LinkedIn-Profile
- **Options Page** für Gewichte und Verfall-Einstellungen
- **i18n-System** mit automatischer Sprachauswahl
- **Build-System** mit Vite und separaten Configs
- **Validierung** für Import/Export
- **Shadow DOM Overlay** mit vollständiger UI
- **Event-Management** (Hinzufügen, Löschen)
- **Notiz-System** für Kontakte
- **Kategorie-Farben** als visuelle Indikatoren

### 🔄 Teilweise implementiert:

- **Import/Export UI** (Validierung vorhanden, UI fehlt)
- **Erweiterte Options** (Kategorien, Event-Typen, Score-Bands)

### ❌ Noch nicht implementiert:

- **Background Service Worker** (Datei vorhanden, aber leer)
- **Erweiterte A11y-Features**
- **Keyboard-Shortcuts**
- **Performance-Optimierungen**

---

## 13) Nächste Schritte (Aktualisiert)

1. **✅ Bootstrap**: Build-Pipeline, Manifest, Icons, Content Script
2. **✅ DB & Seeding**: `openDb`, Stores, Default-Settings
3. **✅ Scoring**: Implementiert + Debug-Logging
4. **✅ DOM-Erkennung**: Selektoren & Normalizer + Hover-Bindings
5. **✅ Overlay**: Shadow DOM Tooltip + Detail-Card
6. **✅ Options Page**: Grundlegende Settings-Editoren
7. **🔄 Polish**: A11y, i18n, Edge-Cases, Performance
8. **🔄 QA**: Manuelle Tests auf typischen LinkedIn-Seiten

**Priorität für nächste Iteration:**

- Import/Export UI in Options Page
- Background Service Worker (falls benötigt)
- Erweiterte Options-Editoren (Kategorien, Event-Typen)
- Performance-Optimierungen
- Umfassende Tests

---

## 14) Technische Details

### Build-System:

- **Vite** als Build-Tool
- **TypeScript** für Typsicherheit
- **Separate Configs** für Content Script (IIFE) und andere Teile (ES)
- **Alias-System** für saubere Imports

### Performance:

- **MutationObserver** mit effizienter DOM-Überwachung
- **Debouncing** für Hover-Events
- **Lazy Loading** von Overlay-Komponenten
- **Shadow DOM** für Style-Isolation

### UX-Features:

- **Invisible Bridge** für bessere Hover-Erfahrung
- **Kategorie-Farbverlauf** als visueller Indikator
- **Responsive Overlay-Positionierung**
- **Automatische Namens-Extraktion** aus LinkedIn-DOM

---

## 15) Offene Punkte (für später)

- **Import/Export UI**: Vollständige Implementierung in Options Page
- **Background Service Worker**: Falls für zukünftige Features benötigt
- **Erweiterte Options**: CRUD für Kategorien, Event-Typen, Score-Bands
- **Performance-Monitoring**: Metriken für Overlay-Rendering
- **A11y-Verbesserungen**: Keyboard-Navigation, Screen Reader Support
- **Reminder-Funktion**: Lokale Erinnerungen für Kontakte
- **Kontextmenü**: Rechtsklick-Integration
- **Badge-Anzeige**: Direkte DOM-Integration neben Namen
