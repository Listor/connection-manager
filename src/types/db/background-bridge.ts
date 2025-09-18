import type {
  ContactDoc,
  EventDoc,
  SettingsDoc,
  ExportBundleV1,
} from "../index";
// Use Chrome API with Firefox compatibility
declare const browser: typeof chrome;
const api = typeof browser !== "undefined" ? browser : chrome;

// Message types for communication with background script
type MessageType =
  | "GET_ALL_CONTACTS"
  | "GET_ALL_EVENTS"
  | "CLEAR_ALL_CONTACTS"
  | "CLEAR_ALL_EVENTS"
  | "IMPORT_CONTACTS"
  | "IMPORT_EVENTS"
  | "GET_SETTINGS"
  | "PUT_SETTINGS"
  | "EXPORT_DATA";

interface MessageRequest {
  type: MessageType;
  data?: any;
}

interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Helper function to send messages to background script
async function sendMessage(request: MessageRequest): Promise<MessageResponse> {
  console.log("Background bridge sending message:", request);
  return new Promise((resolve, reject) => {
    api.runtime.sendMessage(request, (response: MessageResponse) => {
      console.log("Background bridge received response:", response);
      if (api.runtime.lastError) {
        console.error("Background bridge error:", api.runtime.lastError);
        reject(new Error(api.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// Background bridge functions for options page
export async function getSettings(): Promise<SettingsDoc> {
  const response = await sendMessage({ type: "GET_SETTINGS" });
  if (!response.success) {
    throw new Error(response.error || "Failed to get settings");
  }
  return response.data;
}

export async function putSettings(settings: SettingsDoc): Promise<void> {
  const response = await sendMessage({
    type: "PUT_SETTINGS",
    data: settings,
  });
  if (!response.success) {
    throw new Error(response.error || "Failed to save settings");
  }
}

export async function getAllContacts(): Promise<ContactDoc[]> {
  const response = await sendMessage({ type: "GET_ALL_CONTACTS" });
  if (!response.success) {
    throw new Error(response.error || "Failed to get contacts");
  }
  return response.data;
}

export async function getAllEvents(): Promise<EventDoc[]> {
  const response = await sendMessage({ type: "GET_ALL_EVENTS" });
  if (!response.success) {
    throw new Error(response.error || "Failed to get events");
  }
  return response.data;
}

export async function clearAllContacts(): Promise<void> {
  const response = await sendMessage({ type: "CLEAR_ALL_CONTACTS" });
  if (!response.success) {
    throw new Error(response.error || "Failed to clear contacts");
  }
}

export async function clearAllEvents(): Promise<void> {
  const response = await sendMessage({ type: "CLEAR_ALL_EVENTS" });
  if (!response.success) {
    throw new Error(response.error || "Failed to clear events");
  }
}

export async function importContacts(contacts: ContactDoc[]): Promise<void> {
  const response = await sendMessage({
    type: "IMPORT_CONTACTS",
    data: contacts,
  });
  if (!response.success) {
    throw new Error(response.error || "Failed to import contacts");
  }
}

export async function importEvents(events: EventDoc[]): Promise<void> {
  const response = await sendMessage({
    type: "IMPORT_EVENTS",
    data: events,
  });
  if (!response.success) {
    throw new Error(response.error || "Failed to import events");
  }
}

export async function exportData(): Promise<ExportBundleV1> {
  const response = await sendMessage({ type: "EXPORT_DATA" });
  if (!response.success) {
    throw new Error(response.error || "Failed to export data");
  }
  return response.data;
}
