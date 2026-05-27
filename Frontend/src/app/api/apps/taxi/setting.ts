// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService'
import { ENDPOINTS } from './endpoint'

export const fetchSettings = async () => {
  try {
    const response = await get(ENDPOINTS.setting.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    // On unauth pages (e.g. login), clientId may be unavailable.
    // In that case, silently fallback to defaults instead of noisy logs.
    const message = error instanceof Error ? error.message : String(error)

    if (!message.includes('ClientID not found')) {
      console.error('Error fetching setting:', error)
    }

    return []
  }
}

export const getSettingById = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.setting.getSettingById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting setting by ID:', error)

    return null
  }
}

export const createSetting = async (setting: FormData) => {
  try {
    const response = await post(ENDPOINTS.setting.create, setting, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating setting:', error)

    return null
  }
}

export const updateSetting = async (setting: any) => {
  try {

    const response = await patch(ENDPOINTS.setting.update, setting, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.success) {
      return response.data
    } else {
      return null
    }

  } catch (error) {
    console.error('Error updating setting:', error)

    return null
  }
}

export const getBySettingId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.setting.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting setting by ID:', error)

    return null
  }
}

export const deleteBySettingId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.setting.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting setting by ID:', error)

    return null
  }
}

export const getDefaultLanguage = async () => {
  try {
    const response = await get(ENDPOINTS.setting.getDefaultLanguage)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching setting:', error)

    return []
  }
}

export const getmoduleSetting = async () => {
  try {
    const response = await get(ENDPOINTS.setting.getmoduleSettings)

    if (response.success) {
      return response.data
    } else {
      return {}
    }
  } catch (error) {
    console.error('Error fetching setting:', error)

    return []
  }
}
