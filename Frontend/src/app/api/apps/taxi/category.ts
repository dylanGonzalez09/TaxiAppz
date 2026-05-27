// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchCategories = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.category.list, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};


export const getByCategoryByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.category.getByPagination(searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const createCategory = async (formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.category.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updateCategory = async (id: string, formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.category.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const getByCategoryId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.category.getById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteCategoryById = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.category.deleteById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updateCategoryStatus = async (id: string, category: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.category.updateStatus(id), category, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    ;

    return null;
  }
};
