// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

const getApiErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message
  }

  if (Array.isArray(responseData?.message) && responseData.message.length > 0) {
    return String(responseData.message[0])
  }

  if (typeof responseData?.msg === 'string' && responseData.msg.trim()) {
    return responseData.msg
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallback
}

export const fetchGroupDocument = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.groupDocument.list, undefined, overrideZoneId);



    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching roles:', error)

    return []
  }
}

export const getGroupDocumentByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.groupDocument.getByPagination(searchTerm, page, limit), undefined, overrideZoneId);

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {


    return null
  }
}


export const getActiveGroupDocumentByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.groupDocument.getActiveByPagination(searchTerm, page, limit), undefined, overrideZoneId);

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {


    return null
  }
}


export const createGroupDocument = async (role: any) => {
  try {
    const response = await post(ENDPOINTS.groupDocument.create, role)

    if (response.success) {
      return response.data
    } else {
      throw new Error(response?.message || 'Error saving group document')
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error saving group document'))
  }
}

export const updateGroupDocument = async (id: string, role: any) => {
  try {
    const response = await patch(ENDPOINTS.groupDocument.update(id), role)

    if (response.success) {
      return response.data
    } else {
      throw new Error(response?.message || 'Error saving group document')
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error saving group document'))
  }
}

export const getByGroupDocumentId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.groupDocument.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {


    return null
  }
}

export const deleteByGroupDocumentById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.groupDocument.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const updateGroupDocumentStatus = async (id: string, groupDocument: any) => {
  try {
    const response = await patch(ENDPOINTS.groupDocument.updateStatus(id), groupDocument);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {

    return null;
  }
};
