// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchRoles = async () => {
  try {
    const response = await get(ENDPOINTS.roles.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching roles:', error)

    return []
  }
}


export const fetchDropDownList = async () => {
  try {
    const response = await get(ENDPOINTS.roles.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching roles:', error)

    return []
  }
}

export const getRoleWithPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.roles.getByPagination(searchTerm, page, limit))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const getByRoleByName = async (searchTerm: string) => {
  try {
    const response = await get(ENDPOINTS.roles.getBySearch(searchTerm))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createRole = async (role: any) => {
  try {
    const response = await post(ENDPOINTS.roles.create, role)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating role:', error)

    return null
  }
}

export const updateRole = async (id: string, role: any) => {
  try {
    const response = await patch(ENDPOINTS.roles.update(id), role)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    

    return null
  }
}

export const getByRoleId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.roles.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}

export const deleteByRoleId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.roles.deleteById(id));
    
    console.error('deleteByRoleId', response);

    if (response.success && response.data?.status !== 403) {
      return { success: true, message: 'Deleted successfully' };
    } else {
      return {
        success: false,
        message: response.data?.msg || 'Unable to delete role',
      };
    }
  } catch (error) {
    
    console.error('Error deleting role by ID:', error);
    
    return {
      success: false,
      message: 'Something went wrong while deleting the role.',
    };
  }
};
