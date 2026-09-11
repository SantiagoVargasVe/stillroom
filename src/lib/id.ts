// IDs only identify in-memory editor items. getRandomValues also works on LAN HTTP,
// where browsers omit the secure-context-only crypto.randomUUID method.
export function createId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
