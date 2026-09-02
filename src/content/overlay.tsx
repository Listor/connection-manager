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
import { extractDisplayName, isJunkName } from "./dom-selectors";
import { categoryIconSvg } from "./category-icons";
import { getShadowDOMCSS } from "../styles/shadow-dom";
// Use Chrome API with Firefox compatibility
declare const browser: typeof chrome;
const api = typeof browser !== "undefined" ? browser : chrome;

let shadowRoot: ShadowRoot | null = null;
let container: HTMLDivElement | null = null;
let hideTimer: number | null = null;
let exitTimer: number | null = null;
let currentProfileUrl: string | null = null; // Track which profile is currently shown
let currentAnchor: HTMLElement | null = null; // Track the current anchor element
let optionsOverlay: HTMLDivElement | null = null; // Options overlay
let anonymousMode = false; // Track anonymous mode setting
let bubbleEl: HTMLDivElement | null = null; // Small hover bubble that opens the card
let bubbleAnchor: HTMLElement | null = null;
let bubbleProfileUrl: string | null = null;
let bubbleHideTimer: number | null = null;
// Where the card sits relative to its anchor — captured from the bubble
// position at click time so the card expands out of the bubble
let cardOffset: { dx: number; dy: number } | null = null;

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
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  style.textContent = getShadowDOMCSS();

  shadowRoot!.append(style, container);
}

