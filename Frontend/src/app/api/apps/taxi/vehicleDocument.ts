// src/utils/fetchRoles.ts
import { get, post, patch } from './formApiService';
import { ENDPOINTS } from './endpoint'

export const fetchVehicleDocument = async (id: string) => {
  try {

    const response = await get(ENDPOINTS.vehicleDocument.getById(id))

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching Vehicle Documet:', error)

    return []
  }
}



export const createVehicleDocument = async (formData: FormData) => {
  try {
    const response = await post(ENDPOINTS.vehicleDocument.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      const message =
        response?.data?.message || 'Failed to create vehicle document';
        
      return { success: false, error: message };
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Unexpected error occurred';
      
    return { success: false, error: errorMessage };
  }
};


export const updateVehicleDocument = async (id: string, formData: FormData) => {
  try {
    const response = await patch(ENDPOINTS.vehicleDocument.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: 'Unknown error from server' };
    }
  } catch (error: any) {
  console.error('API error:', error);

  const errorMessage =
    error?.response?.data?.message || // Get message from backend
    error?.message || // Or from the error itself
    'Unexpected error occurred';

  return {
    success: false,
    error: errorMessage,
  };
}
};



export const updateVehicleDocumentStatus = async (id: string, vehicleDocument: any) => {
  try {

    const response = await patch(ENDPOINTS.vehicleDocument.updateStatus(id), vehicleDocument);

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: 'Unknown error from server' };
    }
  } catch (error: any) {
    console.error('Error creating vehicle status:', error);

    if (error.response?.data?.message) {
      return { success: false, error: error.response.data.message };
    }

    return { success: false, error: 'Unexpected error occurred' };
  }
};


export const fetchExpiryDocument = async (id:string,searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.vehicleDocument.list(id,searchTerm, page, limit));

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};
