// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchClient = async () => {
  try {
    const response = await get(ENDPOINTS.client.list)

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


export const getClientByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.client.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const createClient = async (client: any) => {
  try {
    const response = await post(ENDPOINTS.client.create, client);

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.data.message || 'Error creating client' };
    }
  } catch (error: any) {
    // Make sure to safely access error details
    const errorMessage = error.response?.data?.message || 'Something went wrong';

    
return { success: false, message: errorMessage };
  }
};



export const createClientToken  = async (client: any) => {
  try {
    const response = await post(ENDPOINTS.client.clientToken, client);
    
    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.data.message || 'Error creating client' };
    }
  } catch (error: any) {
    // Make sure to safely access error details
    const errorMessage = error.response?.data?.message || 'Something went wrong';

    
return { success: false, message: errorMessage };
  }
};

export const updateClient = async (id: string, client: any) => {
  try {
    const response = await patch(ENDPOINTS.client.update(id), client);

    // Check if the response is successful and return the updated data
    if (response.success) {
      return response.data; // This returns the updated data from the backend
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error updating client:', error);
    
return null;
  }
};

export const updateClientStatus = async (id: string, client: any) => {
  try {
    const response = await patch(ENDPOINTS.client.updateStatus(id), client);

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
    const response = await get(ENDPOINTS.client.getById(id))

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

export const deleteByClientId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.client.deleteById(id))

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
