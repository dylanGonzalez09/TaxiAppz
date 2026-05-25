// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchVehicleModel = async () => {
  try {
    const response = await get(ENDPOINTS.vehicleModel.list);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const getVehicleModelByPagination = async (id:string,searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.vehicleModel.getByPagination(id,searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createVehicleModel = async (formData: FormData) => {
  try {
    const response = await post(ENDPOINTS.vehicleModel.create, formData, {
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

export const updateVehicleModel = async (id: string, formData: FormData) => {
  try {
    const response = await patch(ENDPOINTS.vehicleModel.update(id), formData, {
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

export const getByVehicleIdModel = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.vehicleModel.getById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const getByVehicleModelByVehicleId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.vehicleModel.getByVehicleId(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteVehicleModelById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.vehicleModel.deleteById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updateVehicleModelStatus = async (id: string, vehicleModel: any) => {
  try {
    const response = await patch(ENDPOINTS.vehicleModel.updateStatus(id), vehicleModel);

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
