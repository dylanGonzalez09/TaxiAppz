// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchPromoExpiry = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.promocode.getExpiredPromo, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const fetchPromoCode = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.promocode.list, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const getPromoUseReport = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.promocode.getPromoUseReport, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const getPromoWithPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.promocode.getByPagination(searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createPromoCode = async (formData: FormData, overrideZoneId?: any) => {


try {
  const response = await post(ENDPOINTS.promocode.create, formData, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return { error: response.data.message || 'An error occurred while creating the promo code.' };
    }
  } catch (error) {
    return null;
  }
};

export const updatePromoCode = async (id: string, formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.promocode.update(id), formData, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const getByPromoCodeId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.promocode.getById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deletePromoCodeById = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.promocode.deleteById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updatePromoCodeStatus = async (id: string, promocode: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.promocode.updateStatus(id), promocode, undefined, overrideZoneId);

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

export const getPromoByZoneId = async (id: string,passengerNumber:any,overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.promocode.promoDropDownList(id,passengerNumber),overrideZoneId);

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
