export function getPublicSiteOrigin() {
  const configured = import.meta.env.VITE_PUBLIC_SITE_URL;
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || url.protocol === "http:")
        return url.origin;
    } catch {
      /* Fall back to the current web origin until a public URL is configured. */
    }
  }
  return window.location.origin;
}
