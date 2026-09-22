/**
 * Sliding Window In-Memory Rate Limiter
 * Protege endpoints de API contra força bruta, DoS e esgotamento de cotas de provedores terceiros.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Limpeza automática periódica para evitar vazamento de memória
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // Remove timestamps mais antigos que 5 minutos
      record.timestamps = record.timestamps.filter((t) => now - t < 300000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

export interface RateLimitOptions {
  windowMs?: number; // Janela de tempo em ms (padrão: 60.000ms = 1 minuto)
  max?: number;      // Número máximo de requisições na janela
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { success: boolean; limit: number; remaining: number; reset: number } {
  const windowMs = options.windowMs || 60000;
  const max = options.max || 30;
  const now = Date.now();

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filtrar timestamps fora da janela atual
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= max) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      success: false,
      limit: max,
      remaining: 0,
      reset: Math.max(resetTime, 1),
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit: max,
    remaining: max - record.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
