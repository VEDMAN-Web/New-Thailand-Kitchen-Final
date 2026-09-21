const RATE_LIMIT_CACHE = new Map();
const MAX_CACHE_SIZE = 10000;

function getKey(namespace, identifier) {
  return `${namespace}:${identifier}`;
}

function getIdentifier(req) {
  return req.admin?.id || req.ip || "unknown";
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of RATE_LIMIT_CACHE.entries()) {
    if (value.expiresAt < now) {
      RATE_LIMIT_CACHE.delete(key);
    }
  }
}

function pruneCache() {
  if (RATE_LIMIT_CACHE.size > MAX_CACHE_SIZE) {
    const entries = Array.from(RATE_LIMIT_CACHE.entries());
    entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.1));
    for (const [key] of toDelete) {
      RATE_LIMIT_CACHE.delete(key);
    }
  }
}

function checkRateLimit(namespace, identifier, maxRequests, windowSeconds) {
  const key = getKey(namespace, identifier);
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let entry = RATE_LIMIT_CACHE.get(key);

  if (entry && entry.expiresAt > now) {
    entry.count += 1;
    return {
      allowed: entry.count <= maxRequests,
      remaining: Math.max(0, maxRequests - entry.count),
      resetAt: entry.expiresAt,
    };
  }

  entry = {
    count: 1,
    expiresAt: now + windowMs,
  };
  RATE_LIMIT_CACHE.set(key, entry);

  cleanupExpiredEntries();
  pruneCache();

  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetAt: entry.expiresAt,
  };
}

module.exports = { checkRateLimit, getIdentifier };
