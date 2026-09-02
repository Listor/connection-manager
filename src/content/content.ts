import {
  findProfileAnchors,
  extractDisplayName,
  isJunkName,
} from "./dom-selectors";
import { normalizeLinkedInProfileUrl } from "./url-normalizer";
import {
  openDb,
  getContact,
  getContactByUrlOrAlias,
  addAliasUrl,
  deleteContact,
  findContactsByName,
  listEventsFor,
} from "../types/db/idb";
import type { ContactDoc } from "../types/index";
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
    // Polluted stored names (action labels, a11y text) don't count
    if (contact?.displayName && !isJunkName(contact.displayName)) {
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

// A contact stored under a different URL (vanity vs. hashed message URL)
// is found by its display name so both surfaces share one record
async function findUniqueContactByName(
  name: string
): Promise<ContactDoc | null> {
  try {
    const db = await openDb();
    const matches = await findContactsByName(db, name);
    if (matches.length === 1) return matches[0];
    // Vanity/hashed duplicates of the same person: the vanity record wins.
    // Truly ambiguous names (several vanity records) never merge.
    const vanity = matches.filter(
      (c) => !/\/in\/ACoAA/.test(c.profileUrl)
    );
    return vanity.length === 1 ? vanity[0] : null;
  } catch {
    return null;
  }
}

// Message surfaces link profiles by hashed id (/in/ACoAA...), not by the
// vanity slug the contact was stored under. Aliases resolve known hashed
// URLs directly; a unique display-name match resolves new ones and is
// persisted as an alias so the next encounter no longer needs the name.
function isHashedProfileUrl(url: string): boolean {
  return /\/in\/ACoAA/i.test(url);
}

// A record with only default values holds nothing the user entered
async function isEmptyRecord(
  db: IDBDatabase,
  c: ContactDoc
): Promise<boolean> {
  if (c.notes || (c.affinity ?? 0) > 0 || c.categoryId !== "acquaintance") {
    return false;
  }
  const events = await listEventsFor(db, c.profileUrl);
  return events.length === 0;
}

// Hashed-keyed records without any user data are artifacts of the old
// extraction; fold them into the person's real record when one exists
async function absorbEmptyHashedRecord(
  db: IDBDatabase,
  known: ContactDoc,
  a: HTMLAnchorElement,
  url: string
): Promise<string | null> {
  if (!isHashedProfileUrl(known.profileUrl)) return null;
  if (!(await isEmptyRecord(db, known))) return null;
  const name =
    extractDisplayName(a) ??
    (isJunkName(known.displayName) ? null : known.displayName);
  if (!name) return null;
  const match = await findUniqueContactByName(name);
  if (!match || match.profileUrl === known.profileUrl) return null;
  await deleteContact(db, known.profileUrl);
  await addAliasUrl(db, match, url);
  return match.profileUrl;
}

async function resolveContactUrl(
  a: HTMLAnchorElement,
  url: string
): Promise<string> {
  let db: IDBDatabase;
  try {
    db = await openDb();
    const known = await getContactByUrlOrAlias(db, url);
    if (known) {
      try {
        const absorbed = await absorbEmptyHashedRecord(db, known, a, url);
        if (absorbed) return absorbed;
      } catch {
        // Repair is best-effort; the direct hit still resolves
      }
      return known.profileUrl;
    }
  } catch {
    return url;
  }
  const name = extractDisplayName(a);
  if (!name) return url;
  const match = await findUniqueContactByName(name);
  if (!match) return url;
  try {
    await addAliasUrl(db, match, url);
  } catch {
    // Alias persistence is an optimization; resolution already succeeded
  }
  return match.profileUrl;
}

function onHoverSourceLeave(e: MouseEvent) {
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
}

type BindRoot = Document | HTMLElement | ShadowRoot;

function bind(root: BindRoot) {
  for (const a of findProfileAnchors(root)) {
    if ((a as any).dataset.liNotesBound === "1") continue;
    (a as any).dataset.liNotesBound = "1";
    const url = a.dataset.liNotesProfile || normalizeLinkedInProfileUrl(a.href);
    if (!url) continue;

    a.addEventListener("mouseenter", async () => {
      const resolved = await resolveContactUrl(a, url);
      if (!(await isEligibleAnchor(a, resolved))) return;
      // The pointer may have moved on during the async checks
      if (!a.matches(":hover")) return;
      a.dataset.liNotesProfile = resolved;
      // Show the small details bubble; the card opens on bubble click
      showBubble(a, resolved);
    });

    a.addEventListener("mouseleave", onHoverSourceLeave);
  }
}

// Conversation cards in the messages list carry no profile link at all,
// only the participant's name — known contacts are matched by that name
const CONVO_NAME_SELECTOR =
  ".msg-conversation-listitem__participant-names, .msg-conversation-card__participant-names";

function bindConversationCards(root: BindRoot) {
  const nameEls = Array.from(
    root.querySelectorAll<HTMLElement>(CONVO_NAME_SELECTOR)
  );
  if (root instanceof HTMLElement && root.matches(CONVO_NAME_SELECTOR)) {
    nameEls.push(root);
  }

  for (const nameEl of nameEls) {
    const card =
      nameEl.closest<HTMLElement>(".msg-conversation-listitem__link") ??
      nameEl.closest<HTMLElement>(".msg-conversation-card") ??
      nameEl.parentElement;
    if (!card || card.dataset.liNotesBound === "1") continue;
    card.dataset.liNotesBound = "1";

    card.addEventListener("mouseenter", async () => {
      // Re-query on every hover: LinkedIn reuses card nodes when the list reorders
      const name = card
        .querySelector(CONVO_NAME_SELECTOR)
        ?.textContent?.replace(/\s+/g, " ")
        .trim();
      if (!name) return;
      const contact = await findUniqueContactByName(name);
      if (!contact) return;
      if (!card.matches(":hover")) return;
      card.dataset.liNotesProfile = contact.profileUrl;
      showBubble(card, contact.profileUrl);
    });

    card.addEventListener("mouseleave", onHoverSourceLeave);
  }
}

// The messaging side panel (list, chat popups) on non-messaging routes
// renders inside an open shadow root on #interop-outlet with obfuscated
// class names. Its list rows and popup headers carry no profile link, only
// the person's name in a heading — known contacts are matched by that name.
function bindNameHeadings(root: BindRoot) {
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("h2, h3"))) {
    if (el.dataset.liNotesBound === "1") continue;
    // Headings inside profile links are already covered by anchor binding
    if (el.closest("a")) continue;
    el.dataset.liNotesBound = "1";

    el.addEventListener("mouseenter", async () => {
      const name = el.textContent?.replace(/\s+/g, " ").trim();
      // Anything longer than a name is a message snippet or panel title
      if (!name || name.length > 80) return;
      const contact = await findUniqueContactByName(name);
      if (!contact) return;
      if (!el.matches(":hover")) return;
      el.dataset.liNotesProfile = contact.profileUrl;
      showBubble(el, contact.profileUrl);
    });

    el.addEventListener("mouseleave", onHoverSourceLeave);
  }
}

