// src/utils/fetchVehicleVariant.ts
import { get, post, patch, del } from './formApiService'
import { ENDPOINTS } from './endpoint'

export const fetchVehicleVariant = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicleVariant.list,undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return []
  }
}

export const getVehicleVariantByPagination = async (vehicleModelId: string, searchTerm: string, page: number, limit: number,overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicleVariant.getByPagination(vehicleModelId, searchTerm, page, limit),undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const createVehicleVariant = async (formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.vehicleVariant.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const updateVehicleVariant = async (id: string, formData: FormData,  overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.vehicleVariant.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getVehicleVariantById = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicleVariant.getById(id),undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getVehicleVariantByVehicleModel = async (vehicleModelId: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicleVariant.getByVehicleModel(vehicleModelId),undefined,overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const deleteVehicleVariantById = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.vehicleVariant.deleteById(id), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const updateVehicleVariantStatus = async (id: string, vehicleVariant: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.vehicleVariant.updateStatus(id), vehicleVariant, undefined,overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating vehicleVariant:', error)

    return null
  }
}
