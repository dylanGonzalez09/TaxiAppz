/**
 * In-memory TTL cache to reduce DB round-trips on hot paths.
 * Improves API response time by avoiding repeated Settings/Zone queries.
 */

const SETTINGS_TTL_MS = 5 * 60 * 1000; // 5 minutes
const ZONE_TTL_MS = 2 * 60 * 1000; // 2 minutes

const settingsCache = new Map();
const zoneCache = new Map();

function getCached(key, cache, ttlMs) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value, cache, ttlMs) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function getSettingsCache(name) {
  return getCached(name, settingsCache, SETTINGS_TTL_MS);
}

function setSettingsCache(name, value) {
  setCached(name, value, settingsCache, SETTINGS_TTL_MS);
}

function getZoneCache(clientId) {
  return getCached(clientId, zoneCache, ZONE_TTL_MS);
}

function setZoneCache(clientId, value) {
  setCached(clientId, value, zoneCache, ZONE_TTL_MS);
}

/** Call when settings are updated (e.g. in settings service) to invalidate. */
function invalidateSettingsCache(name) {
  if (name) settingsCache.delete(name);
  else settingsCache.clear();
}

/** Call when zone data is updated to invalidate. */
function invalidateZoneCache(clientId) {
  if (!clientId) {
    zoneCache.clear();
    return;
  }

  const clientKey = String(clientId);
  zoneCache.delete(clientKey);

  // Also clear any zone cache entries namespaced under this client.
  for (const key of zoneCache.keys()) {
    if (typeof key === 'string' && key.startsWith(`${clientKey}:`)) {
      zoneCache.delete(key);
    }
  }
}

module.exports = {
  getSettingsCache,
  setSettingsCache,
  getZoneCache,
  setZoneCache,
  invalidateSettingsCache,
  invalidateZoneCache,
};
