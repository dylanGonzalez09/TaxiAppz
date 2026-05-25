// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService';
import { ENDPOINTS } from './endpoint';

export const fetchUsers = async () => {
  try {
    const response = await get(ENDPOINTS.user.list);

    if (response.success) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching roles:', error);

    return [];
  }
};



export const fetchUsersList = async () => {
  try {
    const response = await get(ENDPOINTS.user.userList);

    if (response.success) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching roles:', error);

    return [];
  }
};

export const fetchUserData = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.user.getByUserDetails(id));

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

export const getAdminByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.user.getAdminByPagination(searchTerm, page, limit))

    if (response.success) {

      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const getUserByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.user.getUserByPagination(searchTerm, page, limit))

    if (response.success) {

      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}

export const fetchUserByEmail = async (user: any) => {
  try {
    const response = await post(ENDPOINTS.user.getByEmail, user);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching role:', error);

    return null;
  }
};


export const createUser = async (user: any) => {
  try {
    const response = await post(ENDPOINTS.user.create, user);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error: any) {
    const errorMessage = ( error.response.data) || 'Something went wrong';


    return errorMessage;
  }
};

export const updateUser = async (id: string, user: any) => {
  try {
    const response = await patch(ENDPOINTS.user.update(id), user);

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


export const updateUserStatus = async (id: string, user: any) => {
  try {
    const response = await patch(ENDPOINTS.user.updateStatus(id), user);

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

export const getByUser = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.roles.getById(id));

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

export const deleteByUserId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.user.deleteById(id));

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error deleting role by ID:', error);

    return null;
  }

};

export const fetchDropDownList = async () => {
  try {
    const response = await get(ENDPOINTS.user.list)

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


export const getDashboardByCount = async () => {
  try {
    const response = await get(ENDPOINTS.user.getDashboardCount)

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


export const updateProfile = async (id: string, user: any) => {
  try {
    const response = await patch(ENDPOINTS.user.updateProfile(id), user);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {

    return null;
  }
};

export const updatePassword = async (id: string, user: any) => {
  try {
    const response = await patch(ENDPOINTS.user.updatePassword(id), user);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {

    return null;
  }
};

export const getLogisticalCounts = async () => {
  try {
    const response = await get(ENDPOINTS.user.getLogisticalCounts)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    

    return []
  }
};