// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchVehicle = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicle.list, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const getVehiclesWithPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicle.getByPagination(searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}

export const getActiveVehiclesWithPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicle.getActiveByPagination(searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createVehicle = async (formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.vehicle.create, formData, {
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

export const updateVehicle = async (id: string, formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.vehicle.update(id), formData, {
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

export const getByVehicleId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicle.getById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteVehicleById = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.vehicle.deleteById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updateVehicleStatus = async (id: string, vehicle: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.vehicle.updateStatus(id), vehicle, undefined, overrideZoneId);

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
