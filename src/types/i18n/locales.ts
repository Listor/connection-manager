import type { Lang } from "../index";

export const LOCALES = {
  de: {
    score: "Gesamtscore",
    lastInteraction: "Letzte Interaktion",
    addInteraction: "Interaktion +",
    addNote: "Notiz +",
    details: "Details",
    category: "Kategorie",
    affinity: "Empfinden",
    import: "Importieren",
    export: "Exportieren",
    weights: "Gewichte",
    decay: "Verfall",
    formulaPreview: "Formel-Vorschau",
    weak: "Schwach",
    low: "Gering",
    medium: "Mittel",
    strong: "Stark",
    vstrong: "Sehr stark",
  },
  en: {
    score: "Total score",
    lastInteraction: "Last interaction",
    addInteraction: "Interaction +",
    addNote: "Note +",
    details: "Details",
    category: "Category",
    affinity: "Affinity",
    import: "Import",
    export: "Export",
    weights: "Weights",
    decay: "Decay",
    formulaPreview: "Formula preview",
    weak: "Weak",
    low: "Low",
    medium: "Medium",
    strong: "Strong",
    vstrong: "Very strong",
  },
} as const;

export function getLang(): Lang {
  const l = (navigator.language || "de").toLowerCase();
  return l.startsWith("de") ? "de" : "en";
}

export function t(key: keyof (typeof LOCALES)["de"]): string {
  const lang = getLang();
  // @ts-ignore
  return LOCALES[lang][key] ?? String(key);
}
