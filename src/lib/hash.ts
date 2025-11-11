const enc = new TextEncoder();

export async function hashString(value: string) {
  if (crypto && crypto.subtle) {
    const buffer = await crypto.subtle.digest("SHA-256", enc.encode(value));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback (non-crypto environments)
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}
