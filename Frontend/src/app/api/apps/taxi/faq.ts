// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchFaq = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.faq.list, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching faq:', error)

    return []
  }
}


export const getByFaqByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.faq.getByPagination(searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}


export const createFaq = async (faq: any, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.faq.create, faq, overrideZoneId)

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

export const updateFaq = async (id: any, faq: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.faq.update(id), faq, overrideZoneId)

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


export const deleteByFaqId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.faq.deleteById(id))

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

export const updateFaqStatus = async (id: string, faq: any) => {
  try {
    const response = await patch(ENDPOINTS.faq.updateStatus(id), faq);

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

export const getFaqByLanguage = async (id: string,searchTerm: string, page: number, limit: number,overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.faq.getFaqByLanguage(id,searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};

/** POST `/faq/getFaqs/list/user` — body: `{ type: 'User', zoneId }` */
export const postFaqsForUser = async (zoneId: string, overrideZoneId?: any) => {
  const response = await post(ENDPOINTS.faq.listForUser, { type: 'User', zoneId }, overrideZoneId);

  
return response;
};

/** POST `/faq/getFaqs/list/driver` — body: `{ type: 'Driver', zoneId }` */
export const postFaqsForDriver = async (zoneId: string, overrideZoneId?: any) => {
  const response = await post(ENDPOINTS.faq.listForDriver, { type: 'Driver', zoneId }, overrideZoneId);

  
return response;
};
