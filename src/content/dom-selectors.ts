import { normalizeLinkedInProfileUrl } from "./url-normalizer";

// Locale-dependent fallback for older markup without ARIA hints (de/en)
const ACTION_BUTTON_LABELS =
  /^(abschnitt hinzufügen|add profile section|profil verbessern|enhance profile|profil bearbeiten|edit profile|anzeigen als|view as|open to|ressourcen|resources|kontaktinfo|contact info|mehr|more)$/i;

export function isActionButtonLabel(text: string): boolean {
  return ACTION_BUTTON_LABELS.test(text.replace(/\s+/g, " ").trim());
}

// Screen-reader phrases and presence labels that leaked into stored names
// from message anchors before message-specific extraction existed (de/en)
const JUNK_NAME_PATTERNS = [
  /profil von .+ anzeigen/i,
  /view .+ profile/i,
  /^status:/i,
];

export function isJunkName(text: string): boolean {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return true;
  if (isActionButtonLabel(t)) return true;
  return JUNK_NAME_PATTERNS.some((p) => p.test(t));
}

// Detects UI action buttons whose href is a bare profile URL.
// Primary signal: aria-disabled marks link-shaped controls, not navigation links.
function isActionButton(a: HTMLAnchorElement): boolean {
  if (a.hasAttribute("aria-disabled") && !a.querySelector("img")) return true;
  return isActionButtonLabel(a.textContent ?? "");
}

export function* findProfileAnchors(
  root: Document | HTMLElement | ShadowRoot
): Iterable<HTMLAnchorElement> {
  const anchors = root.querySelectorAll('a[href*="/in/"]');
  for (const a of Array.from(anchors)) {
    const href =
      (a as HTMLAnchorElement).href ||
      (a as HTMLAnchorElement).getAttribute("href") ||
      "";
    const norm = normalizeLinkedInProfileUrl(href);
    if (!norm) continue;
    if (isActionButton(a as HTMLAnchorElement)) continue;
    (a as HTMLAnchorElement).dataset.liNotesProfile = norm;
    yield a as HTMLAnchorElement;
  }
}

/**
 * Main function that determines the link type and delegates to specialized
 * extractors. Raw results are refined so screen-reader phrases never pass
 * as names, regardless of which markup variant produced them.
 */
export function extractDisplayName(anchor: HTMLAnchorElement): string | null {
  return refineExtractedName(extractDisplayNameRaw(anchor));
}

