// src/utils/fetchBrand.ts
import { get, post, patch, del } from './formApiService'
import { ENDPOINTS } from './endpoint'

export const fetchBrand = async () => {
  try {
    const response = await get(ENDPOINTS.brand.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return []
  }
}

export const getBrandByPagination = async (id:string,searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.brand.getByPagination(id,searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const createBrand = async (formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.brand.create, formData,{
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

export const updateBrand = async (id: string, formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.brand.update(id), formData, {
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

export const getByBrandId = async (id: string, overrideZoneId?: any ) => {
  try {
    const response = await get(ENDPOINTS.brand.getById(id), undefined,overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getByBrandByVehicleId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.brand.getByVehicleId(id), undefined,overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const deleteBrandById = async (id: string,overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.brand.deleteById(id),undefined,overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const updateBrandStatus = async (id: string, brand: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.brand.updateStatus(id), brand, undefined,overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating brand:', error)

    return null
  }
}
