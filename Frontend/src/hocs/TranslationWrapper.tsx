// Next Imports
import type { headers } from 'next/headers'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Component Imports
import LangRedirect from '@components/LangRedirect'

// Config Imports
import { i18n } from '@configs/i18n'

// ℹ️ We've to create this array because next.js makes request with `_next` prefix for static/asset files
const invalidLangs = ['_next']

const TranslationWrapper = (params: { headersList: ReturnType<typeof headers>; lang: Locale } & ChildrenType) => {
  const normalizedLang = String(params.lang || '').toLowerCase()
  const doesLangExist = i18n.locales.includes(normalizedLang as any)
  const isDynamicLangCode = /^[a-z]{2,5}$/i.test(normalizedLang)

  // ℹ️ This doesn't mean MISSING, it means INVALID
  const isInvalidLang = invalidLangs.includes(params.lang)

  return doesLangExist || isDynamicLangCode || isInvalidLang ? params.children : <LangRedirect />
}

export default TranslationWrapper
