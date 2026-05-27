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

export const fetchDocument = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.document.list, undefined, overrideZoneId)


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

export const getDocumentByPagination = async (
  searchTerm: string,
  page: number,
  limit: number,
  type?: string,
  groupDocumentId?: string,
  overrideZoneId?: any
) => {
  try {
    const response = await get(
      ENDPOINTS.document.getByPagination(searchTerm, page, limit, type, groupDocumentId),
      undefined,
      overrideZoneId
    )

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}


export const createDocument = async (document: any, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.document.create, document, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      throw new Error(response?.message || 'Error creating document')
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error creating document'))
  }
}

export const updateDocument = async (id: string, document: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.document.update(id), document, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      throw new Error(response?.message || 'Error updating document')
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error updating document'))
  }
}

export const getByDocumentId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.document.getById(id), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting document by ID:', error)

    return null
  }
}

export const deleteByDocumentById = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.document.deleteById(id), overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      throw new Error(response?.message || 'Error deleting document')
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error deleting document'))
  }
}

export const updateDocumentStatus = async (id: string, document: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.document.updateStatus(id), document, overrideZoneId);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response?.message || 'Error updating document status');
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error updating document status'));
  }
};
