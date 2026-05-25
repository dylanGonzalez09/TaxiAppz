// src/apis/companyVehicle.ts
import { get, post, patch, del } from './apiService';
import { ENDPOINTS } from './endpoint';


export const fetchCompanyVehicles = async () => {
  try {
    const response = await get(ENDPOINTS.companyVehicle.list);

    if (response.success) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching company vehicles:', error);
    
return [];
  }
};

export const getCompanyVehiclesWithPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.companyVehicle.getByPagination(searchTerm, page, limit));

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching company vehicles with pagination:', error);
    
return null;
  }
};


export const createCompanyVehicle = async (createBody: any) => {
  try {
    const response = await post(ENDPOINTS.companyVehicle.create, createBody)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating subScription:', error)

    return null
  }
}


export const updateCompanyVehicle = async (id: string, updatedBody: any) => {
  try {
    const response = await patch(ENDPOINTS.companyVehicle.update(id), updatedBody)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating subScription:', error)

    return null
  }
}



export const getCompanyVehicleById = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.companyVehicle.getById(id));

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching company vehicle by ID:', error);
    
return null;
  }
};

export const deleteCompanyVehicleById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.companyVehicle.deleteById(id));

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error deleting company vehicle:', error);
    
return null;
  }
};

export const updateCompanyVehicleStatus = async (id: any, active: any) => {
  try {
    const response = await patch(ENDPOINTS.companyVehicle.updateStatus(id), { active });

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error updating company vehicle status:', error);
    
return null;
  }
};

export const getCompanyVehicleDropDownList = async (clientId: string) => {
  try {
    const response = await get(ENDPOINTS.companyVehicle.dropDownList(clientId));

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching dropdown list:', error);
    
return null;
  }
};

export const fetchVehiclesByZone = async () => {
  try {

    const response = await get(ENDPOINTS.companyVehicle.getVehicleByZone);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

