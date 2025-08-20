import { DB_NAME, DB_VERSION } from "./schema";
import type { ContactDoc, EventDoc, SettingsDoc } from "../index";

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

function tx(db: IDBDatabase, stores: string[], mode: IDBTransactionMode) {
  return db.transaction(stores, mode);
}

export async function getSettings(db: IDBDatabase): Promise<SettingsDoc> {
  const t = tx(db, ["settings"], "readonly");
  const store = t.objectStore("settings");
  const req = store.get("default");
  const settings = await new Promise<SettingsDoc | undefined>((res, rej) => {
    req.onsuccess = () => res(req.result as SettingsDoc | undefined);
    req.onerror = () => rej(req.error);
  });
  if (settings) return settings;
  const seeded = DEFAULT_SETTINGS;
  await putSettings(db, seeded);
  return seeded;
}

export function putSettings(db: IDBDatabase, s: SettingsDoc): Promise<void> {
  const t = tx(db, ["settings"], "readwrite");
  const store = t.objectStore("settings");
  store.put(s);
  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

export function getContact(
  db: IDBDatabase,
  profileUrl: string
): Promise<ContactDoc | undefined> {
  const t = tx(db, ["contacts"], "readonly");
  const store = t.objectStore("contacts");
  const req = store.get(profileUrl);
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result as ContactDoc | undefined);
    req.onerror = () => rej(req.error);
  });
}

export function putContact(db: IDBDatabase, c: ContactDoc): Promise<void> {
  const t = tx(db, ["contacts"], "readwrite");
  const store = t.objectStore("contacts");
  store.put(c);
  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

export function listEventsFor(
  db: IDBDatabase,
  profileUrl: string
): Promise<EventDoc[]> {
  const t = tx(db, ["events"], "readonly");
  const idx = t.objectStore("events").index("byProfileUrl");
  const req = idx.getAll(profileUrl);
  return new Promise((res, rej) => {
    req.onsuccess = () => res((req.result as EventDoc[]) || []);
    req.onerror = () => rej(req.error);
  });
}

export function putEvent(db: IDBDatabase, ev: EventDoc): Promise<void> {
  const t = tx(db, ["events"], "readwrite");
  t.objectStore("events").put(ev);
  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

export function deleteEvent(db: IDBDatabase, eventId: string): Promise<void> {
  const t = tx(db, ["events"], "readwrite");
  t.objectStore("events").delete(eventId);
  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

// Export functions
export function getAllContacts(db: IDBDatabase): Promise<ContactDoc[]> {
  const t = tx(db, ["contacts"], "readonly");
  const store = t.objectStore("contacts");
  const req = store.getAll();
  return new Promise((res, rej) => {
    req.onsuccess = () => res((req.result as ContactDoc[]) || []);
    req.onerror = () => rej(req.error);
  });
}

export function getAllEvents(db: IDBDatabase): Promise<EventDoc[]> {
  const t = tx(db, ["events"], "readonly");
  const store = t.objectStore("events");
  const req = store.getAll();
  return new Promise((res, rej) => {
    req.onsuccess = () => res((req.result as EventDoc[]) || []);
    req.onerror = () => rej(req.error);
  });
}

// Clear all data functions
export function clearAllContacts(db: IDBDatabase): Promise<void> {
  const t = tx(db, ["contacts"], "readwrite");
  const store = t.objectStore("contacts");
  store.clear();
  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

export function clearAllEvents(db: IDBDatabase): Promise<void> {
  const t = tx(db, ["events"], "readwrite");
  const store = t.objectStore("events");
  store.clear();
  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

// Import functions
export function importContacts(
  db: IDBDatabase,
  contacts: ContactDoc[]
): Promise<void> {
  const t = tx(db, ["contacts"], "readwrite");
  const store = t.objectStore("contacts");

  contacts.forEach((contact) => {
    store.put(contact);
  });

  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

export function importEvents(
  db: IDBDatabase,
  events: EventDoc[]
): Promise<void> {
  const t = tx(db, ["events"], "readwrite");
  const store = t.objectStore("events");

  events.forEach((event) => {
    store.put(event);
  });

  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

// Default settings seed
export const DEFAULT_SETTINGS: SettingsDoc = {
  id: "default",
  lang: "de",
  weights: { categories: 0.2, events: 0.1, affinity: 0.33 },
  decay: { mode: "exponential", decayStartDays: 21, halfLifeDays: 90 },
  anonymousMode: false,
  categories: [
    {
      id: "business",
      label_de: "Geschäftsbeziehung",
      label_en: "Business relationship",
      value: 80,
      color: "#28a745", // Green
    },
    {
      id: "colleague",
      label_de: "Kollege",
      label_en: "Colleague",
      value: 60,
      color: "#007bff", // Blue
    },
    {
      id: "acquaintance",
      label_de: "Bekanntschaft",
      label_en: "Acquaintance",
      value: 40,
      color: "#ffc107", // Yellow/Orange
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
