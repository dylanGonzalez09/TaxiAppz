// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchDocument = async () => {
  try {
    const response = await get(ENDPOINTS.document.list)


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

export const getDocumentByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.document.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}


export const createDocument = async (document: any) => {
  try {
    const response = await post(ENDPOINTS.document.create, document)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating document:', error)

    return null
  }
}

export const updateDocument = async (id: string, document: any) => {
  try {
    const response = await patch(ENDPOINTS.document.update(id), document)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating document:', error)

    return null
  }
}

export const getByDocumentId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.document.getById(id))

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

export const deleteByDocumentById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.document.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting document by ID:', error)

    return null
  }
}

export const updateDocumentStatus = async (id: string, document: any) => {
  try {
    const response = await patch(ENDPOINTS.document.updateStatus(id), document);

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
