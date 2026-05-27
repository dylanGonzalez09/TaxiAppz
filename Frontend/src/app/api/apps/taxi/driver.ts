/* eslint-disable newline-before-return */
// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchDrivers = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.driver.list, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const fetchDriverData = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.driver.getByDriverDetails(id), undefined, overrideZoneId);

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


export const fetchZone = async (overrideZoneId?: any) => {
  try {
        const response = await get(ENDPOINTS.zone.list, undefined, overrideZoneId);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

export const fetchSecondaryZone = async (overrideZoneId?: any) => {
  try {
        const response = await get(ENDPOINTS.zone.secondaryZoneList, undefined, overrideZoneId);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

export const getDriverByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any,status?:string) => {
  try {

    const response = await get(ENDPOINTS.driver.getDriverByPagination(searchTerm, page, limit, status), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}


export const createDriver = async (formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.driver.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, overrideZoneId);

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

export const updateDriver = async (id: string, formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.driver.update(id), formData, {
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

export const getByDriverId = async (id: string, overrideZoneId?: any) => {
  try {

    const response = await get(ENDPOINTS.driver.getById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const getVehicleByZone = async (id: string, overrideZoneId?: any) => {
  try {

    const response = await get(ENDPOINTS.driver.getVehicleByZone(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteDriverById = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.driver.deleteById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};


export const updateDriverStatus = async (id: string, user: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.driver.updateStatus(id), user, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error updating driver:', error);

    return null;
  }


};

export const getDriverWallet = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.driver.getDriverWallet, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching driver wallet:', error);
    return []; // Return an empty array if there's an error
  }
}; 

export const getZones = async (overrideZoneId?: any) => {

  try {
        const response = await get(ENDPOINTS.driver.getZones, undefined, overrideZoneId);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

export const getDriversByZone = async (id: string, searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {

  try {
        const response = await get(ENDPOINTS.driver.getDriversByZone(id, searchTerm, page, limit), undefined, overrideZoneId);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};