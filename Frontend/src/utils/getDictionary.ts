// Third-party Imports
import 'server-only'

// Type Imports
import type { Locale } from '@configs/i18n'
import { BASE_URL } from '@/app/api/apps/taxi/endpoint'

const dictionaries: Record<string, () => Promise<Record<string, unknown>>> = {
  en: () => import('@/data/dictionaries/en.json').then(module => module.default),
  fr: () => import('@/data/dictionaries/fr.json').then(module => module.default),
  ar: () => import('@/data/dictionaries/ar.json').then(module => module.default),
  po: () => import('@/data/dictionaries/po.json').then(module => module.default),
  is: () => import('@/data/dictionaries/is.json').then(module => module.default)
}

export const getDictionary = async (locale: Locale) => {
  const key = String(locale || 'en').toLowerCase()

  // 1) Try dynamic dictionary from backend (Translation Master) – no rebuild needed
  try {
    const res = await fetch(`${BASE_URL}/translation/dictionary/${encodeURIComponent(key)}`, { cache: 'no-store' })

    if (res.ok) {
      const json = await res.json()
      const dict = json?.data ?? json

      if (dict && typeof dict === 'object' && dict.navigation && typeof dict.navigation === 'object') return dict
    }
  } catch {
    // ignore, use fallback
  }

  // 2) Fallback to built-in dictionary for this locale
  const loader = dictionaries[key]

  if (loader && typeof loader === 'function') return loader()

  // 3) Default to English
  return dictionaries.en()
}
