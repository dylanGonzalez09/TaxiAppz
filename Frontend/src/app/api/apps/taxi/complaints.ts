/* eslint-disable @typescript-eslint/no-unused-vars */


// src/utils/fetchRoles.ts
import { del, get, patch, post } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchUserComplaintData = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.complaints.getComplaintsByUser(id));

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
}

export const createComplaints = async (complaints: any) => {
  try {
    const response = await post(ENDPOINTS.complaints.create,complaints)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating faq:', error)

    return null
  }
}

export const getByComplaintsByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.complaints.getByComplaintsByPagination(searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};


export const updateComplaints = async (id: any, complaints: any) => {
  try {
    const response = await patch(ENDPOINTS.complaints.update(id), complaints)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating faq:', error)

    return null
  }
}


export const deleteByComplaintsId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.complaints.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting faq by ID:', error)

    return null
  }
}

export const updateComplaintsStatus = async (id: string, faq: any) => {
  try {
    const response = await patch(ENDPOINTS.complaints.updateStatus(id), faq);

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

export const getComplaintsByLanguage = async (id: string,searchTerm: string, page: number, limit: number,overrideZoneId?: any) => {
  try {
    
    const response = await get(ENDPOINTS.complaints.getComplaintsByLanguage(id,searchTerm, page, limit), undefined, overrideZoneId);
    
    if (response.success) {
      return response.data
      
    } else {
      return null
    }
  } catch (error) {
 
    return null
  }
};

