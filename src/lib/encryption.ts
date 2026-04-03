// Client-side encryption utility for sensitive data storage
// Uses Web Crypto API with AES-GCM encryption

const ENCRYPTION_KEY = "teo_secure_key_v1";

/**
 * Encrypt a string using AES-GCM with PBKDF2 key derivation.
 * Falls back to base64 encoding if Web Crypto API is unavailable.
 */
export async function encryptData(data: string): Promise<string> {
  if (typeof window === "undefined") return data;
  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ENCRYPTION_KEY),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(data)
    );
    const combined = new Uint8Array([...salt, ...iv, ...new Uint8Array(encrypted)]);
    return btoa(String.fromCharCode(...combined));
  } catch {
    return btoa(data);
  }
}

/**
 * Decrypt a string that was encrypted with encryptData.
 * Falls back to base64 decoding if decryption fails.
 */
export async function decryptData(encrypted: string): Promise<string> {
  if (typeof window === "undefined") return encrypted;
  try {
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ENCRYPTION_KEY),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch {
    return atob(encrypted);
  }
}
