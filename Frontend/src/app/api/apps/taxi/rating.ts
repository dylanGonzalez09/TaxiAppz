// src/utils/fetchRoles.ts
import { get } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchUserRating = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.rating.getRatingsByUser(id));

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};