function positionOverlay(
  rect: DOMRect,
  size?: { width: number; height: number }
) {
  if (!container) return;

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Use measured overlay dimensions when available, estimate otherwise
  const overlayWidth = size?.width || 380;
  const overlayHeight = size?.height || 140;

  let left: number;
  let top: number;
  if (cardOffset) {
    // Card opens at the bubble's position and follows the anchor on scroll
    left = rect.left + cardOffset.dx;
    top = rect.top + cardOffset.dy;
  } else {
    left = rect.left;
    top = rect.top + rect.height + 10; // 10px below the link
  }

  // Adjust if overlay would go off-screen to the left
  if (left < 12) {
    left = 12;
  }

  // Adjust if overlay would go off-screen to the right
  if (left + overlayWidth > viewportWidth - 12) {
    left = viewportWidth - overlayWidth - 12;
  }

  // If overlay would go off-screen at the bottom, move it up
  if (top + overlayHeight > viewportHeight - 12) {
    top = cardOffset
      ? viewportHeight - overlayHeight - 12
      : rect.top - overlayHeight - 10; // 10px above the link
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

// Reposition using the rendered card's real size and the anchor's current rect
function repositionToAnchor() {
  if (!container || !currentAnchor || !container.firstElementChild) return;
  const rect = currentAnchor.getBoundingClientRect();
  const cardRect = (
    container.firstElementChild as HTMLElement
  ).getBoundingClientRect();
  positionOverlay(rect, { width: cardRect.width, height: cardRect.height });
}

const detailsIconSvg = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
`;

function positionBubble() {
  if (!bubbleEl || !bubbleAnchor) return;
  const rect = bubbleAnchor.getBoundingClientRect();
  const width = bubbleEl.offsetWidth || 28;
  const height = bubbleEl.offsetHeight || 28;

  // Above the top-left corner of the link
  let left = rect.left;
  let top = rect.top - height - 6;

  if (left < 4) left = 4;
  if (left + width > window.innerWidth - 4) {
    left = window.innerWidth - width - 4;
  }
  // Flip below the link when there is no room above
  if (top < 4) top = rect.bottom + 6;

  bubbleEl.style.left = `${left}px`;
  bubbleEl.style.top = `${top}px`;
}

function hideBubble() {
  clearBubbleHide();
  bubbleAnchor = null;
  bubbleProfileUrl = null;
  if (bubbleEl) bubbleEl.style.display = "none";
}

function clearBubbleHide() {
  if (bubbleHideTimer) {
    clearTimeout(bubbleHideTimer);
    bubbleHideTimer = null;
  }
}

export function scheduleBubbleHide() {
  clearBubbleHide();
  // Delay long enough to travel from the link into the bubble
  bubbleHideTimer = window.setTimeout(hideBubble, 250);
}

export function showBubble(anchor: HTMLElement, profileUrl: string) {
  ensureOverlayHost();
  if (!shadowRoot) return;

  // No bubble while a card is open
  if (container && container.childElementCount > 0) return;

  clearBubbleHide();

  if (!bubbleEl) {
    bubbleEl = document.createElement("div");
    bubbleEl.className = "details-bubble";
    bubbleEl.title = "Details anzeigen";
    bubbleEl.innerHTML = detailsIconSvg;
    bubbleEl.addEventListener("mouseenter", clearBubbleHide);
    bubbleEl.addEventListener("mouseleave", () => scheduleBubbleHide());
    bubbleEl.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetAnchor = bubbleAnchor;
      const targetUrl = bubbleProfileUrl;
      // The card expands out of the bubble's position
      const origin = {
        left: parseFloat(bubbleEl!.style.left) || 0,
        top: parseFloat(bubbleEl!.style.top) || 0,
      };
      hideBubble();
      if (targetAnchor && targetUrl) {
        showOverlay(targetAnchor, targetUrl, origin);
      }
    });
    shadowRoot.appendChild(bubbleEl);
  }

  bubbleAnchor = anchor;
  bubbleProfileUrl = profileUrl;
  bubbleEl.style.display = "flex";
  // Restart the fade-up animation on every appearance
  bubbleEl.style.animation = "none";
  void bubbleEl.offsetWidth;
  bubbleEl.style.animation = "";
  positionBubble();
}

// Keep the overlay attached to its anchor while the page scrolls or resizes
function repositionAll() {
  repositionToAnchor();
  positionBubble();
}
window.addEventListener("scroll", repositionAll, {
  capture: true,
  passive: true,
});
window.addEventListener("resize", repositionAll, { passive: true });

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

function getCategoryLabel(categoryId: string, settings: any): string {
  const category = settings.categories.find((c: any) => c.id === categoryId);
  return category?.label_de || categoryId;
}

type CardData = {
  profileUrl: string;
  name: string;
  scoreDisplay: string;
  badgeDisplay: string;
  interactionText: string;
  categoryId: string;
  categoryColor: string;
  categoryLabel: string;
  notes: string;
  contact?: ContactDoc;
};

let currentCardData: CardData | null = null;

// The card element persists between skeleton and data render so the
// entrance animation only plays once and listeners bind only once
function ensureCard(): HTMLDivElement | null {
  if (!container) return null;
  let card = container.firstElementChild as HTMLDivElement | null;
  if (!card) {
    card = document.createElement("div");
    card.className = "card";
    card.addEventListener("mouseenter", clearHide);
    card.addEventListener("mouseleave", () => scheduleHide());
    card.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON" && currentCardData) {
        const action = target.getAttribute("data-act");
        await handleButtonClick(
          action,
          currentCardData.profileUrl,
          currentCardData.contact,
          currentCardData.name
        );
      }
    });
    container.appendChild(card);
  }
  return card;
}

function nameMarkup(name: string): string {
  const value = name || '<span class="skeleton" style="width: 120px"></span>';
  return `<div style="position: relative;">${value}${
    anonymousMode ? '<div class="anonymous-overlay"></div>' : ""
  }</div>`;
}

// Placeholder card rendered synchronously so the tooltip appears instantly
function renderCardSkeleton(name: string) {
  const card = ensureCard();
  if (!card) return;
  currentCardData = null;
  card.innerHTML = `
    <div class="category-accent"></div>
    <div class="card-content">
      <div class="row">${nameMarkup(name)}<div class="score"><span class="skeleton" style="width: 36px"></span></div></div>
      <div class="interaction-row">
        <div class="interaction-text"><span class="skeleton" style="width: 150px"></span></div>
        <span class="skeleton" style="width: 26px; height: 26px; border-radius: 8px;"></span>
      </div>
      <div class="small"></div>
    </div>
    <div class="button-row">
      <button data-act="add-evt" disabled>Interaktion +</button>
      <button data-act="add-note" disabled>Notiz +</button>
      <button data-act="details" disabled>Details</button>
    </div>
  `;
  repositionToAnchor();
}

function renderCard(data: CardData) {
  const card = ensureCard();
  if (!card) return;
  currentCardData = data;
  card.innerHTML = `
    <div class="category-accent" style="background: ${data.categoryColor}"></div>
    <div class="card-content">
      <div class="row">${nameMarkup(data.name)}<div class="score"><span class="score-number">${data.scoreDisplay}</span><span class="score-badge">${data.badgeDisplay}</span></div></div>
      <div class="interaction-row">
        <div class="interaction-text">${data.interactionText}</div>
        <span class="category-chip" title="${data.categoryLabel}" style="color: ${data.categoryColor}; background: color-mix(in srgb, ${data.categoryColor} 14%, transparent); border-color: color-mix(in srgb, ${data.categoryColor} 35%, transparent);">${categoryIconSvg(data.categoryId)}</span>
      </div>
      <div class="small">${data.notes}</div>
    </div>
    <div class="button-row">
      <button data-act="add-evt">Interaktion +</button>
      <button data-act="add-note">Notiz +</button>
      <button data-act="details">Details</button>
    </div>
  `;
  repositionToAnchor();
}

// Loads the contact and computes everything the card displays
async function loadCardData(
  anchor: HTMLElement,
  profileUrl: string
): Promise<CardData> {
  const db = await openDb();
  const settings = await getSettings(db);
  let contact = (await getContact(db, profileUrl)) as ContactDoc | undefined;
  const events = await listEventsFor(db, profileUrl);

  let name = contact?.displayName;
  // Repair records saved with polluted names (action labels, a11y text)
  if (name && isJunkName(name)) name = undefined;

  // Stored names are write-once; extraction only fills missing names
  if (!name) {
    const extractedName = extractDisplayName(anchor as HTMLAnchorElement);
    if (extractedName) {
      if (contact) {
        contact.displayName = extractedName;
      } else {
        contact = {
          profileUrl,
          displayName: extractedName,
          categoryId: "acquaintance",
          affinity: 0,
        };
      }
      await putContact(db, contact);
      name = extractedName;
    }
  }

  if (!name) {
    name = anchor.textContent?.trim() || "—";
  }

  const eScore = eventScore(events, new Date(), settings.decay);
  const categoryValue = contact
    ? settings.categories.find((c) => c.id === contact.categoryId)?.value ?? 0
    : 0;
  const affinity = contact?.affinity ?? 0;

  const hasEvents = events.length > 0;
  const hasAffinity = affinity > 0;
  const hasCustomCategory =
    contact?.categoryId && contact.categoryId !== "acquaintance";

  let scoreDisplay: string;
  let badgeDisplay: string;
  if (!hasEvents && !hasAffinity && !hasCustomCategory) {
    scoreDisplay = "N/A";
    badgeDisplay = "";
  } else {
    const total = totalScore(categoryValue, eScore, affinity, settings.weights);
    scoreDisplay = total.toString();
    badgeDisplay = `<span class="badge">${bandLabel(total)}</span>`;
  }

  const categoryId = contact?.categoryId || "acquaintance";

  return {
    profileUrl,
    name,
    scoreDisplay,
    badgeDisplay,
    interactionText: events.length
      ? `Letzte Interaktion: ${new Date(
          Math.max(...events.map((e) => +new Date(e.timestamp)))
        ).toLocaleDateString()}`
      : "Keine Interaktionen",
    categoryId,
    categoryColor: getCategoryColor(categoryId, settings),
    categoryLabel: getCategoryLabel(categoryId, settings),
    notes: contact?.notes ? contact.notes.split("\n")[0] : "",
    contact,
  };
}

async function refreshOverlayAtLastPosition() {
  if (!currentAnchor || !currentProfileUrl) return;
  const profileUrl = currentProfileUrl;
  const anchor = currentAnchor;
  const data = await loadCardData(anchor, profileUrl);
  if (currentProfileUrl !== profileUrl || currentAnchor !== anchor) return;
  renderCard(data);
}

export async function showOverlay(
  anchor: HTMLElement,
  profileUrl: string,
  origin?: { left: number; top: number }
) {
  ensureOverlayHost();
  if (!container || !shadowRoot) return;

  clearHide();

  if (origin) {
    const rect = anchor.getBoundingClientRect();
    cardOffset = { dx: origin.left - rect.left, dy: origin.top - rect.top };
  }

  // Moving between anchors of the same profile keeps the visible card
  const alreadyVisible =
    currentProfileUrl === profileUrl && container.childElementCount > 0;
  currentProfileUrl = profileUrl;
  currentAnchor = anchor;
  if (alreadyVisible) {
    repositionToAnchor();
    return;
  }

  // Instant feedback with whatever the DOM already provides
  renderCardSkeleton(extractDisplayName(anchor as HTMLAnchorElement) ?? "");

  const data = await loadCardData(anchor, profileUrl);

  // Skip rendering if a newer hover superseded this one during the DB load
  if (currentProfileUrl !== profileUrl || currentAnchor !== anchor) return;
  renderCard(data);
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
        <label>Für</label>
        <div style="position: relative; font-size: 13px; font-weight: 600;">${name}${
    anonymousMode ? '<div class="anonymous-overlay"></div>' : ""
  }</div>
      </div>
      <div class="dialog-row">
        <label for="event-type">Typ</label>
        <select id="event-type">
          <option value="meeting">Treffen</option>
          <option value="call">Telefonat</option>
          <option value="lunch">Mittagessen</option>
        </select>
      </div>
      <div class="dialog-row">
        <label>Bewertung</label>
        <div class="points-grid">
          <button data-points="1">1</button>
          <button data-points="2">2</button>
          <button data-points="3" class="selected">3</button>
          <button data-points="4">4</button>
          <button data-points="5">5</button>
        </div>
      </div>
           <div class="dialog-row">
         <label for="event-datetime">Datum & Uhrzeit</label>
         <input type="datetime-local" id="event-datetime" />
       </div>
       <div class="dialog-row">
         <label for="event-note">Notiz (optional)</label>
         <textarea id="event-note" placeholder="Details zur Interaktion..."></textarea>
       </div>
      <div class="dialog-buttons">
        <button class="secondary" id="cancel-event">Abbrechen</button>
        <button class="primary" id="save-event">Speichern</button>
      </div>
      <div class="category-accent" style="background: ${categoryColor};"></div>
    `;

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
      await refreshOverlayAtLastPosition();
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
         <label for="contact-note">Notiz</label>
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
       <div class="category-accent" style="background: ${categoryColor};"></div>
     `;

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
        await refreshOverlayAtLastPosition();
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
      await refreshOverlayAtLastPosition();
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
            <button class="delete-event" data-event-id="${
              event.id
            }"><span class="delete-event__label">×</span></button>
          </div>
        `
          )
          .join("")
      : '<div class="no-events">Keine Interaktionen</div>';

  dialog.innerHTML = `
      <h3>Kontakt Details</h3>
      <div class="dialog-row">
        <label for="contact-name">Name</label>
        <div style="position: relative;">
          <input type="text" id="contact-name" />
          ${anonymousMode ? '<div class="anonymous-overlay"></div>' : ""}
        </div>
      </div>
      <div class="dialog-row">
        <label>URL</label>
        <div class="url-text" style="position: relative;">${profileUrl}${
    anonymousMode ? '<div class="anonymous-overlay"></div>' : ""
  }</div>
      </div>
           <div class="dialog-row">
         <label for="contact-category">Kategorie</label>
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
        <label>Empfinden</label>
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
        <label>Notizen</label>
        <div style="white-space: pre-wrap; max-height: 100px; overflow-y: auto;">${
          contact?.notes || "Keine"
        }</div>
      </div>
      <div class="dialog-row">
        <label>Interaktionen (${events.length})</label>
        <div class="events-list">
          ${eventsList}
        </div>
      </div>
      <div class="dialog-buttons">
        <button class="secondary" id="close-details">Schließen</button>
      </div>
    `;

  // Add category accent to the dialog
  const categoryColor = getCategoryColor(
    contact?.categoryId || "acquaintance",
    settings
  );
  dialog.style.position = "relative";
  const accentElement = document.createElement("div");
  accentElement.className = "category-accent";
  accentElement.id = "details-category-accent";
  accentElement.style.background = categoryColor;
  dialog.appendChild(accentElement);

  dialogOverlay.appendChild(dialog);
  shadowRoot.appendChild(dialogOverlay);

  // Event handlers
  const closeBtn = dialog.querySelector("#close-details") as HTMLButtonElement;
  const nameInput = dialog.querySelector("#contact-name") as HTMLInputElement;
  // Value set via property, not markup, so names with quotes stay intact
  nameInput.value = name;

  nameInput.addEventListener("change", async () => {
    const newName = nameInput.value.trim();
    if (!newName || newName === name) {
      nameInput.value = name;
      return;
    }
    try {
      let contact = await getContact(db, profileUrl);
      if (!contact) {
        contact = {
          profileUrl,
          displayName: newName,
          categoryId: "acquaintance",
          affinity: 0,
        };
      } else {
        contact.displayName = newName;
      }
      await putContact(db, contact);
      name = newName;
      await refreshOverlayAtLastPosition();
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Fehler beim Aktualisieren des Namens");
    }
  });

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

      // Update the category accent immediately
      const accentElement = dialog.querySelector(
        "#details-category-accent"
      ) as HTMLElement;
      if (accentElement) {
        accentElement.style.background = getCategoryColor(
          newCategoryId,
          settings
        );
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
      // Get the button element (not the span inside it)
      const button = (e.target as HTMLElement).closest(
        ".delete-event"
      ) as HTMLElement;
      const eventId = button?.getAttribute("data-event-id");
      if (eventId && confirm("Interaktion wirklich löschen?")) {
        try {
          await deleteEvent(db, eventId);
          // Refresh the dialog
          shadowRoot!.removeChild(dialogOverlay);
          await refreshOverlayAtLastPosition();
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
  if (exitTimer) {
    clearTimeout(exitTimer);
    exitTimer = null;
  }
  // Cancel an in-flight exit animation when the pointer returns
  container?.firstElementChild?.classList.remove("card-out");
  // Remove bridge when clearing hide
  const bridge = document.getElementById("li-notes-bridge");
  if (bridge) {
    bridge.remove();
  }
}

function hideCardNow() {
  const finish = () => {
    if (container) container.innerHTML = "";
    const bridge = document.getElementById("li-notes-bridge");
    if (bridge) {
      bridge.remove();
    }
    currentProfileUrl = null;
    currentAnchor = null;
    currentCardData = null;
    cardOffset = null;
  };
  const card = container?.firstElementChild as HTMLElement | null;
  if (card) {
    card.classList.add("card-out");
    exitTimer = window.setTimeout(finish, 140);
  } else {
    finish();
  }
}

export function scheduleHide() {
  hideTimer = window.setTimeout(hideCardNow, 200); // 200ms delay
}

// The card opens via click, so it also closes on a click outside of it
document.addEventListener(
  "click",
  (e) => {
    if (!container || container.childElementCount === 0) return;
    const host = document.getElementById("li-notes-overlay-host");
    if (host && e.composedPath().includes(host)) return;
    clearHide();
    hideCardNow();
  },
  true
);

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
    background: rgba(8, 9, 12, 0.6);
    backdrop-filter: blur(4px);
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  // Create options container
  const optionsContainer = document.createElement("div");
  optionsContainer.style.cssText = `
    background: #14161d;
    color: #f2f4f8;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
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
    color: #a3abbd;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  `;

  closeBtn.onmouseenter = () => {
    closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
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
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #f2f4f8;
      text-align: center;
    `;

    // Create weights section
    const weightsSection = document.createElement("div");
    weightsSection.style.cssText = `
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
    `;

    const weightsTitle = document.createElement("h2");
    weightsTitle.textContent = "Gewichte";
    weightsTitle.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a3abbd;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
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
        color: #a3abbd;
      `;

      const input = document.createElement("input");
      input.type = "number";
      input.step = "0.01";
      input.value = value.toString();
      input.id = id;
      input.style.cssText = `
        width: 120px;
        padding: 8px 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.05);
        color: #f2f4f8;
      `;

      const helpText = document.createElement("div");
      helpText.textContent = `Gewichtung für ${label.toLowerCase()} (0-1)`;
      helpText.style.cssText = `
        font-size: 12px;
        color: #737d91;
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
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
    `;

    const decayTitle = document.createElement("h2");
    decayTitle.textContent = "Verfall";
    decayTitle.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a3abbd;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
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
        color: #a3abbd;
      `;

      const input = document.createElement("input");
      input.type = "number";
      input.value = value.toString();
      input.id = id;
      input.style.cssText = `
        width: 120px;
        padding: 8px 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.05);
        color: #f2f4f8;
      `;

      const helpEl = document.createElement("div");
      helpEl.textContent = helpText;
      helpEl.style.cssText = `
        font-size: 12px;
        color: #737d91;
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
      color: #a3abbd;
    `;

    const modeSelect = document.createElement("select");
    modeSelect.id = "d_mode";
    modeSelect.style.cssText = `
      width: 120px;
      padding: 8px 12px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      font-size: 13px;
      background: rgba(255, 255, 255, 0.05);
      color: #f2f4f8;
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
      color: #737d91;
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
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
    `;

    const privacyTitle = document.createElement("h2");
    privacyTitle.textContent = "Datenschutz";
    privacyTitle.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a3abbd;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
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
      accent-color: #7c7ff2;
    `;

    const privacyLabel = document.createElement("label");
    privacyLabel.textContent = "Anonymus Modus";
    privacyLabel.htmlFor = "anonymous-mode";
    privacyLabel.style.cssText = `
      font-weight: 500;
      color: #a3abbd;
      cursor: pointer;
    `;

    const privacyHelp = document.createElement("div");
    privacyHelp.textContent =
      "Überdeckt alle Namen auf LinkedIn mit einem geblurten schwarzen Balken";
    privacyHelp.style.cssText = `
      font-size: 12px;
      color: #737d91;
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
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
    `;

    const exportTitle = document.createElement("h2");
    exportTitle.textContent = "Daten Export/Import";
    exportTitle.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a3abbd;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
    `;

    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
    `;

    const ghostButtonCss = `
      background: rgba(255, 255, 255, 0.05);
      color: #f2f4f8;
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.15s ease, border-color 0.15s ease;
    `;

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Daten exportieren";
    exportBtn.style.cssText = ghostButtonCss;

    const importBtn = document.createElement("button");
    importBtn.textContent = "Daten importieren";
    importBtn.style.cssText = ghostButtonCss;

    const testBtn = document.createElement("button");
    testBtn.textContent = "DB Test";
    testBtn.style.cssText = ghostButtonCss;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Speichern";
    saveBtn.style.cssText = `
      background: linear-gradient(135deg, #7c7ff2, #5b8cf7);
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      box-shadow: 0 2px 12px rgba(99, 102, 241, 0.35);
      transition: filter 0.15s ease;
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
        color: ${type === "success" ? "#4ade80" : "#f87171"};
        font-size: 13px;
        margin-top: 8px;
        padding: 8px 12px;
        background: ${
          type === "success"
            ? "rgba(74, 222, 128, 0.12)"
            : "rgba(248, 113, 113, 0.12)"
        };
        border: 1px solid ${
          type === "success"
            ? "rgba(74, 222, 128, 0.3)"
            : "rgba(248, 113, 113, 0.3)"
        };
        border-radius: 8px;
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
