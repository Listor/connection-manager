import {
  getContact,
  listEventsFor,
  openDb,
  getSettings,
  putSettings,
  putContact,
  putEvent,
  deleteEvent,
  getAllContacts,
  getAllEvents,
  clearAllContacts,
  clearAllEvents,
  importContacts,
  importEvents,
} from "../types/db/idb";
import { eventScore, totalScore } from "../scoring/scoring";
import type { ContactDoc, EventDoc, ExportBundleV1 } from "../types/index";
import { extractDisplayName } from "./dom-selectors";

let shadowRoot: ShadowRoot | null = null;
let container: HTMLDivElement | null = null;
let hideTimer: number | null = null;
let currentProfileUrl: string | null = null; // Track which profile is currently shown
let optionsOverlay: HTMLDivElement | null = null; // Options overlay
let anonymousMode = false; // Track anonymous mode setting

// Function to create anonymous overlay element
function createAnonymousOverlay(): HTMLElement {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    border-radius: 4px;
    z-index: 10;
    pointer-events: none;
  `;
  return overlay;
}

// Function to apply anonymous mode to LinkedIn names
function applyAnonymousModeToLinkedIn() {
  if (!anonymousMode) {
    // Remove all anonymous overlays
    document
      .querySelectorAll(".li-anonymous-overlay")
      .forEach((el) => el.remove());
    return;
  }

  // Apply to LinkedIn profile names and links
  const selectors = [
    'a[href*="/in/"] span', // Profile link names
    ".entity-result__title-text", // Search result names
    ".pv-text-details__left-panel h1", // Profile page name
    ".text-heading-xlarge", // Large profile names
    ".text-body-large", // Body text names
    ".artdeco-entity-lockup__title", // Entity lockup names
    ".feed-identity-module__actor-name", // Feed actor names
    ".comment-actor__name", // Comment names
    ".post-meta__actor-name", // Post meta names
    ".msg-conversations-container__name", // Message names
    ".conversation__participant-name", // Conversation names
    ".search-result__info .actor-name", // Search result actor names
    ".notification-item__actor-name", // Notification names
    ".feed-shared-actor__name", // Feed shared actor names
    ".feed-shared-comment-v2__actor-name", // Comment actor names
    ".feed-shared-update-v2__actor-name", // Update actor names
  ];

  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        // Check if already processed
        if (element.dataset.anonymousProcessed) return;

        // Mark as processed
        element.dataset.anonymousProcessed = "true";

        // Make the element position relative if it's not already
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === "static") {
          element.style.position = "relative";
        }

        // Create overlay
        const overlay = createAnonymousOverlay();
        overlay.className = "li-anonymous-overlay";

        // Position overlay relative to the element
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";

        // Insert overlay as child of the element
        element.appendChild(overlay);
      }
    });
  });
}

// Function to update anonymous mode setting
async function updateAnonymousMode() {
  try {
    const db = await openDb();
    const settings = await getSettings(db);
    anonymousMode = settings.anonymousMode;

    // Apply or remove anonymous mode
    applyAnonymousModeToLinkedIn();
  } catch (error) {
    console.error("Error updating anonymous mode:", error);
  }
}

// Initialize anonymous mode on page load
updateAnonymousMode();

// Monitor for DOM changes to apply anonymous mode to new elements
const observer = new MutationObserver(() => {
  if (anonymousMode) {
    applyAnonymousModeToLinkedIn();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Add keyboard shortcut for options
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === "O") {
    event.preventDefault();
    openOptionsOverlay();
  }
});

// Message listener for IndexedDB requests from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "INDEXEDDB_REQUEST") {
    handleIndexedDBRequest(message.request).then(sendResponse);
    return true; // Keep message channel open for async response
  }

  // Handle options page requests
  if (message.type === "OPEN_OPTIONS") {
    openOptionsOverlay();
    sendResponse({ success: true });
    return true;
  }

  // Handle settings update for anonymous mode
  if (message.type === "SETTINGS_UPDATED") {
    updateAnonymousMode();
    sendResponse({ success: true });
    return true;
  }
});

async function handleIndexedDBRequest(request: any) {
  try {
    console.log("Content script handling IndexedDB request:", request);

    const db = await openDb();

    switch (request.type) {
      case "GET_ALL_CONTACTS":
        const contacts = await getAllContacts(db);
        return { success: true, data: contacts };

      case "GET_ALL_EVENTS":
        const events = await getAllEvents(db);
        return { success: true, data: events };

      case "CLEAR_ALL_CONTACTS":
        await clearAllContacts(db);
        return { success: true };

      case "CLEAR_ALL_EVENTS":
        await clearAllEvents(db);
        return { success: true };

      case "IMPORT_CONTACTS":
        await importContacts(db, request.data);
        return { success: true };

      case "IMPORT_EVENTS":
        await importEvents(db, request.data);
        return { success: true };

      case "GET_SETTINGS":
        const settings = await getSettings(db);
        return { success: true, data: settings };

      case "PUT_SETTINGS":
        await putSettings(db, request.data);
        return { success: true };

      case "EXPORT_DATA":
        const exportContacts = await getAllContacts(db);
        const exportEvents = await getAllEvents(db);
        const exportSettings = await getSettings(db);

        const exportData: ExportBundleV1 = {
          version: "1.0",
          settings: exportSettings,
          contacts: exportContacts,
          events: exportEvents,
        };
        return { success: true, data: exportData };

      default:
        return { success: false, error: "Unknown request type" };
    }
  } catch (error) {
    console.error("Content script IndexedDB error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function ensureOverlayHost() {
  if (container) return;
  const host = document.createElement("div");
  host.id = "li-notes-overlay-host";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  host.style.top = "0";
  host.style.left = "0";
  document.documentElement.appendChild(host);
  shadowRoot = host.attachShadow({ mode: "open" });
  container = document.createElement("div");

  const style = document.createElement("style");
  style.textContent = `
    /* CSS Variables for shadow DOM */
    :host {
      --linkedin-blue: #0073b1;
      --linkedin-blue-dark: #005885;
      --border-color: #ddd;
      --background-light: #f8f9fa;
      --background-lighter: #fafafa;
      --text-primary: #333;
      --text-secondary: #666;
      --text-muted: #666;
      --error-color: #dc3545;
      --error-bg: #f8d7da;
      --error-border: #f5c6cb;
      --success-color: #155724;
      --success-bg: #d4edda;
      --success-border: #c3e6cb;
      --shadow-light: rgba(0, 0, 0, 0.1);
      --shadow-medium: rgba(0, 0, 0, 0.15);
      --shadow-heavy: rgba(0, 0, 0, 0.3);
    }

    /* Base styles */
    * {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "Helvetica Neue", Arial, sans-serif;
      box-sizing: border-box;
    }

    /* Common button styles */
    button {
      border: 1px solid var(--border-color);
      background: var(--background-lighter);
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
      transition: background-color 0.2s ease;
    }

    button:hover {
      background: #f0f0f0;
    }

    button.primary {
      background: var(--linkedin-blue);
      color: white;
      border-color: var(--linkedin-blue);
      font-weight: 500;
      padding: 12px 24px;
      min-width: 120px;
    }

    button.primary:hover {
      background: var(--linkedin-blue-dark);
    }

    button:active {
      transform: translateY(1px);
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    /* Common input styles */
    input[type="number"],
    input[type="text"],
    input[type="datetime-local"],
    select,
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      background: white;
      transition: border-color 0.2s ease;
    }

    input[type="number"]:focus,
    input[type="text"]:focus,
    input[type="datetime-local"]:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--linkedin-blue);
      box-shadow: 0 0 0 2px rgba(0, 115, 177, 0.1);
    }

    /* Common label styles */
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--text-primary);
    }

    /* Common card styles */
    .card {
      background: white;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 16px var(--shadow-light);
      position: relative;
    }

    /* Common dialog styles */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2147483648;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog {
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 32px var(--shadow-heavy);
      position: relative;
    }

    .dialog h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
    }

    .dialog-row {
      margin-bottom: 12px;
    }

    .dialog-row label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .dialog-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .dialog-buttons button {
      padding: 8px 16px;
    }

    /* Common message styles */
    .error {
      color: var(--error-color);
      font-size: 14px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--error-bg);
      border: 1px solid var(--error-border);
      border-radius: 4px;
    }

    .success {
      color: var(--success-color);
      font-size: 14px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--success-bg);
      border: 1px solid var(--success-border);
      border-radius: 4px;
    }

    /* Common utility classes */
    .small {
      color: var(--text-secondary);
      font-size: 12px;
    }

    .muted {
      color: var(--text-muted);
    }

    .help-text {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
      font-style: italic;
    }

    /* Anonymous mode overlay */
    .anonymous-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      border-radius: 2px;
      pointer-events: none;
    }

    /* Common layout utilities */
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .button-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: auto;
      padding-top: 12px;
    }

    .button-row button {
      flex: 1;
      min-width: 0;
    }

    /* Common badge styles */
    .badge {
      padding: 2px 6px;
      border-radius: 999px;
      border: 1px solid #ccc;
      font-size: 12px;
    }

    /* Overlay specific styles */
    .card { 
      width: 380px; 
      display: flex;
      flex-direction: column;
      min-height: 140px;
    }
    
    .card-content { flex: 1; }
    
    .score { font-weight: 700; margin-left: 8px; }
    .score-number { margin-right: 6px; }
    .score-badge { margin-left: 2px; }
    
    /* Dialog specific styles */
    .dialog-row select,
    .dialog-row input,
    .dialog-row textarea {
      box-sizing: border-box;
    }
    
    .dialog-row input[type="range"] {
      padding: 0;
      margin: 0;
    }
    
    .dialog-row textarea {
       height: 80px;
       resize: vertical;
       box-sizing: border-box;
       width: 100%;
     }
    
    .dialog-buttons button.secondary {
      background: var(--background-light);
      border-color: var(--border-color);
    }
    
    .points-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      margin-top: 4px;
    }
    
    .points-grid button {
      padding: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-light);
      cursor: pointer;
    }
    
    .points-grid button.selected {
      background: var(--linkedin-blue);
      color: white;
      border-color: var(--linkedin-blue);
    }
     
    /* Events list styles */
    .events-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 8px;
    }
    
    .event-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px;
      border-bottom: 1px solid #eee;
      gap: 8px;
    }
    
    .event-item:last-child {
      border-bottom: none;
    }
    
    .event-info {
      flex: 1;
    }
    
    .event-date {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .event-type {
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .event-points {
      color: var(--linkedin-blue);
      font-weight: 500;
      font-size: 12px;
    }
    
    .event-note {
      color: var(--text-secondary);
      font-size: 11px;
      margin-top: 4px;
      font-style: italic;
    }
    
    .delete-event {
      background: var(--error-color);
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .delete-event:hover {
      background: #c82333;
    }
    
    .no-events {
      color: var(--text-secondary);
      font-style: italic;
      text-align: center;
      padding: 16px;
    }
    
    .category-gradient {
      position: absolute;
      top: 0;
      right: 0;
      width: 30%;
      height: 100%;
      opacity: 0.5;
      pointer-events: none;
      border-radius: 8px;
    }
    
    .dialog .category-gradient {
      border-radius: 8px;
    }
  `;

  shadowRoot!.append(style, container);
}

function positionOverlay(rect: DOMRect) {
  if (!container) return;

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Estimate overlay dimensions
  const overlayWidth = 380;
  const overlayHeight = 140;

  // Calculate position - simple offset from link
  let left = rect.left;
  let top = rect.top + rect.height + 10; // 10px below the link

  // Adjust if overlay would go off-screen to the left
  if (left < 12) {
    left = 12;
  }

  // Adjust if overlay would go off-screen to the right
  if (left + overlayWidth > viewportWidth - 12) {
    left = viewportWidth - overlayWidth - 12;
  }

  // If overlay would go off-screen at the bottom, position it above the link
  if (top + overlayHeight > viewportHeight - 12) {
    top = rect.top - overlayHeight - 10; // 10px above the link
  }

  // Ensure it doesn't go off-screen at the top
  if (top < 12) {
    top = 12;
  }

  container.style.position = "absolute";
  container.style.left = `${left}px`;
  container.style.top = `${top}px`;

  // Create invisible bridge to cover the gap between link and tooltip
  createInvisibleBridge(rect, {
    left,
    top,
    width: overlayWidth,
    height: overlayHeight,
  });
}

function bandLabel(total: number): string {
  if (total <= 24) return "Schwach";
  if (total <= 49) return "Gering";
  if (total <= 74) return "Mittel";
  if (total <= 89) return "Stark";
  return "Sehr stark";
}

function getEventTypeLabel(typeId: string): string {
  switch (typeId) {
    case "meeting":
      return "Treffen";
    case "call":
      return "Telefonat";
    case "lunch":
      return "Mittagessen";
    default:
      return typeId;
  }
}

function getCategoryColor(categoryId: string, settings: any): string {
  const category = settings.categories.find((c: any) => c.id === categoryId);
  return category?.color || "#ccc"; // Default gray if not found
}

export async function showOverlay(anchor: HTMLElement, profileUrl: string) {
  ensureOverlayHost();
  if (!container || !shadowRoot) return;

  // Clear any existing hide timer
  clearHide();

  // Store the current profile URL
  currentProfileUrl = profileUrl;

  const rect = anchor.getBoundingClientRect();
  positionOverlay(rect);

  const db = await openDb();
  const settings = await getSettings(db);
  let contact = (await getContact(db, profileUrl)) as ContactDoc | undefined;
  const events = await listEventsFor(db, profileUrl);

  // Extract name using improved selectors
  let name = contact?.displayName;
  const extractedName = extractDisplayName(anchor as HTMLAnchorElement);

  if (!name) {
    // If we found a name and don't have a contact yet, create one
    if (extractedName && !contact) {
      contact = {
        profileUrl,
        displayName: extractedName,
        categoryId: "acquaintance", // default category
        affinity: 0, // start with 0 points
      };
      await putContact(db, contact);
      name = extractedName;
    } else if (extractedName) {
      name = extractedName;
    }
  } else if (extractedName && extractedName !== name && contact) {
    // If we have a stored name but found a better one, update it
    if (extractedName.length < name.length || !name.includes(extractedName)) {
      contact.displayName = extractedName;
      await putContact(db, contact);
      name = extractedName;
    }
  }

  // Fallback if no name found
  if (!name) {
    name = anchor.textContent?.trim() || "—";
  }

  // Calculate score only if there's meaningful data
  let scoreDisplay: string;
  let badgeDisplay: string;

  const eScore = eventScore(events, new Date(), settings.decay);
  const categoryValue = contact
    ? settings.categories.find((c) => c.id === contact.categoryId)?.value ?? 0
    : 0;
  const affinity = contact?.affinity ?? 0;

  // Check if there's meaningful data to show a score
  const hasEvents = events.length > 0;
  const hasAffinity = affinity > 0;
  const hasCustomCategory =
    contact?.categoryId && contact.categoryId !== "acquaintance";

  if (!hasEvents && !hasAffinity && !hasCustomCategory) {
    // No meaningful data - show N/A
    scoreDisplay = "N/A";
    badgeDisplay = "";
  } else {
    // Calculate actual score
    const total = totalScore(categoryValue, eScore, affinity, settings.weights);
    scoreDisplay = total.toString();
    badgeDisplay = `<span class="badge">${bandLabel(total)}</span>`;
  }

  // Get category color for gradient
  const categoryColor = getCategoryColor(
    contact?.categoryId || "acquaintance",
    settings
  );

  container.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card";
  card.style.position = "relative";
  card.innerHTML = `
    <div class="card-content">
            <div class="row"><div style="position: relative;">${name}${
    anonymousMode ? '<div class="anonymous-overlay"></div>' : ""
  }</div><div class="score"><span class="score-number">${scoreDisplay}</span><span class="score-badge">${badgeDisplay}</span></div></div>
      <div class="small muted">${
        events.length
          ? `Letzte Interaktion: ${new Date(
              Math.max(...events.map((e) => +new Date(e.timestamp)))
            ).toLocaleDateString()}`
          : "Keine Interaktionen"
      }</div>
      <div class="small">${
        contact?.notes ? contact.notes.split("\n")[0] : ""
      }</div>
    </div>
    <div class="button-row">
      <button data-act="add-evt">Interaktion +</button>
      <button data-act="add-note">Notiz +</button>
      <button data-act="details">Details</button>
    </div>
    <div class="category-gradient" style="background: linear-gradient(to right, transparent 0%, ${categoryColor}40 70%, ${categoryColor}80 100%);"></div>
  `;

  // Add mouse events to the overlay
  card.addEventListener("mouseenter", clearHide);
  card.addEventListener("mouseleave", () => {
    scheduleHide();
  });

  // Add click handlers for buttons
  card.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON") {
      const action = target.getAttribute("data-act");
      await handleButtonClick(action, profileUrl, contact, name);
    }
  });

  container.appendChild(card);
}

async function handleButtonClick(
  action: string | null,
  profileUrl: string,
  contact: ContactDoc | undefined,
  name: string
) {
  switch (action) {
    case "add-evt":
      await showAddEventDialog(profileUrl, name);
      break;
    case "add-note":
      await showAddNoteDialog(profileUrl, contact);
      break;
    case "details":
      await showDetailsDialog(profileUrl, contact, name);
      break;
  }
}

async function showAddEventDialog(profileUrl: string, name: string) {
  if (!shadowRoot) return;

  const dialogOverlay = document.createElement("div");
  dialogOverlay.className = "dialog-overlay";

  const dialog = document.createElement("div");
  dialog.className = "dialog";

  let selectedEventType = "meeting";
  let selectedPoints = 3;

  // Get settings to get the proper category color
  const db = await openDb();
  const settings = await getSettings(db);
  const contact = await getContact(db, profileUrl);
  const categoryColor = getCategoryColor(
    contact?.categoryId || "acquaintance",
    settings
  );

  dialog.innerHTML = `
      <h3>Interaktion hinzufügen</h3>
      <div class="dialog-row">
                <label>Für: <span style="position: relative;">${name}${
    anonymousMode ? '<div class="anonymous-overlay"></div>' : ""
  }</span></label>
      </div>
      <div class="dialog-row">
        <label for="event-type">Typ:</label>
        <select id="event-type">
          <option value="meeting">Treffen</option>
          <option value="call">Telefonat</option>
          <option value="lunch">Mittagessen</option>
        </select>
      </div>
      <div class="dialog-row">
        <label>Bewertung:</label>
        <div class="points-grid">
          <button data-points="1">1</button>
          <button data-points="2">2</button>
          <button data-points="3" class="selected">3</button>
          <button data-points="4">4</button>
          <button data-points="5">5</button>
        </div>
      </div>
           <div class="dialog-row">
         <label for="event-datetime">Datum & Uhrzeit:</label>
         <input type="datetime-local" id="event-datetime" />
       </div>
       <div class="dialog-row">
         <label for="event-note">Notiz (optional):</label>
         <textarea id="event-note" placeholder="Details zur Interaktion..."></textarea>
       </div>
      <div class="dialog-buttons">
        <button class="secondary" id="cancel-event">Abbrechen</button>
        <button class="primary" id="save-event">Speichern</button>
      </div>
      <div class="category-gradient" style="background: linear-gradient(to right, transparent 0%, ${categoryColor}40 70%, ${categoryColor}80 100%);"></div>
    `;

  // Make dialog position relative for gradient
  dialog.style.position = "relative";

  dialogOverlay.appendChild(dialog);
  shadowRoot.appendChild(dialogOverlay);

  // Event handlers
  const eventTypeSelect = dialog.querySelector(
    "#event-type"
  ) as HTMLSelectElement;
  const pointsButtons = dialog.querySelectorAll(".points-grid button");
  const datetimeInput = dialog.querySelector(
    "#event-datetime"
  ) as HTMLInputElement;
  const noteTextarea = dialog.querySelector(
    "#event-note"
  ) as HTMLTextAreaElement;
  const cancelBtn = dialog.querySelector("#cancel-event") as HTMLButtonElement;
  const saveBtn = dialog.querySelector("#save-event") as HTMLButtonElement;

  // Set current date and time as default
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  datetimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

  eventTypeSelect.addEventListener("change", (e) => {
    selectedEventType = (e.target as HTMLSelectElement).value;
  });

  pointsButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      pointsButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedPoints = Number(btn.getAttribute("data-points"));
    });
  });

  cancelBtn.addEventListener("click", () => {
    shadowRoot!.removeChild(dialogOverlay);
  });

  saveBtn.addEventListener("click", async () => {
    const note = noteTextarea.value.trim();
    const selectedDateTime = datetimeInput.value;

    try {
      const db = await openDb();

      // Create the event with selected date/time
      const event: EventDoc = {
        id: crypto.randomUUID(),
        profileUrl,
        typeId: selectedEventType,
        timestamp: selectedDateTime
          ? new Date(selectedDateTime).toISOString()
          : new Date().toISOString(),
        points: selectedPoints as 1 | 2 | 3 | 4 | 5,
        note: note || undefined,
      };

      await putEvent(db, event);

      shadowRoot!.removeChild(dialogOverlay);

      // Refresh the overlay to show the new event
      const anchor = document.querySelector(
        `[data-li-notes-profile="${profileUrl}"]`
      ) as HTMLElement;
      if (anchor) {
        await showOverlay(anchor, profileUrl);
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Fehler beim Speichern des Events");
    }
  });

  // Close on overlay click
  dialogOverlay.addEventListener("click", (e) => {
    if (e.target === dialogOverlay) {
      shadowRoot!.removeChild(dialogOverlay);
    }
  });
}

async function showAddNoteDialog(
  profileUrl: string,
  contact: ContactDoc | undefined
) {
  if (!shadowRoot) return;

  const dialogOverlay = document.createElement("div");
  dialogOverlay.className = "dialog-overlay";

  const dialog = document.createElement("div");
  dialog.className = "dialog";

  const currentNote = contact?.notes || "";

  // Get settings to get the proper category color
  const db = await openDb();
  const settings = await getSettings(db);
  const categoryColor = getCategoryColor(
    contact?.categoryId || "acquaintance",
    settings
  );

  dialog.innerHTML = `
       <h3>Notiz bearbeiten</h3>
       <div class="dialog-row">
         <label for="contact-note">Notiz:</label>
         <textarea id="contact-note" placeholder="Notizen zu diesem Kontakt...">${currentNote}</textarea>
       </div>
       <div class="dialog-buttons">
         <button class="secondary" id="cancel-note">Abbrechen</button>
         ${
           currentNote
             ? '<button class="secondary" id="remove-note">Entfernen</button>'
             : ""
         }
         <button class="primary" id="save-note">Speichern</button>
       </div>
       <div class="category-gradient" style="background: linear-gradient(to right, transparent 0%, ${categoryColor}40 70%, ${categoryColor}80 100%);"></div>
     `;

  // Make dialog position relative for gradient
  dialog.style.position = "relative";

  dialogOverlay.appendChild(dialog);
  shadowRoot.appendChild(dialogOverlay);

  // Event handlers
  const noteTextarea = dialog.querySelector(
    "#contact-note"
  ) as HTMLTextAreaElement;
  const cancelBtn = dialog.querySelector("#cancel-note") as HTMLButtonElement;
  const saveBtn = dialog.querySelector("#save-note") as HTMLButtonElement;
  const removeBtn = dialog.querySelector("#remove-note") as HTMLButtonElement;

  cancelBtn.addEventListener("click", () => {
    shadowRoot!.removeChild(dialogOverlay);
  });

  if (removeBtn) {
    removeBtn.addEventListener("click", async () => {
      try {
        const db = await openDb();

        // Get or create contact
        let contact = await getContact(db, profileUrl);
        if (!contact) {
          contact = {
            profileUrl,
            displayName: "Unbekannt",
            categoryId: "acquaintance",
            affinity: 0,
          };
        }

        // Remove notes
        contact.notes = undefined;
        await putContact(db, contact);

        shadowRoot!.removeChild(dialogOverlay);

        // Refresh the overlay to show the removed note
        const anchor = document.querySelector(
          `[data-li-notes-profile="${profileUrl}"]`
        ) as HTMLElement;
        if (anchor) {
          await showOverlay(anchor, profileUrl);
        }
      } catch (error) {
        console.error("Error removing note:", error);
        alert("Fehler beim Entfernen der Notiz");
      }
    });
  }

  saveBtn.addEventListener("click", async () => {
    const newNote = noteTextarea.value.trim();

    try {
      const db = await openDb();

      // Get or create contact
      let contact = await getContact(db, profileUrl);
      if (!contact) {
        // Create new contact if it doesn't exist
        contact = {
          profileUrl,
          displayName: "Unbekannt",
          categoryId: "acquaintance", // default category
          affinity: 0, // start with 0 points
          notes: newNote,
        };
      } else {
        // Update existing contact
        contact.notes = newNote;
      }

      await putContact(db, contact);

      shadowRoot!.removeChild(dialogOverlay);

      // Refresh the overlay to show the new note
      const anchor = document.querySelector(
        `[data-li-notes-profile="${profileUrl}"]`
      ) as HTMLElement;
      if (anchor) {
        await showOverlay(anchor, profileUrl);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Fehler beim Speichern der Notiz");
    }
  });

  // Close on overlay click
  dialogOverlay.addEventListener("click", (e) => {
    if (e.target === dialogOverlay) {
      shadowRoot!.removeChild(dialogOverlay);
    }
  });
}

async function showDetailsDialog(
  profileUrl: string,
  contact: ContactDoc | undefined,
  name: string
) {
  if (!shadowRoot) return;

  const dialogOverlay = document.createElement("div");
  dialogOverlay.className = "dialog-overlay";

  const dialog = document.createElement("div");
  dialog.className = "dialog";

  // Get events for this contact
  const db = await openDb();
  const settings = await getSettings(db);
  const events = await listEventsFor(db, profileUrl);

  // Create events list HTML
  const eventsList =
    events.length > 0
      ? events
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .map(
            (event) => `
          <div class="event-item" data-event-id="${event.id}">
            <div class="event-info">
              <div class="event-date">${new Date(
                event.timestamp
              ).toLocaleDateString()}</div>
              <div class="event-type">${getEventTypeLabel(event.typeId)}</div>
              <div class="event-points">${event.points} Punkte</div>
              ${event.note ? `<div class="event-note">${event.note}</div>` : ""}
            </div>
            <button class="delete-event" data-event-id="${event.id}">×</button>
          </div>
        `
          )
          .join("")
      : '<div class="no-events">Keine Interaktionen</div>';

  dialog.innerHTML = `
      <h3>Kontakt Details</h3>
      <div class="dialog-row">
        <label>Name:</label>
                <div style="position: relative;">${name}${
    anonymousMode ? '<div class="anonymous-overlay"></div>' : ""
  }</div>
      </div>
      <div class="dialog-row">
        <label>URL:</label>
        <div style="word-break: break-all; font-size: 12px; color: #666; position: relative;">${profileUrl}${
    anonymousMode ? '<div class="anonymous-overlay"></div>' : ""
  }</div>
      </div>
           <div class="dialog-row">
         <label for="contact-category">Kategorie:</label>
         <select id="contact-category">
           ${settings.categories
             .map(
               (cat) => `
             <option value="${cat.id}" ${
                 contact?.categoryId === cat.id ? "selected" : ""
               }>
               ${cat.label_de}
             </option>
           `
             )
             .join("")}
         </select>
       </div>
      <div class="dialog-row">
        <label>Empfinden:</label>
        <div style="display: flex; align-items: center; gap: 12px;">
          <input 
            type="range" 
            id="contact-affinity" 
            min="0" 
            max="100" 
            value="${contact?.affinity || 0}"
            style="flex: 1;"
          />
          <span id="affinity-value" style="min-width: 40px; text-align: right;">${
            contact?.affinity || 0
          }/100</span>
        </div>
      </div>
      <div class="dialog-row">
        <label>Notizen:</label>
        <div style="white-space: pre-wrap; max-height: 100px; overflow-y: auto;">${
          contact?.notes || "Keine"
        }</div>
      </div>
      <div class="dialog-row">
        <label>Interaktionen (${events.length}):</label>
        <div class="events-list">
          ${eventsList}
        </div>
      </div>
      <div class="dialog-buttons">
        <button class="secondary" id="close-details">Schließen</button>
      </div>
    `;

  // Add category gradient to the dialog
  const categoryColor = getCategoryColor(
    contact?.categoryId || "acquaintance",
    settings
  );
  dialog.style.position = "relative";
  const gradientElement = document.createElement("div");
  gradientElement.className = "category-gradient";
  gradientElement.id = "details-category-gradient";
  gradientElement.style.background = `linear-gradient(to right, transparent 0%, ${categoryColor}40 70%, ${categoryColor}80 100%)`;
  dialog.appendChild(gradientElement);

  dialogOverlay.appendChild(dialog);
  shadowRoot.appendChild(dialogOverlay);

  // Event handlers
  const closeBtn = dialog.querySelector("#close-details") as HTMLButtonElement;
  const categorySelect = dialog.querySelector(
    "#contact-category"
  ) as HTMLSelectElement;
  const affinitySlider = dialog.querySelector(
    "#contact-affinity"
  ) as HTMLInputElement;
  const affinityValueSpan = dialog.querySelector(
    "#affinity-value"
  ) as HTMLSpanElement;

  closeBtn.addEventListener("click", () => {
    shadowRoot!.removeChild(dialogOverlay);
  });

  categorySelect.addEventListener("change", async () => {
    const newCategoryId = categorySelect.value;
    try {
      // Get or create contact
      let contact = await getContact(db, profileUrl);
      if (!contact) {
        contact = {
          profileUrl,
          displayName: name,
          categoryId: newCategoryId,
          affinity: 0,
        };
      } else {
        contact.categoryId = newCategoryId;
      }

      await putContact(db, contact);

      // Update the contact variable for the current dialog instance
      // This prevents the flicker by not recreating the entire dialog
      contact = await getContact(db, profileUrl);

      // Update the category gradient immediately
      const gradientElement = dialog.querySelector(
        "#details-category-gradient"
      ) as HTMLElement;
      if (gradientElement) {
        const newColor = getCategoryColor(newCategoryId, settings);
        gradientElement.style.background = `linear-gradient(to right, transparent 0%, ${newColor}40 70%, ${newColor}80 100%)`;
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Fehler beim Aktualisieren der Kategorie");
    }
  });

  affinitySlider.addEventListener("input", (e) => {
    const value = (e.target as HTMLInputElement).value;
    affinityValueSpan.textContent = `${value}/100`;
  });

  affinitySlider.addEventListener("change", async (e) => {
    const newAffinity = Number((e.target as HTMLInputElement).value);
    try {
      // Get or create contact
      let contact = await getContact(db, profileUrl);
      if (!contact) {
        contact = {
          profileUrl,
          displayName: name,
          categoryId: "acquaintance",
          affinity: newAffinity,
        };
      } else {
        contact.affinity = newAffinity;
      }

      await putContact(db, contact);

      // Update the contact variable for the current dialog instance
      contact = await getContact(db, profileUrl);
    } catch (error) {
      console.error("Error updating affinity:", error);
      alert("Fehler beim Aktualisieren des Empfindens");
    }
  });

  // Handle delete event buttons
  const deleteButtons = dialog.querySelectorAll(".delete-event");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const eventId = (e.target as HTMLElement).getAttribute("data-event-id");
      if (eventId && confirm("Interaktion wirklich löschen?")) {
        try {
          await deleteEvent(db, eventId);
          // Refresh the dialog
          shadowRoot!.removeChild(dialogOverlay);
          showDetailsDialog(profileUrl, contact, name);
        } catch (error) {
          console.error("Error deleting event:", error);
          alert("Fehler beim Löschen der Interaktion");
        }
      }
    });
  });

  // Close on overlay click
  dialogOverlay.addEventListener("click", (e) => {
    if (e.target === dialogOverlay) {
      shadowRoot!.removeChild(dialogOverlay);
    }
  });
}

function clearHide() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  // Remove bridge when clearing hide
  const bridge = document.getElementById("li-notes-bridge");
  if (bridge) {
    bridge.remove();
  }
}

export function scheduleHide() {
  hideTimer = window.setTimeout(() => {
    if (container) container.innerHTML = "";
    // Remove bridge when hiding overlay
    const bridge = document.getElementById("li-notes-bridge");
    if (bridge) {
      bridge.remove();
    }
    currentProfileUrl = null;
  }, 200); // 200ms delay
}

// Export function to check if an element is related to the current profile
export function isRelatedToCurrentProfile(element: HTMLElement): boolean {
  if (!currentProfileUrl) return false;

  // Check if this element has the same profile URL
  const elementUrl =
    element.dataset.liNotesProfile ||
    ((element as HTMLAnchorElement).href
      ? (window as any).normalizeLinkedInProfileUrl?.(
          (element as HTMLAnchorElement).href
        )
      : null);

  return elementUrl === currentProfileUrl;
}

function createInvisibleBridge(
  linkRect: DOMRect,
  overlayRect: { left: number; top: number; width: number; height: number }
) {
  // Remove any existing bridge
  const existingBridge = document.getElementById("li-notes-bridge");
  if (existingBridge) {
    existingBridge.remove();
  }

  // Create invisible bridge
  const bridge = document.createElement("div");
  bridge.id = "li-notes-bridge";
  bridge.style.cssText = `
    position: fixed;
    z-index: 2147483646;
    background: transparent;
    pointer-events: auto;
  `;

  // Calculate bridge position to cover the gap
  const isOverlayAbove = overlayRect.top < linkRect.top;

  if (isOverlayAbove) {
    // Bridge covers area from bottom of overlay to top of link
    bridge.style.left = `${Math.min(linkRect.left, overlayRect.left)}px`;
    bridge.style.top = `${overlayRect.top + overlayRect.height}px`;
    bridge.style.width = `${
      Math.max(linkRect.right, overlayRect.left + overlayRect.width) -
      Math.min(linkRect.left, overlayRect.left)
    }px`;
    bridge.style.height = `${
      linkRect.top - (overlayRect.top + overlayRect.height)
    }px`;
  } else {
    // Bridge covers area from bottom of link to top of overlay
    bridge.style.left = `${Math.min(linkRect.left, overlayRect.left)}px`;
    bridge.style.top = `${linkRect.bottom}px`;
    bridge.style.width = `${
      Math.max(linkRect.right, overlayRect.left + overlayRect.width) -
      Math.min(linkRect.left, overlayRect.left)
    }px`;
    bridge.style.height = `${overlayRect.top - linkRect.bottom}px`;
  }

  // Only add bridge if there's actually a gap
  if (parseFloat(bridge.style.height) > 0) {
    // Add hover events to the bridge
    bridge.addEventListener("mouseenter", clearHide);
    bridge.addEventListener("mouseleave", (e) => {
      const relatedTarget = e.relatedTarget as HTMLElement;

      // Don't hide if moving to overlay or related element
      const overlayHost = document.getElementById("li-notes-overlay-host");
      if (
        relatedTarget &&
        overlayHost &&
        (overlayHost.contains(relatedTarget) || overlayHost === relatedTarget)
      ) {
        return;
      }

      if (relatedTarget && isRelatedToCurrentProfile(relatedTarget)) {
        return;
      }

      scheduleHide();
    });

    document.body.appendChild(bridge);
  }
}

// Function to open options overlay
function openOptionsOverlay() {
  if (optionsOverlay) {
    optionsOverlay.style.display = "flex";
    return;
  }

  // Create options overlay
  optionsOverlay = document.createElement("div");
  optionsOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  // Create options container
  const optionsContainer = document.createElement("div");
  optionsContainer.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    position: relative;
  `;

  // Add close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  `;

  closeBtn.onmouseenter = () => {
    closeBtn.style.backgroundColor = "#f0f0f0";
  };

  closeBtn.onmouseleave = () => {
    closeBtn.style.backgroundColor = "transparent";
  };

  closeBtn.onclick = () => {
    closeOptionsOverlay();
  };

  // Close overlay when clicking background
  optionsOverlay.onclick = (e) => {
    if (e.target === optionsOverlay) {
      closeOptionsOverlay();
    }
  };

  // Close overlay with Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeOptionsOverlay();
    }
  };
  document.addEventListener("keydown", handleEscape);

  // Initialize options content
  initOptionsContent(optionsContainer);

  optionsContainer.appendChild(closeBtn);
  optionsOverlay.appendChild(optionsContainer);
  document.body.appendChild(optionsOverlay);

  // Store the event listener for cleanup
  (optionsOverlay as any).escapeListener = handleEscape;
}

