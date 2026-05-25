import { get,post } from './apiService';
import { ENDPOINTS } from './endpoint';

export const getFineWithPagination = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.Fine.getFineWithPagination(id));
    
    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
}

export const createFine = async (formData: FormData) => {
  try {
    const response = await post(ENDPOINTS.Fine.createFine, formData);

    if (response.success) {
      return response.data;
    } else {
      return { success: false, message: response.data.message || 'Error adding fine' };
    }
  } 
  catch (error: any) {
   
    const errorMessage = error.response ? error.response.data : 'Something went wrong';

    return { success: false, message: errorMessage }; 
  }
};