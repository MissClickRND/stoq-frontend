export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  if ("data" in error && error.data && typeof error.data === "object" && "message" in error.data) {
    const message = error.data.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      return message.join(". ");
    }
  }
  return fallback;
}
