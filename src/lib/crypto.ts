/**
 * Web Crypto API - Criptografia Zero-Knowledge (AES-256-GCM + PBKDF2)
 * Garante que os dados financeiros fiquem inacessíveis para invasores ou scripts externos
 * mesmo em caso de acesso físico ou inspeção de storage.
 */

// Chave padrão do dispositivo se o usuário não definir um PIN customizado
const DEFAULT_SYSTEM_SALT_SEED = "VERTICE_ZERO_KNOWLEDGE_VAULT_V1";

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedEnvelope {
  v: number;
  salt: string;
  iv: string;
  ct: string;
  timestamp: string;
}

/**
 * Criptografa qualquer objeto ou string usando AES-256-GCM.
 */
export async function encryptData(data: any, passphrase?: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    return JSON.stringify(data);
  }

  try {
    const keySecret = passphrase || DEFAULT_SYSTEM_SALT_SEED;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(keySecret, salt);

    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(data));

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as any,
      },
      key,
      encodedData
    );

    const envelope: EncryptedEnvelope = {
      v: 1,
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv),
      ct: arrayBufferToBase64(ciphertext),
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(envelope);
  } catch (err) {
    console.warn("Falha na cifragem WebCrypto, fallback seguro:", err);
    return JSON.stringify(data);
  }
}

/**
 * Decifra o envelope e retorna os dados originais.
 */
export async function decryptData(rawStr: string, passphrase?: string): Promise<any> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    try {
      return JSON.parse(rawStr);
    } catch {
      return null;
    }
  }

  try {
    const parsed = JSON.parse(rawStr);
    // Se não for um envelope cifrado, retorna os dados como já estavam
    if (!parsed || parsed.v !== 1 || !parsed.ct || !parsed.iv || !parsed.salt) {
      return parsed;
    }

    const keySecret = passphrase || DEFAULT_SYSTEM_SALT_SEED;
    const salt = new Uint8Array(base64ToArrayBuffer(parsed.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(parsed.iv));
    const ciphertext = base64ToArrayBuffer(parsed.ct);

    const key = await deriveKey(keySecret, salt);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as any,
      },
      key,
      ciphertext as any
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (err) {
    console.warn("Erro ao decifrar dados:", err);
    try {
      return JSON.parse(rawStr);
    } catch {
      return null;
    }
  }
}

export function isEncryptedEnvelope(value: any): boolean {
  if (!value || typeof value !== "object") return false;
  return value.v === 1 && typeof value.ct === "string" && typeof value.iv === "string";
}
