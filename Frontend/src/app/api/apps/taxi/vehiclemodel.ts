// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchVehicleModel = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicleModel.list, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const getVehicleModelByPagination = async (id: string, searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicleModel.getByPagination(id, searchTerm, page, limit), undefined, overrideZoneId)

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createVehicleModel = async (formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.vehicleModel.create, formData, {
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

export const updateVehicleModel = async (id: string, formData: FormData, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.vehicleModel.update(id), formData, {
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

export const getByVehicleIdModel = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicleModel.getById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const getByVehicleModelByVehicleId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.vehicleModel.getByVehicleId(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteVehicleModelById = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.vehicleModel.deleteById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updateVehicleModelStatus = async (id: string, vehicleModel: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.vehicleModel.updateStatus(id), vehicleModel, undefined, overrideZoneId);

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
