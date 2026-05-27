// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'


export const fetchRequest = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.list, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching request:', error)

    return []
  }
};

export const getInvoiceQuestionReport = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getInvoiceQuestionsReport, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching invoice:', error)

    return []
  }
};

export const fetchUserRequestData = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getByUserRequestTrips(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {

    return null;
  }
};

export const fetchDriverRequestData = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getByDriverRequestTrips(id), undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {

    return null;

  }
};

export const getRequestWithPagination = async (searchTerm: string, page: number, limit: number, rideType: string, tripStatus: string,paymentOpt:string,startDate:any,endDate:any, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getByPagination(searchTerm, page, limit, rideType, tripStatus,paymentOpt,startDate,endDate), undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
};

export const createRequest = async (request: any, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.request.create, request, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating request:', error)

    return null
  }
};


export const requestEta = async (request: any, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.request.eta, request, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return response
    }
  } catch (error:any) {
    console.error('Error creating request:', error)
    
    return {
        success: false,
        message: error || "Something went wrong while fetching ETA details."
    };

  }
}

export const updateRequest = async (id: string, request: any, overrideZoneId?: any) => {
  try {
    const response = await patch(ENDPOINTS.request.update(id), request, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating request:', error)

    return null
  }
};

export const getByRequestId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getById(id), undefined, overrideZoneId)


    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting request by ID:', error)

    return null
  }
};

export const deleteByRequestId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.request.deleteById(id), overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting request by ID:', error)

    return null
  }
};

export const getByRequestHistory = async (phoneNumber: string, overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getByPhone(phoneNumber), undefined, overrideZoneId)


    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting request by ID:', error)

    return null
  }
};

export const getTripByReports = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getTripReports, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
};

export const getByTripCount = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getTripCount, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
};

export const getByLastTrips = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getLastTrips, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
};

export const getLogisticsByEarnings = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getLogisticsEarnings, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting earnings report by ID:', error)

    return null
  }
};

export const getByTotalEarnings = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getTotalEarnings, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting earnings report by ID:', error)

    return null
  }
};

export const getTripsByDriver = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getTripsByDriver, undefined, overrideZoneId);

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


export const getDriverSummary = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getDriverSummary, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {

    return null;
  }
};

export const getDriverReport = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.driver.getDriverReport, undefined, overrideZoneId);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {

    return null;
  }
};

export const getCompletedLocalTrip = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getCompletedLocalTrip, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
};

export const getCompletedRentalTrips = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getCompletedRentalTrip, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};

export const getTripWiseReports = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getTripWiseReports, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting trip report by ID:', error)

    return null
  }
}; 

export const getRentalList = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getRentalList, undefined, overrideZoneId);

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting rental trip list:', error)

    return null
  }
};

export const getByTodayEarnings = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getTodayEarnings, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};

export const getByTodayReport = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getTodayReport, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};

export const getWeeklyReport = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getWeeklyReport, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};

export const getMonthlyReport = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getMonthlyReport, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};

export const getYearlyRevenue = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getYearlyRevenue, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};

export const getTripsByUser = async ( overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.request.getTripsByUser, undefined, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
};

export const getChatHistory = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.request.getChatHistory(id));

    if (response?.success) {
      return response; // ✅ Return full response
    } else {
      console.warn('Unsuccessful response:', response);
      
      return null;
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    
    return null;
  }
};
