// src/utils/fetchRoles.ts
import { get, post, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const createTranslation = async (translation: any) => {
  try {
    const response = await post(ENDPOINTS.translation.create, translation)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating role:', error)

    return null
  }
}

/** Translate text to target language (for add translation in multiple languages) */
export const translateText = async (
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<{ translatedText: string } | null> => {
  try {
    const response = await post(ENDPOINTS.translation.translate, {
      text,
      targetLanguage,
      sourceLanguage
    })

    if (response.success && response.data?.translatedText !== undefined) {
      return { translatedText: response.data.translatedText }
    }

    
return null
  } catch (error) {
    console.error('Error translating text:', error)
    
return null
  }
}

export const fetchTranslation = async () => {
  try {
    const response = await get(ENDPOINTS.translation.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching version:', error)

    return []
  }
}

export const fetchMobileTranslation = async () => {
  try {
    const response = await get(ENDPOINTS.translation.mobilelist)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching version:', error)

    return []
  }
}

export const fetchActiveLanguage = async () => {
  try {
    const response = await get(ENDPOINTS.translation.activeList)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching language:', error)

    return []
  }
}

/** Fetch all languages (active + inactive) for translate-and-add in every language */
export const fetchAllLanguages = async (): Promise<string[]> => {
  try {
    const response = await get(ENDPOINTS.translation.allLanguages)

    if (response.success && Array.isArray(response.data)) {
      return response.data.map((l: any) => (typeof l === 'string' ? l : l?.code)).filter(Boolean)
    }

    
return []
  } catch (error) {
    console.error('Error fetching all languages:', error)
    
return []
  }
}

export const fetchActiveLanguageAndId = async () => {
  try {
    const response = await get(ENDPOINTS.translation.getlanguage)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching language:', error)

    return []
  }
}

export const deleteByKey = async (key: string, scope: 'web' | 'mobile' | 'all' = 'all') => {
  try {
    const response = await del(ENDPOINTS.translation.deleteByKey(key, scope))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting role by ID:', error)

    return null
  }
}
