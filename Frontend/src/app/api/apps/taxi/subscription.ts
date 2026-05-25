// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchSubScription = async () => {
  try {
    const response = await get(ENDPOINTS.subScription.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching subScription:', error)

    return []
  }
}


export const getSubscriptionByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.subScription.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}

export const createSubScriptions = async (subScription: any) => {
  try {
    const response = await post(ENDPOINTS.subScription.create, subScription)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating subScription:', error)

    return null
  }
}

export const updateSubScription = async (id: string, subScription: any) => {
  try {
    const response = await patch(ENDPOINTS.subScription.update(id), subScription)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating subScription:', error)

    return null
  }
}

export const getBySubScriptionId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.subScription.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting subScription by ID:', error)

    return null
  }
}

export const deleteBySubScriptionId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.subScription.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting subScription by ID:', error)

    return null
  }
}

export const updateSubScriptionStatus = async (id: string, subScription: any) => {
  try {
    const response = await patch(ENDPOINTS.subScription.updateStatus(id), subScription);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error updating role:', error);

    return null;
  }
};
