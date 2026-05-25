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


export const deleteByKey = async (key: string) => {
  try {
    const response = await del(ENDPOINTS.translation.deleteByKey(key))

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
