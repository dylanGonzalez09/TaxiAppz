// src/utils/fetchRoles.ts
import { get } from './fetchApiService'

import { ENDPOINTS } from './endpoint'


export const fetchLeaderboardData = async (selectedPeriod: string) => {
  try {
    const response = await get(ENDPOINTS.Reports.topClient(selectedPeriod))

    if (response.success) {

      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}

