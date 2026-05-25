// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchCompany = async () => {
  try {
    const response = await get(ENDPOINTS.company.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching company:', error)

    return []
  }
}

export const getCompanyByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.company.getCompanyByPagination(searchTerm, page, limit))

    if (response.success) {

      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const getFleetByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.company.getFleetByPagination(searchTerm, page, limit))

    if (response.success) {

      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const createCompany = async (company: any) => {
  try {
    const response = await post(ENDPOINTS.company.create, company)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error: any) {
    const errorMessage = ( error.response.data) || 'Something went wrong';
    
    return errorMessage;
  }
}

export const updateCompany = async (id: string, company: any) => {
  try {
    const response = await patch(ENDPOINTS.company.update(id), company)

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

export const updateCompanyStatus = async (id: string, user: any) => {
  try {
    const response = await patch(ENDPOINTS.company.updateStatus(id), user);

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

export const getByCompanyId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.company.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting company by ID:', error)

    return null
  }
}

export const deleteByCompanyId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.company.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting company by ID:', error)

    return null
  }
}
