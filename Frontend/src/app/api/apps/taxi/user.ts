import { get, post, patch, del } from './apiService';
import { ENDPOINTS } from './endpoint';

const getApiErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }

  if (Array.isArray(responseData?.message) && responseData.message.length > 0) {
    return String(responseData.message[0]);
  }

  if (typeof responseData?.msg === 'string' && responseData.msg.trim()) {
    return responseData.msg;
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

// Example: add overrideZoneId parameter and pass it to the get/post calls

export const fetchUsers = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.user.list, undefined, overrideZoneId);

    if (response.success) {
      return response.data;

    }

    return [];

  }
  catch (error) {

    console.error('Error fetching roles:', error);

    return [];
  }
};


export const fetchUsersList = async (overrideZoneId?: any) => {

  try {

    const response = await get(ENDPOINTS.user.userList, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return [];
  } catch (error) {

    console.error('Error fetching roles:', error);

    return [];
  }
};

export const fetchUsersListByZone = async (overrideZoneId?: any) => {

  try {

    const response = await get(ENDPOINTS.user.userList, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return [];
  } catch (error) {

    console.error('Error fetching roles:', error);

    return [];
  }
};

export const fetchUserData = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.user.getByUserDetails(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return null;
  } catch (error) {

    return null;
  }
};

export const fetchDriverData = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.user.getByDriverDetails(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return null;
  } catch (error) {

    return null;
  }
};

export const getAdminByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.user.getAdminByPagination(searchTerm, page, limit), undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return null;
  } catch (error) {

    return null;
  }
};

export const getUserByPagination = async (searchTerm: string, page: number, limit: number, overrideZoneId?: any) => {
  try {

    const response = await get(ENDPOINTS.user.getUserByPagination(searchTerm, page, limit), undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return null;
  } catch (error) {

    return null;
  }
};

export const fetchUserByEmail = async (user: any, overrideZoneId?: any) => {
  try {

    const response = await post(ENDPOINTS.user.getByEmail, user, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return null;
  } catch (error) {

    console.error('Error fetching role:', error);

    return null;
  }
};

export const createUser = async (user: any, overrideZoneId?: any) => {
  try {

    const response = await post(ENDPOINTS.user.create, user, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return null;
  } catch (error: any) {

    const errorMessage = error.response?.data || 'Something went wrong';

    return errorMessage;
  }
};


export const createUserForDispatcher = async (user: any, overrideZoneId?: any) => {
  try {

    const response = await post(ENDPOINTS.user.create, user, overrideZoneId);

    return response;
  } catch (error: any) {
    
    return error;
  }
};

export const updateUser = async (id: string, user: any, overrideZoneId?: any) => {
  try {

    const response = await patch(ENDPOINTS.user.update(id), user, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return null;
  } catch (error) {


    ;

    return null;
  }
};

export const updateUserStatus = async (id: string, user: any, overrideZoneId?: any) => {
  try {

    const response = await patch(ENDPOINTS.user.updateStatus(id), user, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to update status');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update status'));
  }
};

export const getByUser = async (id: string, overrideZoneId?: any) => {
  try {

    const response = await get(ENDPOINTS.roles.getById(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }


    return null;
  } catch (error) {

    return null;
  }
};

export const deleteByUserId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.user.deleteById(id), overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Error deleting role by ID:', error);

    return null;
  }
};

export const fetchDropDownList = async (overrideZoneId?: any) => {
  try {

    const response = await get(ENDPOINTS.user.list, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }


    return [];
  } catch (error) {

    console.error('Error fetching roles:', error);

    return [];
  }
};

export const getDashboardByCount = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.user.getDashboardCount, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return [];
  } catch (error) {

    console.error('Error fetching roles:', error);

    return [];
  }
};

export const updateProfile = async (id: string, user: any, overrideZoneId?: any) => {

  try {

    const response = await patch(ENDPOINTS.user.updateProfile(id), user, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return null;

  } catch (error) {

    return null;
  }
};

export const updatePassword = async (id: string, user: any, overrideZoneId?: any) => {

  try {

    const response = await patch(ENDPOINTS.user.updatePassword(id), user, overrideZoneId);

    if (response.success) {

      return response.data;
    }

    return null;
  } catch (error) {

    return null;
  }
};

export const getLogisticalCounts = async (overrideZoneId?: any) => {

  try {

    const response = await get(ENDPOINTS.user.getLogisticalCounts, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    }

    return [];
  } catch (error) {

    return [];
  }
};

export const getAllAdminList = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.user.getallAdminList,undefined,overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return []
  }
}

export const getDropDownList = async (clientId:string,overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.user.dropDownList(clientId,overrideZoneId),undefined,overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return []
  }
}

