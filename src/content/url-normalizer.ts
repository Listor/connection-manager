/**
 * Normalizes LinkedIn profile URLs to a consistent format.
 * Ensures that URLs with and without trailing slashes are treated as the same profile.
 *
 * Examples:
 * - https://www.linkedin.com/in/jane-doe → https://www.linkedin.com/in/jane-doe
 * - https://www.linkedin.com/in/jane-doe/ → https://www.linkedin.com/in/jane-doe
 * - https://linkedin.com/in/jane-doe?miniProfileUrn=... → https://www.linkedin.com/in/jane-doe
 */
export function normalizeLinkedInProfileUrl(href: string): string | null {
  try {
    const u = new URL(href);
    if (!u.hostname.endsWith("linkedin.com")) return null;
    const m = u.pathname.match(/\/in\/([^/]+)\/?/);
    return m ? `https://www.linkedin.com/in/${m[1]}` : null;
  } catch {
    return null;
  }
}
