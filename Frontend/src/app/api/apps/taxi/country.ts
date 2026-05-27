// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchCountry = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.country.list, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {


    return []
  }
}


export const getCountryId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.country.getCountryById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting country by ID:', error)

    return null
  }
}


export const getCountryByPagination = async (searchTerm: string, page: number, limit: number,id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.country.getByPagination(searchTerm, page, limit,id), undefined, overrideZoneId)

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const getActiveCountryByPagination = async (searchTerm: string, page: number, limit: number,id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.country.getActiveByPagination(searchTerm, page, limit,id), undefined, overrideZoneId)

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const fetchActiveCountry = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.country.activeList, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {


    return []
  }
}

export const createCountry = async (country: any, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.country.create, country, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating country:', error)

    return null
  }
}

export const updateCountry = async (id: any, country: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.country.update(id), country, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating country:', error)

    return null
  }
}

export const getByCountryId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.country.getById(id), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting country by ID:', error)

    return null
  }
}

export const deleteByCountryId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.country.deleteById(id), overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting country by ID:', error)

    return null
  }
}

export const updateCountryStatus = async (id: string, country: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.country.updateStatus(id), country, overrideZoneId);

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

export const getCountries = async(overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.country.getCountries, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting countries:', error)

    return null
  }
};
