// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchCountry = async () => {
  try {
    const response = await get(ENDPOINTS.country.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching country:', error)

    return []
  }
}


export const getCountryByPagination = async (searchTerm: string, page: number, limit: number,id: string,) => {
  try {
    const response = await get(ENDPOINTS.country.getByPagination(searchTerm, page, limit,id))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const fetchActiveCountry = async () => {
  try {
    const response = await get(ENDPOINTS.country.activeList)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching country:', error)

    return []
  }
}

export const createCountry = async (country: any) => {
  try {
    const response = await post(ENDPOINTS.country.create, country)

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

export const updateCountry = async (id: any, country: any) => {
  try {
    const response = await patch(ENDPOINTS.country.update(id), country)

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

export const getByCountryId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.country.getById(id))

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

export const deleteByCountryId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.country.deleteById(id))

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

export const updateCountryStatus = async (id: string, country: any) => {
  try {
    const response = await patch(ENDPOINTS.country.updateStatus(id), country);

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

export const getCountries = async() => {
  try {
    const response = await get(ENDPOINTS.country.getCountries);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting countries:', error);

    return null;
  }
};
