// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchCancellation = async () => {
  try {
    const response = await get(ENDPOINTS.cancellationReason.list)

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

export const getCancellationByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.cancellationReason.getByPagination(searchTerm, page, limit))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    
    return null
  }
}

export const createCancellation = async (cancellation: any) => {
  try {
    const response = await post(ENDPOINTS.cancellationReason.create, cancellation)

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

export const updateCancellation = async (id: any, cancellation: any) => {
  try {
    const response = await patch(ENDPOINTS.cancellationReason.update(id), cancellation)

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


export const deleteByCancellationId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.cancellationReason.deleteById(id))

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

export const updateCancellationStatus = async (id: string, cancellation: any) => {
  try {
    const response = await patch(ENDPOINTS.cancellationReason.updateStatus(id), cancellation);

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

export const getCancellationByLanguage = async (id: string,searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.cancellationReason.getCancellationByLanguage(id,searchTerm, page, limit))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};