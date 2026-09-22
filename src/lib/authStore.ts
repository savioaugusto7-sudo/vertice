import crypto from "crypto";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  passwordHash: string;
  salt: string;
  webauthnCredentials?: Array<{
    id: string; // base64url credential ID
    publicKey: string; // base64url public key
    counter: number;
    transports?: string[];
  }>;
  createdAt: string;
  lastLogin?: string;
  failedAttempts: number;
  lockedUntil?: number;
}

// Função utilitária para hash seguro com PBKDF2 (100.000 iterações SHA-512)
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, generatedSalt, 100000, 64, "sha512")
    .toString("hex");
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
    const bufferA = Buffer.from(computedHash, "hex");
    const bufferB = Buffer.from(hash, "hex");
    if (bufferA.length !== bufferB.length) return false;
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
}

// Senha inicial padrão do Administrador Mestre: "vertice2026" (pode ser alterada a qualquer momento)
const initialAdminSalt = "a8f3b4c9e2d10567";
const initialAdminHash = hashPassword("vertice2026", initialAdminSalt).hash;

// Banco de dados de usuários em memória no servidor (persiste durante execução do Next.js)
let usersDatabase: StoredUser[] = [
  {
    id: "usr_admin_1",
    name: "Sávio Augusto",
    email: "savio@vertice.app",
    role: "admin",
    passwordHash: initialAdminHash,
    salt: initialAdminSalt,
    webauthnCredentials: [],
    createdAt: "2026-09-01T10:00:00Z",
    failedAttempts: 0,
  },
  {
    id: "usr_consultor_2",
    name: "Consultor Financeiro",
    email: "consultoria@vertice.app",
    role: "user",
    passwordHash: hashPassword("consultor123", "b7e2c5d109843210").hash,
    salt: "b7e2c5d109843210",
    webauthnCredentials: [],
    createdAt: "2026-09-15T14:30:00Z",
    failedAttempts: 0,
  },
];

// Armazenamento temporário de desafios WebAuthn (desafios expiram em 5 minutos)
const webauthnChallenges = new Map<string, { challenge: string; expiresAt: number }>();

export function getStoredUsers(): StoredUser[] {
  return usersDatabase;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return usersDatabase.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserById(id: string): StoredUser | undefined {
  return usersDatabase.find((u) => u.id === id);
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  const user = findUserByEmail(email);
  if (!user) return false;
  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.failedAttempts = 0;
  user.lockedUntil = undefined;
  return true;
}

export function registerWebauthnCredential(
  email: string,
  credential: { id: string; publicKey: string; counter: number }
): boolean {
  const user = findUserByEmail(email);
  if (!user) return false;
  if (!user.webauthnCredentials) user.webauthnCredentials = [];
  // Evita duplicatas
  user.webauthnCredentials = user.webauthnCredentials.filter((c) => c.id !== credential.id);
  user.webauthnCredentials.push(credential);
  return true;
}

export function saveWebauthnChallenge(sessionKey: string, challenge: string): void {
  webauthnChallenges.set(sessionKey, {
    challenge,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
}

export function getWebauthnChallenge(sessionKey: string): string | null {
  const item = webauthnChallenges.get(sessionKey);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    webauthnChallenges.delete(sessionKey);
    return null;
  }
  return item.challenge;
}
