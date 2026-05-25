// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchCategories = async () => {
  try {
    const response = await get(ENDPOINTS.category.list);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};


export const getByCategoryByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.category.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const createCategory = async (formData: FormData) => {
  try {
    const response = await post(ENDPOINTS.category.create, formData, {
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

export const updateCategory = async (id: string, formData: FormData) => {
  try {
    const response = await patch(ENDPOINTS.category.update(id), formData, {
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

export const getByCategoryId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.category.getById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteCategoryById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.category.deleteById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updateCategoryStatus = async (id: string, category: any) => {
  try {
    const response = await patch(ENDPOINTS.category.updateStatus(id), category);

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
