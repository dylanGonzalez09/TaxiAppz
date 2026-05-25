// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchZone = async () => {
  try {
    const response = await get(ENDPOINTS.zone.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching client:', error)

    return []
  }
}

export const fetchPrimaryZone = async () => {
  try {
    const response = await get(ENDPOINTS.zone.primaryZoneList)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching client:', error)

    return []
  }
}


export const getByZoneByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.zone.getByPagination(searchTerm, page, limit))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {


    return null
  }
}


export const createZone = async (client: any) => {
  try {
    const response = await post(ENDPOINTS.zone.create, client)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating client:', error)

    return null
  }
}

export const checkZone = async (client: any) => {
  try {
    const response = await post(ENDPOINTS.zone.checkZone, client)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating client:', error)

    return null
  }
}

export const updateZone = async (id: string, client: any) => {
  try {
    const response = await patch(ENDPOINTS.zone.update(id), client)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating company:', error)

    return null
  }
}

export const updateZoneStatus = async (id: string, zone: any) => {
  try {
    const response = await patch(ENDPOINTS.zone.updateStatus(id), zone);

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

export const getByZoneId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.zone.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting client by ID:', error)

    return null
  }
}

export const deleteByZoneId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.zone.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting client by ID:', error)

    return null
  }
}



export const deleteByZoneSurgePriceId = async (id: string) => {
  try {

    const response = await del(ENDPOINTS.zoneSurgePrice.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting client by ID:', error)

    return null
  }
}
