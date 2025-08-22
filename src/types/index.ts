export type Lang = "de" | "en";

export interface CategoryDef {
  id: string;
  label_de: string;
  label_en: string;
  value: number; // 0–100
  color: string; // CSS color value (hex, rgb, etc.)
  emoticon: string; // Emoticon icon for the category
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
  halfLifeDays: number; // default: 90 (nur für exponential)
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
  min: number;
  max: number;
}

export interface SettingsDoc {
  id: "default";
  lang: Lang;
  weights: Weights;
  decay: DecaySettings;
  categories: CategoryDef[];
  eventTypes: EventTypeDef[];
  scoreBands: ScoreBand[];
  anonymousMode: boolean; // default: false
}

export interface ContactDoc {
  profileUrl: string; // canonical key
  displayName: string;
  categoryId: string; // exactly one
  affinity: number; // 0–100
  notes?: string;
  lastInteraction?: string; // ISO
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
