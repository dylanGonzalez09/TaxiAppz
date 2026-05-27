// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchAdvertisement = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.advertisement.list, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const getAdvertisementsWithPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.advertisement.getByPagination(searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createAdvertisement = async (formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.advertisement.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, overrideZoneId);

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


export const updateAdvertisement = async (id: string, formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.advertisement.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, overrideZoneId);

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.data?.message || 'Error updating advertisement' };
    }
  } catch (error: any) {
    console.error('Error updating advertisement:', error);
    
    // Since the error message appears to be wrapped in "Error: " prefix, extract it
    let errorMessage = error.message || 'Something went wrong';
    
    // Remove "Error: " prefix if it exists
    if (errorMessage.startsWith('Error: ')) {
      errorMessage = errorMessage.substring(7);
    }
    
    return { success: false, message: errorMessage };
  }
};

export const getByAdvertisementId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.advertisement.getById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteAdvertisementById = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.advertisement.deleteById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updateAdvertisementStatus = async (id: string, advertisement: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.advertisement.updateStatus(id), advertisement, undefined, overrideZoneId);

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.data?.message || 'Error updating advertisement status' };
    }
  } catch (error: any) {
    console.error('Error updating advertisement status:', error);
    
    // Extract the error message properly (same fix as updateAdvertisement)
    let errorMessage = error.message || 'Something went wrong';
    
    // Remove "Error: " prefix if it exists
    if (errorMessage.startsWith('Error: ')) {
      errorMessage = errorMessage.substring(7);
    }
    
    return { success: false, message: errorMessage };
  }
};
