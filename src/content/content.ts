import {
  findProfileAnchors,
  extractDisplayName,
  isActionButtonLabel,
} from "./dom-selectors";
import { normalizeLinkedInProfileUrl } from "./url-normalizer";
import { openDb, getContact } from "../types/db/idb";
import {
  showBubble,
  scheduleBubbleHide,
  isRelatedToCurrentProfile,
} from "./overlay";

// Make normalizeLinkedInProfileUrl available globally for hover detection
(window as any).normalizeLinkedInProfileUrl = normalizeLinkedInProfileUrl;

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

// A link only earns a bubble when it visibly shows the person: it contains
// an image, or its text shows the person's name — the stored one for
// contacts already in the db, an extractable one otherwise
async function isEligibleAnchor(
  a: HTMLAnchorElement,
  url: string
): Promise<boolean> {
  if (a.querySelector("img")) return true;

  const text = normalizeText(a.textContent ?? "");
  if (!text) return false;

  try {
    const db = await openDb();
    const contact = await getContact(db, url);
    // Names polluted by action-button labels don't count as stored names
    if (contact?.displayName && !isActionButtonLabel(contact.displayName)) {
      return text.includes(normalizeText(contact.displayName));
    }
  } catch {
    // DB unavailable — fall through to the extraction check
  }

  // Unknown contact: the link itself must show an extractable name.
  // Requiring the name in the link's own text excludes names that
  // extraction pulled from surrounding context.
  const extracted = extractDisplayName(a);
  return !!extracted && text.includes(normalizeText(extracted));
}

function bind(root: Document | HTMLElement) {
  for (const a of findProfileAnchors(root)) {
    if ((a as any).dataset.liNotesBound === "1") continue;
    (a as any).dataset.liNotesBound = "1";
    const url = a.dataset.liNotesProfile || normalizeLinkedInProfileUrl(a.href);
    if (!url) continue;

    a.addEventListener("mouseenter", async () => {
      if (!(await isEligibleAnchor(a, url))) return;
      // The pointer may have moved on during the async check
      if (!a.matches(":hover")) return;
      // Show the small details bubble; the card opens on bubble click
      showBubble(a, url);
    });

    a.addEventListener("mouseleave", (e) => {
      const relatedTarget = e.relatedTarget as HTMLElement;

      // Check if we're moving to the overlay (bubble or card)
      const overlayHost = document.getElementById("li-notes-overlay-host");
      if (
        relatedTarget &&
        overlayHost &&
        (overlayHost.contains(relatedTarget) || overlayHost === relatedTarget)
      ) {
        return; // Don't hide if moving to the overlay
      }

      // Check if we're moving to another element with the same profile URL
      if (relatedTarget && isRelatedToCurrentProfile(relatedTarget)) {
        return; // Don't hide if moving to a related element
      }

      // Schedule bubble hide with delay
      scheduleBubbleHide();
    });
  }
}

function onMutations(mutations: MutationRecord[]) {
  for (const m of mutations) {
    if (m.addedNodes) {
      m.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) bind(node);
      });
    }
  }
}

(function main() {
  const observer = new MutationObserver(onMutations);
  observer.observe(document.body, { childList: true, subtree: true });
  bind(document);
})();
