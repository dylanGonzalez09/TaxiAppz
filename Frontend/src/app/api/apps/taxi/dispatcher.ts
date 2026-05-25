// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchDispatchers = async () => {
  try {
    const response = await get(ENDPOINTS.dispatcher.list);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};


export const getDispatcherByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.dispatcher.getDispatcherByPagination(searchTerm, page, limit))

    if (response.success) {

      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}


export const createDispatcher = async (formData: FormData) => {
  try {
    const response = await post(ENDPOINTS.dispatcher.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.success) {
      return response.data;
    } else {
      return { success: false, message: response.data.message || 'Error creating driver' };
    }
  } catch (error: any) {
    const errorMessage = error.response ? error.response.data : 'Something went wrong'; // Handle errors properly

    return { success: false, message: errorMessage };
  }
};

export const updateDispatcher = async (id: string, formData: FormData) => {
  try {

    const response = await patch(ENDPOINTS.dispatcher.update(id), formData, {
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

export const getByDispatcherId = async (id: string) => {
  try {

    const response = await get(ENDPOINTS.dispatcher.getById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteDispatcherById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.dispatcher.deleteById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};


export const updateDispatcherStatus = async (id: string, user: any) => {
  try {
    const response = await patch(ENDPOINTS.dispatcher.updateStatus(id), user);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error updating dispatcher:', error);

    return null;
  }
};
