// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchOutZone = async () => {
  try {
    const response = await get(ENDPOINTS.outOfZone.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching outOfZone:', error)

    return []
  }
}

export const getByOutOfZoneByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.outOfZone.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}

export const createOutZone = async (outOfZone: any) => {
  try {
    const response = await post(ENDPOINTS.outOfZone.create, outOfZone)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating outOfZone:', error)

    return null
  }
}

export const updateOutZone = async (id: any, outOfZone: any) => {
  try {
    const response = await patch(ENDPOINTS.outOfZone.update(id), outOfZone)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating outOfZone:', error)

    return null
  }
}


export const deleteByOutZoneId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.outOfZone.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting outOfZone by ID:', error)

    return null
  }
}

export const updateOutZoneStatus = async (id: string, outOfZone: any) => {
  try {
    const response = await patch(ENDPOINTS.outOfZone.updateStatus(id), outOfZone);

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
