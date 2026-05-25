// Third-party Imports
import 'server-only'


// Type Imports
import type { Locale } from '@configs/i18n'

const dictionaries = {
  en: () => import('@/data/dictionaries/en.json').then(module => module.default),
  fr: () => import('@/data/dictionaries/fr.json').then(module => module.default),
  ar: () => import('@/data/dictionaries/ar.json').then(module => module.default),
  po: () => import('@/data/dictionaries/po.json').then(module => module.default),
  is: () => import('@/data/dictionaries/is.json').then(module => module.default),
  tr: () => import('@/data/dictionaries/tr.json').then(module => module.default)

}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
