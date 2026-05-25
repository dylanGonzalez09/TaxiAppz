// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchRequest = async () => {
  try {
    const response = await get(ENDPOINTS.request.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching request:', error)

    return []
  }
}

export const getInvoiceQuestionReport = async () => {
  try {
    const response = await get(ENDPOINTS.request.getInvoiceQuestionsReport)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching invoice:', error)

    return []
  }
}

export const fetchUserRequestData = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.request.getByUserRequestTrips(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const fetchDriverRequestData = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.request.getByDriverRequestTrips(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getRequestWithPagination = async (
  searchTerm: string,
  page: number,
  limit: number,
  rideType: string,
  tripStatus: string
) => {
  try {
    const response = await get(ENDPOINTS.request.getByPagination(searchTerm, page, limit, rideType, tripStatus))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const createRequest = async (request: any) => {
  try {
    const response = await post(ENDPOINTS.request.create, request)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating request:', error)

    return null
  }
}

export const requestEta = async (request: any) => {
  try {
    const response = await post(ENDPOINTS.request.eta, request)

    if (response.success) {
      return response
    } else {
      return null
    }
  } catch (error: any) {


    return { success: false, message: error.response?.data?.data || 'Promo is Invalid' }
  }
}

export const updateRequest = async (id: string, request: any) => {
  try {
    const response = await patch(ENDPOINTS.request.update(id), request)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating request:', error)

    return null
  }
}

export const getByRequestId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.request.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting request by ID:', error)

    return null
  }
}

export const deleteByRequestId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.request.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting request by ID:', error)

    return null
  }
}

export const getByRequestHistory = async (phoneNumber: string) => {
  try {
    const response = await get(ENDPOINTS.request.getByPhone(phoneNumber))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting request by ID:', error)

    return null
  }
}

export const getTripByReports = async () => {
  try {
    const response = await get(ENDPOINTS.request.getTripReports)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
}

export const getByTripCount = async () => {
  try {
    const response = await get(ENDPOINTS.request.getTripCount)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
}

export const getByLastTrips = async () => {
  try {
    const response = await get(ENDPOINTS.request.getLastTrips)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
}

export const getLogisticsByEarnings = async () => {
  try {
    const response = await get(ENDPOINTS.request.getLogisticsEarnings)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting earnings report by ID:', error)

    return null
  }
}

export const getByTotalEarnings = async () => {
  try {
    const response = await get(ENDPOINTS.request.getTotalEarnings)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting earnings report by ID:', error)

    return null
  }
}

export const getTripsByDriver = async () => {
  try {
    const response = await get(ENDPOINTS.request.getTripsByDriver)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getDriverSummary = async () => {
  try {
    const response = await get(ENDPOINTS.request.getDriverSummary)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getCompletedLocalTrip = async () => {
  try {
    const response = await get(ENDPOINTS.request.getCompletedLocalTrip)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
}

export const getCompletedRentalTrips = async () => {
  try {
    const response = await get(ENDPOINTS.request.getCompletedRentalTrip)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getTripWiseReports = async () => {
  try {
    const response = await get(ENDPOINTS.request.getTripWiseReports)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
}

export const getRentalList = async () => {
  try {
    const response = await get(ENDPOINTS.request.getRentalList)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting rental trip list:', error)

    return null
  }
}

export const getByTodayEarnings = async () => {
  try {
    const response = await get(ENDPOINTS.request.getTodayEarnings)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getByTodayReport = async () => {
  try {
    const response = await get(ENDPOINTS.request.getTodayReport)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getWeeklyReport = async () => {
  try {
    const response = await get(ENDPOINTS.request.getWeeklyReport)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getMonthlyReport = async () => {
  try {
    const response = await get(ENDPOINTS.request.getMonthlyReport)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getYearlyRevenue = async () => {
  try {
    const response = await get(ENDPOINTS.request.getYearlyRevenue)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getTripsByUser = async () => {
  try {
    const response = await get(ENDPOINTS.request.getTripsByUser)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getErrorLogs = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.request.getErrorLogs(searchTerm, page, limit))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const getOtpTable = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.request.getOtpTable(searchTerm, page, limit))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    return null
  }

}

export const getDriverReport = async () => {
  try {
    const response = await get(ENDPOINTS.driver.getDriverReport);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {

    return null;
  }
};
