import { findProfileAnchors } from "./dom-selectors";
import { normalizeLinkedInProfileUrl } from "./url-normalizer";
import {
  scheduleHide,
  showOverlay,
  isRelatedToCurrentProfile,
} from "./overlay";

// Make normalizeLinkedInProfileUrl available globally for hover detection
(window as any).normalizeLinkedInProfileUrl = normalizeLinkedInProfileUrl;

function bind(root: Document | HTMLElement) {
  for (const a of findProfileAnchors(root)) {
    if ((a as any).dataset.liNotesBound === "1") continue;
    (a as any).dataset.liNotesBound = "1";
    const url = a.dataset.liNotesProfile || normalizeLinkedInProfileUrl(a.href);
    if (!url) continue;

    a.addEventListener("mouseenter", () => {
      // Show overlay immediately
      showOverlay(a, url);
    });

    a.addEventListener("mouseleave", (e) => {
      const relatedTarget = e.relatedTarget as HTMLElement;

      // Check if we're moving to the overlay
      const overlayHost = document.getElementById("li-notes-overlay-host");
      if (
        relatedTarget &&
        overlayHost &&
        (overlayHost.contains(relatedTarget) || overlayHost === relatedTarget)
      ) {
        return; // Don't hide if moving to the overlay
      }

      // Check if we're moving to the invisible bridge
      const bridge = document.getElementById("li-notes-bridge");
      if (
        relatedTarget &&
        bridge &&
        (bridge.contains(relatedTarget) || bridge === relatedTarget)
      ) {
        return; // Don't hide if moving to the bridge
      }

      // Check if we're moving to another element with the same profile URL
      if (relatedTarget && isRelatedToCurrentProfile(relatedTarget)) {
        return; // Don't hide if moving to a related element
      }

      // Schedule hide with delay
      scheduleHide();
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
