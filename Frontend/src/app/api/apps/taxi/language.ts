
// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchLanguage = async () => {
  try {
    const response = await get(ENDPOINTS.language.list)

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

export const fetchActiveLanguage = async () => {
  try {
    const response = await get(ENDPOINTS.language.activeListAll)

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

export const fetchIntroLanguage = async () => {
  try {
    const response = await get(ENDPOINTS.language.introListAll)

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

export const createLanguage = async (language: any) => {
  try {
    const response = await post(ENDPOINTS.language.create, language)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating language:', error)

    return null
  }
}

export const updateLanguage = async (id: any, language: any) => {
  try {
    const response = await patch(ENDPOINTS.language.update(id), language)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating language:', error)

    return null
  }
}

export const getByLanguageId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.language.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const getLanguageByPagination = async (searchTerm: string, page: number, limit: number,id : string) => {
  try {
    const response = await get(ENDPOINTS.language.getByPagination(searchTerm, page, limit,id))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {


    return null
  }
}

export const getActiveLanguageByPagination = async (searchTerm: string, page: number, limit: number,id : string) => {
  try {
    const response = await get(ENDPOINTS.language.getActiveByPagination(searchTerm, page, limit,id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {


    return null
  }
}

export const getByLanguageByCode = async (code: string) => {
  try {
    const response = await get(ENDPOINTS.language.getBycode(code))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting language by ID:', error)

    return null
  }
}

export const deleteByLanguageId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.language.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting language by ID:', error)

    return null
  }
}

export const updateLanguageStatus = async (id: string, Language: any) => {
  try {
    const response = await patch(ENDPOINTS.language.updateStatus(id), Language);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error updating vehicleModel:', error);

    return null;
  }
};
