function normalizePoint(p: unknown): { lat: number; lng: number } | null {
  if (p == null) return null;

  if (Array.isArray(p) && p.length >= 2) {
    const lng = parseFloat(String(p[0]));
    const lat = parseFloat(String(p[1]));

    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };

    return null;
  }

  if (typeof p !== 'object') return null;

  const o = p as Record<string, unknown>;
  let lat = o.lat ?? o.latitude;
  let lng = o.lng ?? o.longitude;

  if (lat != null && typeof lat === 'object' && '$numberDouble' in (lat as object)) {
    lat = (lat as { $numberDouble: string }).$numberDouble;
  }

  if (lng != null && typeof lng === 'object' && '$numberDouble' in (lng as object)) {
    lng = (lng as { $numberDouble: string }).$numberDouble;
  }

  const latN = typeof lat === 'number' ? lat : parseFloat(String(lat));
  const lngN = typeof lng === 'number' ? lng : parseFloat(String(lng));

  if (!Number.isFinite(latN) || !Number.isFinite(lngN)) return null;

  return { lat: latN, lng: lngN };
}

/**
 * Normalize stored zone map geometry to a single polygon ring for Google Maps.
 */
export function normalizeMapZonePath(raw: unknown): { lat: number; lng: number }[] {
  if (raw == null) return [];

  if (!Array.isArray(raw)) return [];

  let ring: unknown[] = raw;

  if (raw.length === 1 && Array.isArray(raw[0])) {
    ring = raw[0] as unknown[];
  }

  const out: { lat: number; lng: number }[] = [];

  for (const item of ring) {
    const pt = normalizePoint(item);

    if (pt) out.push(pt);
  }

  return out;
}
