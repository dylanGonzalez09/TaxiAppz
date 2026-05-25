// src/utils/fetchRoles.ts
import { get, post, patch, del } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchIntro = async () => {
  try {
    const response = await get(ENDPOINTS.intro.list);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const createIntro = async (formData: FormData) => {
  try {
    const response = await post(ENDPOINTS.intro.create, formData, {
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

export const updateIntro = async (id: string, formData: FormData) => {
  try {
    const response = await patch(ENDPOINTS.intro.update(id), formData, {
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

export const getByIntroId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.intro.getById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const deleteIntroById = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.intro.deleteById(id));

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null;
  }
};

export const updateIntroStatus = async (id: string, vehicle: any) => {
  try {
    const response = await patch(ENDPOINTS.intro.updateStatus(id), vehicle);

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
