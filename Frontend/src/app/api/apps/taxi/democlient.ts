// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchClient = async () => {
  try {
    const response = await get(ENDPOINTS.democlient.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching democlient:', error)

    return []
  }
}


export const getClientByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.democlient.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const createClient = async (democlient: any) => {
  try {
    const response = await post(ENDPOINTS.democlient.create, democlient);

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.data.message || 'Error creating democlient' };
    }
  } catch (error: any) {
    // Make sure to safely access error details
    const errorMessage = error.response?.data?.message || 'Something went wrong';

    
return { success: false, message: errorMessage };
  }
};

export const updateClient = async (id: string, democlient: any) => {
  try {
    const response = await patch(ENDPOINTS.democlient.update(id), democlient);

    // Check if the response is successful and return the updated data
    if (response.success) {
      return response.data; // This returns the updated data from the backend
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error updating democlient:', error);
    
return null;
  }
};

export const updateClientStatus = async (id: any, democlient: any) => {
  try {
    const response = await patch(ENDPOINTS.democlient.updateStatus(id), democlient);

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

export const getByClientId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.democlient.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting democlient by ID:', error)

    return null
  }
}

export const deleteByClientId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.democlient.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting democlient by ID:', error)

    return null
  }
}
