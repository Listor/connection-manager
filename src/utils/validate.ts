import type { ExportBundleV1 } from "../types/index";

export function validateBundleJson(
  anyJson: unknown
): { ok: true; data: ExportBundleV1 } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (!anyJson || typeof anyJson !== "object") {
    errors.push("Invalid JSON structure");
    return { ok: false, errors };
  }

  const data = anyJson as any;

  // Check version
  if (data.version !== "1.0") {
    errors.push("Unsupported version. Expected '1.0'");
  }

  // Check required top-level properties
  if (!data.settings) errors.push("Missing 'settings'");
  if (!data.contacts) errors.push("Missing 'contacts'");
  if (!data.events) errors.push("Missing 'events'");

  // Basic validation of arrays
  if (!Array.isArray(data.contacts)) errors.push("'contacts' must be an array");
  if (!Array.isArray(data.events)) errors.push("'events' must be an array");

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: data as ExportBundleV1 };
}