// Function to close options overlay
function closeOptionsOverlay() {
  if (optionsOverlay) {
    // Remove the escape key listener
    if ((optionsOverlay as any).escapeListener) {
      document.removeEventListener(
        "keydown",
        (optionsOverlay as any).escapeListener
      );
    }

    document.body.removeChild(optionsOverlay);
    optionsOverlay = null;
  }
}

// Initialize options content
async function initOptionsContent(container: HTMLDivElement) {
  try {
    const db = await openDb();
    const settings = await getSettings(db);

    // Create title
    const title = document.createElement("h1");
    title.textContent = "Connection Manager Einstellungen";
    title.style.cssText = `
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
      text-align: center;
    `;

    // Create weights section
    const weightsSection = document.createElement("div");
    weightsSection.style.cssText = `
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    `;

    const weightsTitle = document.createElement("h2");
    weightsTitle.textContent = "Gewichte";
    weightsTitle.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #0073b1;
      padding-bottom: 8px;
    `;

    // Create weight inputs
    const createWeightInput = (label: string, value: number, id: string) => {
      const div = document.createElement("div");
      div.style.cssText = `
        margin-bottom: 16px;
      `;

      const labelEl = document.createElement("label");
      labelEl.textContent = label;
      labelEl.style.cssText = `
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #333;
      `;

      const input = document.createElement("input");
      input.type = "number";
      input.step = "0.01";
      input.value = value.toString();
      input.id = id;
      input.style.cssText = `
        width: 120px;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      `;

      const helpText = document.createElement("div");
      helpText.textContent = `Gewichtung für ${label.toLowerCase()} (0-1)`;
      helpText.style.cssText = `
        font-size: 12px;
        color: #666;
        margin-top: 4px;
        font-style: italic;
      `;

      div.appendChild(labelEl);
      div.appendChild(input);
      div.appendChild(helpText);
      return div;
    };

    weightsSection.appendChild(weightsTitle);
    weightsSection.appendChild(
      createWeightInput("Kategorien", settings.weights.categories, "w_cat")
    );
    weightsSection.appendChild(
      createWeightInput("Events", settings.weights.events, "w_evt")
    );
    weightsSection.appendChild(
      createWeightInput("Empfinden", settings.weights.affinity, "w_aff")
    );

    // Create decay section
    const decaySection = document.createElement("div");
    decaySection.style.cssText = `
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    `;

    const decayTitle = document.createElement("h2");
    decayTitle.textContent = "Verfall";
    decayTitle.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #0073b1;
      padding-bottom: 8px;
    `;

    // Decay inputs
    const createDecayInput = (
      label: string,
      value: number,
      id: string,
      helpText: string
    ) => {
      const div = document.createElement("div");
      div.style.cssText = `
        margin-bottom: 16px;
      `;

      const labelEl = document.createElement("label");
      labelEl.textContent = label;
      labelEl.style.cssText = `
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #333;
      `;

      const input = document.createElement("input");
      input.type = "number";
      input.value = value.toString();
      input.id = id;
      input.style.cssText = `
        width: 120px;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      `;

      const helpEl = document.createElement("div");
      helpEl.textContent = helpText;
      helpEl.style.cssText = `
        font-size: 12px;
        color: #666;
        margin-top: 4px;
        font-style: italic;
      `;

      div.appendChild(labelEl);
      div.appendChild(input);
      div.appendChild(helpEl);
      return div;
    };

    // Decay mode selector
    const modeDiv = document.createElement("div");
    modeDiv.style.cssText = `
      margin-bottom: 16px;
    `;

    const modeLabel = document.createElement("label");
    modeLabel.textContent = "Modus";
    modeLabel.style.cssText = `
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
    `;

    const modeSelect = document.createElement("select");
    modeSelect.id = "d_mode";
    modeSelect.style.cssText = `
      width: 120px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    `;

    ["exponential", "linear", "off"].forEach((mode) => {
      const option = document.createElement("option");
      option.value = mode;
      option.textContent = mode;
      option.selected = settings.decay.mode === mode;
      modeSelect.appendChild(option);
    });

    const modeHelp = document.createElement("div");
    modeHelp.textContent = "Art des Verfalls: exponential, linear oder aus";
    modeHelp.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-top: 4px;
      font-style: italic;
    `;

    modeDiv.appendChild(modeLabel);
    modeDiv.appendChild(modeSelect);
    modeDiv.appendChild(modeHelp);

    decaySection.appendChild(decayTitle);
    decaySection.appendChild(
      createDecayInput(
        "Start (Tage)",
        settings.decay.decayStartDays,
        "d_start",
        "Nach wie vielen Tagen beginnt der Verfall"
      )
    );
    decaySection.appendChild(
      createDecayInput(
        "Halbwert (Tage)",
        settings.decay.halfLifeDays,
        "d_half",
        "Nach wie vielen Tagen halbiert sich der Wert"
      )
    );
    decaySection.appendChild(modeDiv);

    // Create privacy section
    const privacySection = document.createElement("div");
    privacySection.style.cssText = `
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    `;

    const privacyTitle = document.createElement("h2");
    privacyTitle.textContent = "Datenschutz";
    privacyTitle.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #0073b1;
      padding-bottom: 8px;
    `;

    const privacyDiv = document.createElement("div");
    privacyDiv.style.cssText = `
      margin-bottom: 16px;
    `;

    const privacyCheckbox = document.createElement("input");
    privacyCheckbox.type = "checkbox";
    privacyCheckbox.id = "anonymous-mode";
    privacyCheckbox.checked = settings.anonymousMode;
    privacyCheckbox.style.cssText = `
      margin-right: 12px;
      width: 18px;
      height: 18px;
    `;

    const privacyLabel = document.createElement("label");
    privacyLabel.textContent = "Anonymus Modus";
    privacyLabel.htmlFor = "anonymous-mode";
    privacyLabel.style.cssText = `
      font-weight: 500;
      color: #333;
      cursor: pointer;
    `;

    const privacyHelp = document.createElement("div");
    privacyHelp.textContent =
      "Überdeckt alle Namen auf LinkedIn mit einem geblurten schwarzen Balken";
    privacyHelp.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-top: 8px;
      font-style: italic;
    `;

    privacyDiv.appendChild(privacyCheckbox);
    privacyDiv.appendChild(privacyLabel);
    privacySection.appendChild(privacyTitle);
    privacySection.appendChild(privacyDiv);
    privacySection.appendChild(privacyHelp);

    // Create export/import section
    const exportSection = document.createElement("div");
    exportSection.style.cssText = `
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    `;

    const exportTitle = document.createElement("h2");
    exportTitle.textContent = "Daten Export/Import";
    exportTitle.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #0073b1;
      padding-bottom: 8px;
    `;

    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
    `;

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Daten exportieren";
    exportBtn.style.cssText = `
      background: #0073b1;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    `;

    const importBtn = document.createElement("button");
    importBtn.textContent = "Daten importieren";
    importBtn.style.cssText = `
      background: #155724;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    `;

    const testBtn = document.createElement("button");
    testBtn.textContent = "DB Test";
    testBtn.style.cssText = `
      background: #666;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    `;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Speichern";
    saveBtn.style.cssText = `
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    `;

    // Message container
    const messageContainer = document.createElement("div");
    messageContainer.id = "options-message-container";

    // Save functionality
    saveBtn.onclick = async () => {
      try {
        const w_cat = parseFloat(
          (document.getElementById("w_cat") as HTMLInputElement).value
        );
        const w_evt = parseFloat(
          (document.getElementById("w_evt") as HTMLInputElement).value
        );
        const w_aff = parseFloat(
          (document.getElementById("w_aff") as HTMLInputElement).value
        );
        const sum = w_cat + w_evt + w_aff;

        if (Math.abs(sum - 1) > 0.0001) {
          showMessage(
            messageContainer,
            `Summe der Gewichte muss 1 sein. Aktuell: ${sum.toFixed(2)}`,
            "error"
          );
          return;
        }

        settings.weights = {
          categories: w_cat,
          events: w_evt,
          affinity: w_aff,
        };
        settings.decay = {
          mode: (document.getElementById("d_mode") as HTMLSelectElement)
            .value as any,
          decayStartDays: parseInt(
            (document.getElementById("d_start") as HTMLInputElement).value,
            10
          ),
          halfLifeDays: parseInt(
            (document.getElementById("d_half") as HTMLInputElement).value,
            10
          ),
        };
        settings.anonymousMode = (
          document.getElementById("anonymous-mode") as HTMLInputElement
        ).checked;

        await putSettings(db, settings);

        // Update global anonymous mode state
        anonymousMode = settings.anonymousMode;
        applyAnonymousModeToLinkedIn();

        showMessage(
          messageContainer,
          "Einstellungen erfolgreich gespeichert!",
          "success"
        );
      } catch (error) {
        showMessage(
          messageContainer,
          "Fehler beim Speichern der Einstellungen",
          "error"
        );
      }
    };

    // Export functionality
    exportBtn.onclick = async () => {
      try {
        exportBtn.disabled = true;
        exportBtn.textContent = "Exportiere...";

        const contacts = await getAllContacts(db);
        const events = await getAllEvents(db);

        const exportData = {
          version: "1.0",
          settings: settings,
          contacts: contacts,
          events: events,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `linkedin-connections-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessage(
          messageContainer,
          `Export erfolgreich! ${contacts.length} Kontakte und ${events.length} Events exportiert.`,
          "success"
        );
      } catch (error) {
        console.error("Export error:", error);
        showMessage(
          messageContainer,
          "Fehler beim Exportieren der Daten",
          "error"
        );
      } finally {
        exportBtn.disabled = false;
        exportBtn.textContent = "Daten exportieren";
      }
    };

    // Import functionality
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    importBtn.onclick = () => {
      fileInput.click();
    };

    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      try {
        importBtn.disabled = true;
        importBtn.textContent = "Importiere...";

        const text = await file.text();
        const importData = JSON.parse(text);

        if (importData.version !== "1.0") {
          throw new Error("Unsupported export version");
        }

        await clearAllContacts(db);
        await clearAllEvents(db);
        await importContacts(db, importData.contacts);
        await importEvents(db, importData.events);

        showMessage(
          messageContainer,
          `Import erfolgreich! ${importData.contacts.length} Kontakte und ${importData.events.length} Events importiert.`,
          "success"
        );
      } catch (error) {
        showMessage(
          messageContainer,
          `Fehler beim Importieren: ${
            error instanceof Error ? error.message : "Unbekannter Fehler"
          }`,
          "error"
        );
      } finally {
        importBtn.disabled = false;
        importBtn.textContent = "Daten importieren";
        target.value = "";
      }
    };

    // Test functionality
    testBtn.onclick = async () => {
      try {
        testBtn.disabled = true;
        testBtn.textContent = "Teste...";

        const contacts = await getAllContacts(db);
        const events = await getAllEvents(db);

        console.log("Contacts:", contacts);
        console.log("Events:", events);

        showMessage(
          messageContainer,
          `DB Test: ${contacts.length} Kontakte, ${events.length} Events gefunden. Siehe Konsole für Details.`,
          "success"
        );
      } catch (error) {
        console.error("DB Test error:", error);
        showMessage(
          messageContainer,
          `DB Test Fehler: ${
            error instanceof Error ? error.message : "Unbekannter Fehler"
          }`,
          "error"
        );
      } finally {
        testBtn.disabled = false;
        testBtn.textContent = "DB Test";
      }
    };

    // Helper function to show messages
    function showMessage(
      container: HTMLElement,
      message: string,
      type: "success" | "error"
    ) {
      const msgDiv = document.createElement("div");
      msgDiv.textContent = message;
      msgDiv.style.cssText = `
        color: ${type === "success" ? "#155724" : "#dc3545"};
        font-size: 14px;
        margin-top: 8px;
        padding: 8px 12px;
        background: ${type === "success" ? "#d4edda" : "#f8d7da"};
        border: 1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"};
        border-radius: 4px;
      `;
      container.appendChild(msgDiv);

      setTimeout(() => {
        if (container.contains(msgDiv)) {
          container.removeChild(msgDiv);
        }
      }, 5000);
    }

    buttonContainer.appendChild(exportBtn);
    buttonContainer.appendChild(importBtn);
    buttonContainer.appendChild(testBtn);
    buttonContainer.appendChild(saveBtn);

    exportSection.appendChild(exportTitle);
    exportSection.appendChild(buttonContainer);
    exportSection.appendChild(messageContainer);

    container.appendChild(title);
    container.appendChild(weightsSection);
    container.appendChild(decaySection);
    container.appendChild(privacySection);
    container.appendChild(exportSection);
  } catch (error) {
    console.error("Error initializing options:", error);
    container.innerHTML = `<p style="color: red;">Fehler beim Laden der Einstellungen: ${error}</p>`;
  }
}