// The new messaging surfaces use obfuscated class names, so a11y phrases
// like "Profil von X anzeigen" can reach the generic extractor as plain
// text. Recover the name from the phrase instead of storing it verbatim.
function refineExtractedName(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.replace(/\s+/g, " ").trim();
  const m =
    t.match(/^Profil von (.+) anzeigen$/i) ||
    t.match(/^View (.+?)(?:['’]s)? profile$/i);
  if (m?.[1]) return m[1].trim();
  return isJunkName(t) ? null : t;
}

function extractDisplayNameRaw(anchor: HTMLAnchorElement): string | null {
  const linkType = determineLinkType(anchor);

  switch (linkType) {
    case "comment":
      return extractNameFromCommentLink(anchor);
    case "feed":
      return extractNameFromFeedLink(anchor);
    case "profile":
      return extractNameFromProfileLink(anchor);
    case "search":
      return extractNameFromSearchLink(anchor);
    case "connection":
      return extractNameFromConnectionLink(anchor);
    case "message":
      return extractNameFromMessageLink(anchor);
    case "notification":
      return extractNameFromNotificationLink(anchor);
    default:
      return extractNameFromGenericLink(anchor);
  }
}

/**
 * Determines the type of LinkedIn link based on its structure and context
 */
function determineLinkType(anchor: HTMLAnchorElement): string {
  // Check for comment links
  if (
    anchor.classList.contains("comments-comment-meta__description-container") ||
    anchor.querySelector(".comments-comment-meta__description-title")
  ) {
    return "comment";
  }

  // Check for feed post links
  if (
    anchor.querySelector(".update-components-actor__title") ||
    anchor.querySelector(".feed-shared-actor__title")
  ) {
    return "feed";
  }

  // Check for profile page links
  if (
    anchor.querySelector(".pv-text-details__left-panel h1") ||
    anchor.querySelector(".text-heading-xlarge")
  ) {
    return "profile";
  }

  // Check for search result links
  if (
    anchor.querySelector(".entity-result__title-text") ||
    anchor.querySelector(".search-result__info .actor-name")
  ) {
    return "search";
  }

  // Check for connection links
  if (
    anchor.querySelector(".mn-connection-card__name") ||
    anchor.querySelector(".connection-card__name") ||
    anchor.querySelector(".invitation-card__name")
  ) {
    return "connection";
  }

  // Check for message links
  if (
    anchor.classList.contains("msg-s-event-listitem__link") ||
    anchor.classList.contains("msg-thread__link-to-profile") ||
    anchor.querySelector(".msg-s-message-group__name") ||
    anchor.querySelector(".msg-entity-lockup__entity-title") ||
    anchor.querySelector(".msg-conversations-container__name") ||
    anchor.querySelector(".msg-conversation-card__participant-name") ||
    anchor.querySelector(".msg-conversation-listitem__participant-names") ||
    anchor.querySelector(".msg-conversation-card__participant-names")
  ) {
    return "message";
  }

  // Check for notification links
  if (anchor.querySelector(".notification-actor__name")) {
    return "notification";
  }

  return "generic";
}

/**
 * Extracts name from comment links (new LinkedIn comment structure)
 */
function extractNameFromCommentLink(anchor: HTMLAnchorElement): string | null {
  const nameElement = anchor.querySelector(
    ".comments-comment-meta__description-title"
  );
  if (nameElement) {
    const name = nameElement.textContent?.trim();
    if (name && name.length > 0) {
      return name;
    }
  }

  // Fallback: look for nested anchor with profile URL
  const nestedAnchor = anchor.querySelector('a[href*="/in/"]');
  if (nestedAnchor) {
    return extractNameFromGenericLink(nestedAnchor as HTMLAnchorElement);
  }

  return null;
}

/**
 * Extracts name from feed post links
 */
function extractNameFromFeedLink(anchor: HTMLAnchorElement): string | null {
  // First, look for nested anchor elements that contain the actual name
  const nestedAnchors = anchor.querySelectorAll('a[href*="/in/"]');
  for (const nestedAnchor of Array.from(nestedAnchors)) {
    const nestedName = extractNameFromGenericLink(
      nestedAnchor as HTMLAnchorElement
    );
    if (nestedName) {
      return nestedName;
    }
  }

  // Primary selector for feed posts - target the specific name element
  const titleElement = anchor.querySelector(".update-components-actor__title");
  if (titleElement) {
    // Look for the specific name span within the title
    const nameSpans = titleElement.querySelectorAll(
      ".update-components-actor__single-line-truncate"
    );
    for (const nameSpan of Array.from(nameSpans)) {
      const name = nameSpan.textContent?.trim();
      if (name && name.length > 0) {
        // Check if this looks like a name (not supplementary info)
        if (!name.includes("•") && !/\d+\.$/.test(name)) {
          // Clean up duplicate names
          const cleanName = name.replace(/(.+)\1/, "$1").trim();
          return cleanName;
        }
      }
    }

    // Fallback to the entire title if specific span not found
    const name = titleElement.textContent?.trim();
    if (name && name.length > 0) {
      return name;
    }
  }

  // Try alternative feed selectors
  const alternativeSelectors = [
    ".update-components-actor__name",
    ".feed-shared-actor__name",
    ".feed-shared-actor__title",
  ];

  for (const selector of alternativeSelectors) {
    const nameElement = anchor.querySelector(selector);
    if (nameElement) {
      const name = nameElement.textContent?.trim();
      if (name && name.length > 0) {
        return name;
      }
    }
  }

  return null;
}

/**
 * Extracts name from profile page links
 */
function extractNameFromProfileLink(anchor: HTMLAnchorElement): string | null {
  const selectors = [
    ".pv-text-details__left-panel h1",
    ".text-heading-xlarge",
    ".pv-top-card-section__name",
  ];

  for (const selector of selectors) {
    const nameElement = anchor.querySelector(selector);
    if (nameElement) {
      const name = nameElement.textContent?.trim();
      if (name && name.length > 0) {
        return name;
      }
    }
  }

  return null;
}

/**
 * Extracts name from search result links
 */
function extractNameFromSearchLink(anchor: HTMLAnchorElement): string | null {
  const selectors = [
    ".entity-result__title-text",
    ".search-result__info .actor-name",
    ".search-result__title",
  ];

  for (const selector of selectors) {
    const nameElement = anchor.querySelector(selector);
    if (nameElement) {
      const name = nameElement.textContent?.trim();
      if (name && name.length > 0) {
        return name;
      }
    }
  }

  return null;
}

/**
 * Extracts name from connection links
 */
function extractNameFromConnectionLink(
  anchor: HTMLAnchorElement
): string | null {
  const selectors = [
    ".mn-connection-card__name",
    ".invitation-card__name",
    ".connection-card__name",
  ];

  for (const selector of selectors) {
    const nameElement = anchor.querySelector(selector);
    if (nameElement) {
      const name = nameElement.textContent?.trim();
      if (name && name.length > 0) {
        return name;
      }
    }
  }

  return null;
}

/**
 * Extracts name from message links
 */
function extractNameFromMessageLink(anchor: HTMLAnchorElement): string | null {
  const selectors = [
    ".msg-s-message-group__name",
    ".msg-entity-lockup__entity-title",
    ".msg-conversations-container__name",
    ".msg-conversation-card__participant-name",
    ".msg-conversation-listitem__participant-names",
    ".msg-conversation-card__participant-names",
  ];

  for (const selector of selectors) {
    const nameElement = anchor.querySelector(selector);
    if (nameElement) {
      const name = nameElement.textContent?.replace(/\s+/g, " ").trim();
      if (name && name.length > 0) {
        return name;
      }
    }
  }

  // Avatar links carry the name only in their screen-reader text (de/en)
  const a11yText = anchor
    .querySelector(".a11y-text")
    ?.textContent?.replace(/\s+/g, " ")
    .trim();
  if (a11yText) {
    const m =
      a11yText.match(/^Profil von (.+) anzeigen$/i) ||
      a11yText.match(/^View (.+?)(?:['’]s)? profile$/i);
    if (m?.[1]) return m[1].trim();
  }

  return null;
}

/**
 * Extracts name from notification links
 */
function extractNameFromNotificationLink(
  anchor: HTMLAnchorElement
): string | null {
  const selectors = [
    ".notification-actor__name",
    ".reactions-detail__actor-name",
  ];

  for (const selector of selectors) {
    const nameElement = anchor.querySelector(selector);
    if (nameElement) {
      const name = nameElement.textContent?.trim();
      if (name && name.length > 0) {
        return name;
      }
    }
  }

  return null;
}

/**
 * Takes the first segment of a text before common separators and
 * validates it as a plausible name.
 */
function firstTextSegment(text: string | null | undefined): string | null {
  if (!text) return null;
  const first = text.split(/[•·\n\r\t]/)[0]?.trim();
  if (first && first.length > 0 && first.length < 100) {
    return first;
  }
  return null;
}

/**
 * Generic name extraction for unknown link types
 */
function extractNameFromGenericLink(anchor: HTMLAnchorElement): string | null {
  // Try common selectors that might work across different contexts
  const selectors = [".artdeco-entity-lockup__title", ".comment-actor__name"];

  for (const selector of selectors) {
    const nameElement = anchor.querySelector(selector);
    if (nameElement) {
      // aria-hidden span excludes screen-reader text and connection degree
      const visibleSpan = nameElement.querySelector('span[aria-hidden="true"]');
      const name = firstTextSegment(
        (visibleSpan ?? nameElement).textContent
      );
      if (name) {
        return name;
      }
    }
  }

  // The aria-hidden span holds only the visible name, without the headline
  const ariaHiddenSpan = anchor.querySelector('span[aria-hidden="true"]');
  const ariaHiddenName = firstTextSegment(ariaHiddenSpan?.textContent);
  if (ariaHiddenName) {
    return ariaHiddenName;
  }

  // innerText keeps the line break between name and headline; textContent doesn't
  const fullText = anchor.innerText?.trim() || anchor.textContent?.trim();
  const firstPart = firstTextSegment(fullText);
  if (firstPart) {
    // Additional filtering: remove common job title patterns
    const cleanName = firstPart
      .replace(
        /\s+(CEO|CTO|CFO|COO|VP|Director|Manager|Lead|Senior|Junior|Associate|Intern)\b.*$/i,
        ""
      )
      .replace(/\s+at\s+.*$/i, "")
      .replace(/\s+@\s+.*$/i, "")
      .trim();

    if (cleanName && cleanName.length > 0 && cleanName.length < 100) {
      return cleanName;
    }
    return firstPart;
  }

  // If no name found in the anchor itself, search in the broader DOM context
  return extractDisplayNameFromContext(anchor);
}

/**
 * Searches for the display name in the broader DOM context around the anchor
 * This is useful for profile picture links where the name is in a sibling or parent element
 * Returns null if no reliable name is found for the specific profile
 */
function extractDisplayNameFromContext(
  anchor: HTMLAnchorElement
): string | null {
  // Get the profile URL to match against
  const profileUrl =
    anchor.dataset.liNotesProfile || normalizeLinkedInProfileUrl(anchor.href);
  if (!profileUrl) return null;

  // For profile picture links, be more conservative and only look for names
  // that are clearly associated with the same profile URL
  const nameSelectors: string[] = [
    // Look for other links with the same profile URL that might contain the name
    `a[data-li-notes-profile="${profileUrl}"]`,
    `a[href*="${profileUrl.replace("https://www.linkedin.com/in/", "/in/")}"]`,
  ];

  // Search in parent elements and siblings, but prioritize links with the same profile URL
  let currentElement: HTMLElement | null = anchor.parentElement;
  const maxDepth = 3; // Reduced depth for more precision
  let depth = 0;

  while (currentElement && depth < maxDepth) {
    // First, look for other links with the same profile URL
    for (const selector of nameSelectors) {
      const elements: NodeListOf<Element> =
        currentElement.querySelectorAll(selector);
      for (const element of Array.from(elements)) {
        // Skip the current anchor to avoid self-reference
        if (element === anchor) continue;

        // Verify this element has the same profile URL
        const elementUrl: string | null =
          (element as HTMLAnchorElement).dataset.liNotesProfile ||
          normalizeLinkedInProfileUrl((element as HTMLAnchorElement).href);
        if (elementUrl !== profileUrl) continue;

        // Try to extract name from this related element
        const name = extractDisplayName(element as HTMLAnchorElement);
        if (name) {
          return name;
        }
      }
    }

    currentElement = currentElement.parentElement;
    depth++;
  }

  // If no name found in related links, return null to show "-"
  return null;
}
