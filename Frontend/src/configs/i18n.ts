export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'fr', 'ar', 'po', 'is', 'tr'],
  langDirection: {
    en: 'ltr',
    fr: 'ltr',
    po: 'ltr',
    is: 'ltr',
    tr: 'ltr',
    ar: 'rtl'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