function bindAll(root: BindRoot, includeNameHeadings: boolean) {
  bind(root);
  bindConversationCards(root);
  if (includeNameHeadings) bindNameHeadings(root);
}

let observer: MutationObserver;
let interopRoot: ShadowRoot | null = null;

const DEBUG = false;
const debugLog: string[] = [];
function dbg(...args: unknown[]) {
  if (!DEBUG) return;
  console.log("[li-notes]", ...args);
  // Console output from the isolated world is hard to reach in some
  // setups; mirror the last entries into the DOM for inspection
  debugLog.push(args.map((a) => String(a)).join(" "));
  document.documentElement.setAttribute(
    "data-li-notes-debug",
    debugLog.slice(-15).join(" || ")
  );
}

// The outlet and its shadow root mount lazily; hook them once they exist
function ensureInteropBinding() {
  const outlet = document.getElementById("interop-outlet");
  const root = outlet?.shadowRoot;
  if (outlet && !root) dbg("outlet found but shadowRoot inaccessible");
  if (!root || root === interopRoot) return;
  interopRoot = root;
  observer.observe(root, { childList: true, subtree: true });
  bindAll(root, true);
  dbg(
    "interop hooked; anchors:",
    root.querySelectorAll('a[href*="/in/"]').length,
    "headings:",
    root.querySelectorAll("h2, h3").length
  );
}

let batchCount = 0;

function onMutations(mutations: MutationRecord[]) {
  batchCount++;
  if (DEBUG && batchCount % 50 === 1) dbg("mutation batch", batchCount);
  // One failing subtree must not kill binding for everything else
  try {
    ensureInteropBinding();
  } catch (err) {
    dbg("ensureInteropBinding failed", err);
  }
  for (const m of mutations) {
    if (m.addedNodes) {
      m.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          try {
            // Name headings only apply inside the interop shadow root;
            // elsewhere they would fire on arbitrary page headings
            bindAll(node, node.getRootNode() instanceof ShadowRoot);
          } catch (err) {
            dbg("bind failed for node", node.tagName, err);
          }
        }
      });
    }
  }
}

(function main() {
  dbg("content script v3 loaded", location.href);
  observer = new MutationObserver(onMutations);
  // Observe the root element, not body: the SPA bootstrap can replace
  // the body node, which would silently detach a body-scoped observer
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  bindAll(document, false);
  ensureInteropBinding();

  // Fallback sweep in case mutations are missed (replaced subtrees,
  // shadow content mounted before its observer hooked). Idempotent —
  // bound elements are skipped via their dataset flag.
  setInterval(() => {
    try {
      bindAll(document, false);
      ensureInteropBinding();
      if (interopRoot) bindAll(interopRoot, true);
    } catch (err) {
      dbg("sweep failed", err);
    }
  }, 4000);
})();
