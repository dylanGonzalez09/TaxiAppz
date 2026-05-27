// src/utils/fetchRoles.ts
import { get, post, patch } from './formApiService';
import { ENDPOINTS } from './endpoint'

export const fetchDriverDocument = async (id: string) => {
  try {

    const response = await get(ENDPOINTS.driverDocument.getById(id))

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching Driver Documet:', error)

    return []
  }
}



export const createDriverDocument = async (formData: FormData) => {
  try {
    const response = await post(ENDPOINTS.driverDocument.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.success) {
      return response.data
    } else {
      if(response.data.message === 'Only JPG, JPEG, and PNG files are allowed.')
      {
        return response;
      }
      
      return null
    }
  } catch (error) {
    return null;
  }
};


export const updateDriverDocument = async (id: string, formData: FormData) => {
  try {
    const response = await patch(ENDPOINTS.driverDocument.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });


    if (response.success) {
      return response.data;
    } else {
      return { success: false, message: response.data.message || 'Error creating driver' };
    }
  } 
  catch (error: any) {
   
    const errorMessage = error.response ? error.response.data : 'Something went wrong';
 
return { success: false, message: errorMessage }; 
  }
};


export const updateDriverDocumentStatus = async (id: string, driverDocument: any) => {
  try {
    const response = await patch(ENDPOINTS.driverDocument.updateStatus(id), driverDocument);

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.data?.message || 'Error creating driver' };
    }
  } 
  catch (error: any) {
    return { 
      success: false, 
      message: error?.response?.data?.message 
        || error?.message 
        || 'Something went wrong'
    };
  }
};



export const fetchExpiryDocument = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.driverDocument.list(searchTerm, page, limit));

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};
