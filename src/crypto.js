// Client-side end-to-end encryption helpers built on the Web Crypto API.
//
// A key is derived from the user's passphrase with PBKDF2 and never leaves the
// browser — the Firebase project only ever stores AES-GCM ciphertext, so the
// project owner cannot read invoice contents.

const PBKDF2_ITERATIONS = 200000;
const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64(bytes) {
  let bin = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
}

function fromB64(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

export function randomSaltB64() {
  return toB64(crypto.getRandomValues(new Uint8Array(16)));
}

// Derive a non-extractable AES-GCM key from a passphrase + salt.
export async function deriveKey(passphrase, saltB64) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: fromB64(saltB64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt a JSON-serializable value. Returns { iv, ciphertext } as base64.
export async function encryptJSON(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = enc.encode(JSON.stringify(value));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { iv: toB64(iv), ciphertext: toB64(ct) };
}

// Decrypt a { iv, ciphertext } pair back into the original value.
export async function decryptJSON(key, ivB64, ciphertextB64) {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(ivB64) },
    key,
    fromB64(ciphertextB64)
  );
  return JSON.parse(dec.decode(plain));
}

// A small known token lets us verify a passphrase is correct without storing
// (or transmitting) the key itself.
export const VERIFIER_TOKEN = "invoice-key-ok";
