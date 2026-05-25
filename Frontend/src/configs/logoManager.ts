import { fetchSettings } from '@/app/api/apps/taxi/setting'
import { BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint'

interface LogoCacheType {
  data: { logo?: string; feviIcon?: string } | null
  timestamp: number | null
  TTL_MS: number
  isValid: () => boolean
  set: (data: { logo?: string; feviIcon?: string }) => void
  get: () => { logo?: string; feviIcon?: string } | null
  clear: () => void
}

const logoCache: LogoCacheType = {
  data: null,
  timestamp: null,
  TTL_MS: 1000 * 60 * 60 * 24, // 24 hours

  isValid() {
    return !!this.data && !!this.timestamp && Date.now() - this.timestamp < this.TTL_MS
  },

  set(data) {
    this.data = data
    this.timestamp = Date.now()
  },

  get() {
    return this.isValid() ? this.data : null
  },

  clear() {
    this.data = null
    this.timestamp = null
  }
}

export const getLogoFromCache = () => logoCache.get()

export const refreshLogoCache = async () => {
  const response = await fetchSettings()
  const generalSettings = response.find((item: { _id: string; settings: { name: string; value: string }[] }) => item._id === 'general')

  if (generalSettings) {
    const logoValue = generalSettings.settings.find((s: { name: string; value: string }) => s.name === 'logo')?.value
    const feviIconValue = generalSettings.settings.find((s: { name: string; value: string }) => s.name === 'feviIcon')?.value

    const logoData = {
      logo: logoValue,
      feviIcon: feviIconValue
    }

    logoCache.set(logoData)
    
    return {
      logo: logoValue ? `${BASE_IMAGE_URL}/uploads/setting/${logoValue}` : null,
      feviIcon: feviIconValue ? `${BASE_IMAGE_URL}/uploads/setting/${feviIconValue}` : null
    }
  }

  return null
}
