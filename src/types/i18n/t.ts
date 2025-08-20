import type { Lang } from "../index";
import { LOCALES } from "./locales";

export function t(lang: Lang, key: string): string {
  const keys = key.split(".");
  let value: any = LOCALES[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key; // fallback to key if not found
    }
  }

  return typeof value === "string" ? value : key;
}
