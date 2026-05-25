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
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};


export const updateDriverDocumentStatus = async (id: string, driverDocument: any) => {
  try {

    const response = await patch(ENDPOINTS.driverDocument.updateStatus(id), driverDocument);

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


export const fetchExpiryDocument = async (id:string,searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.driverDocument.list(id,searchTerm, page, limit));

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};
