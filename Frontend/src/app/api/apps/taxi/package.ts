// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchPackage = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.package.list, undefined, overrideZoneId)

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


export const getPackageByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.package.getByPagination(searchTerm, page, limit), undefined, overrideZoneId)
    
    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}

export const createPackages = async (subScription: any, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.package.create, subScription, overrideZoneId)

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

export const updatePackage = async (id: string, subScription: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.package.update(id), subScription, overrideZoneId)

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

export const getByPackageId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.package.getById(id), undefined, overrideZoneId)

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

export const deleteByPackageId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.package.deleteById(id), overrideZoneId)

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

export const updatePackageStatus = async (id: string, subScription: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.package.updateStatus(id), subScription, overrideZoneId);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    ;

    return null;
  }
};
