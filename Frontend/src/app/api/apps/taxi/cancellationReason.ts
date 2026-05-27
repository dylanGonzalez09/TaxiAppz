// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchCancellation = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.cancellationReason.list, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching cancellation:', error)

    return []
  }
}

export const getCancellationByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.cancellationReason.getByPagination(searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    
    return null
  }
}

export const createCancellation = async (cancellation: any, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.cancellationReason.create, cancellation, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating cancellation:', error)

    return null
  }
}

export const updateCancellation = async (id: any, cancellation: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.cancellationReason.update(id), cancellation, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating cancellation:', error)

    return null
  }
}


export const deleteByCancellationId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.cancellationReason.deleteById(id), overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting cancellation by ID:', error)

    return null
  }
}

export const updateCancellationStatus = async (id: string, cancellation: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.cancellationReason.updateStatus(id), cancellation, overrideZoneId);

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

export const getCancellationByLanguage = async (id: string, searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.cancellationReason.getCancellationByLanguage(id, searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};