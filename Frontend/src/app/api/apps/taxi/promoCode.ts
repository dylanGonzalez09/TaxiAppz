// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchPromoExpiry = async () => {
  try {
    const response = await get(ENDPOINTS.promocode.getExpiredPromo);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const fetchPromoCode = async () => {
  try {
    const response = await get(ENDPOINTS.promocode.list);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const getPromoUseReport = async () => {
  try {
    const response = await get(ENDPOINTS.promocode.getPromoUseReport);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const getPromoWithPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.promocode.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createPromoCode = async (formData: FormData) => {


try {
  const response = await post(ENDPOINTS.promocode.create, formData);

    if (response.success) {
      return response.data
    } else {
      return { error: response.data.message || 'An error occurred while creating the promo code.' };
    }
  } catch (error) {
    return null;
  }
};

export const updatePromoCode = async (id: string, formData: FormData) => {
  try {
    const response = await patch(ENDPOINTS.promocode.update(id), formData);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const getByPromoCodeId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.promocode.getById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deletePromoCodeById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.promocode.deleteById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updatePromoCodeStatus = async (id: string, promocode: any) => {
  try {
    const response = await patch(ENDPOINTS.promocode.updateStatus(id), promocode);

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
