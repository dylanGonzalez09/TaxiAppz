import { fetchSettings } from '@/app/api/apps/taxi/setting'

// Cache the primary color with a TTL (time to live)
let cachedPrimaryColor: string | null = null
let cacheTimestamp: number | null = null
const CACHE_TTL_MS = 1000 * 60 * 60 * 24

let inFlightFetch: Promise<string> | null = null

export const getPrimaryColorConfig = async (): Promise<string> => {
  const defaultColor = '#0D2D5C'
  const now = Date.now()

  if (cachedPrimaryColor && cacheTimestamp && (now - cacheTimestamp < CACHE_TTL_MS)) {
    return cachedPrimaryColor
  }

  if (inFlightFetch) {
    return inFlightFetch
  }

  inFlightFetch = (async () => {
    try {
      const settings = await fetchSettings()
      const general = settings.find((item: any) => item._id === 'general')
      const mainColor = general?.settings.find((s: any) => s.name === 'primaryColor')?.value || defaultColor

      cachedPrimaryColor = mainColor
      cacheTimestamp = now

      return mainColor
    } catch (error) {

      console.error('Error loading primary color config:', error)

      return defaultColor
    } finally {
      inFlightFetch = null // Reset so future calls can re-fetch if needed
    }
  })()

  return inFlightFetch
}


export const refreshPrimaryColorCache = async (): Promise<string> => {
  cachedPrimaryColor = null
  cacheTimestamp = null

  return await getPrimaryColorConfig()
}
