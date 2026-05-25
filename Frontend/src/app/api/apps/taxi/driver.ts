/* eslint-disable newline-before-return */
// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchDrivers = async () => {
  try {
    const response = await get(ENDPOINTS.driver.list);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const fetchDriverData = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.driver.getByDriverDetails(id));

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


export const fetchZone = async () => {

  try {
        const response = await get(ENDPOINTS.zone.list);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

export const getDriverByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {

    const response = await get(ENDPOINTS.driver.getDriverByPagination(searchTerm, page, limit))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}


export const createDriver = async (formData: FormData) => {
  try {
    const response = await post(ENDPOINTS.driver.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

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

export const updateDriver = async (id: string, formData: FormData) => {
  try {
    const response = await patch(ENDPOINTS.driver.update(id), formData, {
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

export const getByDriverId = async (id: string) => {
  try {

    const response = await get(ENDPOINTS.driver.getById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const getVehicleByZone = async (id: string) => {
  try {

    const response = await get(ENDPOINTS.driver.getVehicleByZone(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteDriverById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.driver.deleteById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};


export const updateDriverStatus = async (id: string, user: any) => {
  try {
    const response = await patch(ENDPOINTS.driver.updateStatus(id), user);

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

export const getDriverWallet = async () => {
  try {
    const response = await get(ENDPOINTS.driver.getDriverWallet);

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

export const getZones = async () => {

  try {
        const response = await get(ENDPOINTS.driver.getZones);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

export const getDriversByZone = async (id:string,searchTerm: string, page: number, limit: number) => {

  try {
        const response = await get(ENDPOINTS.driver.getDriversByZone(id,searchTerm, page, limit));

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};