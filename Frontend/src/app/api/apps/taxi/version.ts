// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchVersion = async () => {
  try {
    const response = await get(ENDPOINTS.version.list)

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


export const getVersionByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.version.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createVersion = async (version: any) => {
  try {
    const response = await post(ENDPOINTS.version.create, version)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating version:', error)

    return null
  }
}

export const updateVersion = async (id: any, version: any) => {
  try {
    const response = await patch(ENDPOINTS.version.update(id), version)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating version:', error)

    return null
  }
}

export const getByVersionId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.version.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const getByVersionByCode = async (code: string) => {
  try {
    const response = await get(ENDPOINTS.version.getBycode(code))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const deleteByVersionId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.version.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting version by ID:', error)

    return null
  }
}

export const updateVersionStatus = async (id: string, version: any) => {
  try {
    const response = await patch(ENDPOINTS.version.updateStatus(id), version);

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
