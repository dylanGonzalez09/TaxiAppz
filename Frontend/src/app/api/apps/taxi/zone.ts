// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchZone = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.zone.list, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {


    return []
  }
}

export const fetchPrimaryZone = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.zone.primaryZoneList, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {


    return []
  }
}

export const primaryZoneMenuList = async (overrideZoneId?: any) => {

  try {
    const response = await get(ENDPOINTS.zone.primaryZoneMenuList, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {


    return []
  }
}

export const getByZoneByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {

  try {
    const response = await get(ENDPOINTS.zone.getByPagination(searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {


    return null
  }
}

export const getActiveZoneByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {

  try {
    const response = await get(ENDPOINTS.zone.getByActiveZonePagination(searchTerm, page, limit), undefined, overrideZoneId)


    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {


    return null
  }
}


export const createZone = async (client: any, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.zone.create, client, overrideZoneId)

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

export const updateZone = async (id: string, client: any, overrideZoneId?: any) => {
  const response = await patch(ENDPOINTS.zone.update(id), client, overrideZoneId)

  if (response.success) {
    return response.data
  }

  throw new Error(response?.message || response?.msg || 'Error updating zone. Please try again')
}

export const updateZoneStatus = async (id: string, zone: any, overrideZoneId?: any) => {
  const response = await patch(ENDPOINTS.zone.updateStatus(id), zone, overrideZoneId);

  console.log(response)

  if (response.success) {
    return response.data;
  }

  throw new Error(response?.message || 'Failed to update zone status');
};

export const getByZoneId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.zone.getById(id), undefined, overrideZoneId)

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

export const getVehicleZoneId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.zone.getVehicleZoneId(id), undefined, overrideZoneId)

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

export const deleteByZoneId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.zone.deleteById(id), overrideZoneId)

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



export const deleteByZoneSurgePriceId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.zoneSurgePrice.deleteById(id), overrideZoneId)

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

export const dropDownListForAdmin = async (clientId : string,zoneId : string) => {
  try {
    const response = await get(ENDPOINTS.user.dropDownList(clientId,zoneId))

    if (response.success) {
      return response
    } else {
      return []
    }
  } catch (error) {


    return []
  }
}


export const getZoneListByZoneId = async (overrideZoneId?:any) => {
  try {

    const response = await get(ENDPOINTS.zone.getZoneListByZoneId(overrideZoneId));

    if (response.success) {
      return response.data;
    }

    return [];
  } catch (error) {

    return [];
  }
}
