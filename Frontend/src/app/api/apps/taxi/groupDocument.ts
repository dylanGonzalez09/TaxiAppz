// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchGroupDocument = async () => {
  try {
    const response = await get(ENDPOINTS.groupDocument.list)


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

export const getGroupDocumentByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.groupDocument.getByPagination(searchTerm, page, limit))

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
      return null
    }
  } catch (error) {
    console.error('Error creating role:', error)

    return null
  }
}

export const updateGroupDocument = async (id: string, role: any) => {
  try {
    const response = await patch(ENDPOINTS.groupDocument.update(id), role)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating role:', error)

    return null
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
    console.error('Error deleting role by ID:', error)

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
    console.error('Error updating vehicleModel:', error);

    return null;
  }
};
