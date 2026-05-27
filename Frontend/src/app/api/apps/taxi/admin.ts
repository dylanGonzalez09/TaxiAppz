// src/utils/fetchRoles.ts
import { get} from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchAdvertisement = async (clientId:string,overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.advertisement.list, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};