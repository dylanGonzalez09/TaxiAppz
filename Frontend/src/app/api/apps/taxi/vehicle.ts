// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchVehicle = async () => {
  try {
    const response = await get(ENDPOINTS.vehicle.list);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const getVehiclesWithPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.vehicle.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createVehicle = async (formData: FormData) => {
  try {
    const response = await post(ENDPOINTS.vehicle.create, formData, {
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

export const updateVehicle = async (id: string, formData: FormData) => {
  try {
    const response = await patch(ENDPOINTS.vehicle.update(id), formData, {
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

export const getByVehicleId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.vehicle.getById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteVehicleById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.vehicle.deleteById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updateVehicleStatus = async (id: string, vehicle: any) => {
  try {
    const response = await patch(ENDPOINTS.vehicle.updateStatus(id), vehicle);

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
