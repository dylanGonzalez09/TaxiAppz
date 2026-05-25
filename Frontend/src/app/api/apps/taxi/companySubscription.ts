// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchCompanySubScription = async () => {
  try {
    const response = await get(ENDPOINTS.package.list)

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


export const getCompanySubscriptionByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.package.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const createCompanySubScriptions = async (subScription: any) => {
  try {
    const response = await post(ENDPOINTS.package.create, subScription)

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

export const updateCompanySubScription = async (id: string, subScription: any) => {
  try {
    const response = await patch(ENDPOINTS.package.update(id), subScription)

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

export const getByCompanySubScriptionId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.package.getById(id))

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

export const deleteByCompanySubScriptionId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.package.deleteById(id))

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

export const updateCompanySubScriptionStatus = async (id: string, subScription: any) => {
  try {
    const response = await patch(ENDPOINTS.package.updateStatus(id), subScription);

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
