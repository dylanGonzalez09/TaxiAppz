

// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService';
import { ENDPOINTS } from './endpoint';



export const fetchCountries = async () => {
    try {
        const response = await get(ENDPOINTS.country.activeList);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

export const fetchDocumentCount = async () => {
    try {
        const response = await get(ENDPOINTS.rental.getRentalCount);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

// export const fetchCountries = async () => {
//     try {
//         const response = await fetch(ENDPOINTS.country.activeList);

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         if (data.success) {
//             return data.data;
//         } else {
//             return [];
//         }
//     } catch (error) {
//         console.error('Error fetching countries:', error);
//         return [];
//     }
// };

export const fetchZone = async () => {
    try {
        const response = await get(ENDPOINTS.zone.list);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

export const fetchVehicle = async () => {
    try {
        const response = await get(ENDPOINTS.vehicle.list);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

export const fetchRental = async () => {
    try {
        const response = await get(ENDPOINTS.rental.list);

        if (response.success) {
            return response.data
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
};

export const getRentalWithPagination = async (id:string, searchTerm: string, page: number, limit: number) => {
    try {
        const response = await get(ENDPOINTS.rental.getByPagination(id,searchTerm, page, limit))

        if (response.success) {



            return response.data
        } else {
            return null
        }
    } catch (error) {
       

        return null
    }
}


export const createRental = async (rental: any) => {
    try {
        const response = await post(ENDPOINTS.rental.create, rental);

     if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.data.message || 'Error creating rental' };
    }
  } catch (error: any) {
    // Make sure to safely access error details
    const errorMessage = error.response?.data?.message || 'Something went wrong';

    
return { success: false, message: errorMessage };
  }
};

export const updateRental = async (id: any, rental: any) => {
    try {
        const response = await patch(ENDPOINTS.rental.update(id), rental)

        if (response.success) {
            return response.data
        } else {
            return null
        }
    } catch (error) {
        console.error('Error updating rental:', error)

        return null
    }
}


export const getByRentalId = async (id: string) => {
    try {
        const response = await get(ENDPOINTS.rental.getById(id));

        if (response.success) {
            return response.data
        } else {
            return null
        }
    } catch (error) {
        return null;
    }
};

export const deleteRentalById = async (id: string) => {
    try {
        const response = await del(ENDPOINTS.rental.deleteById(id));

        if (response.success) {
            return response.data
        } else {
            return null
        }
    } catch (error) {
        return null;
    }
};

export const updateRentalStatus = async (id: string, rental: any) => {
    try {
        const response = await patch(ENDPOINTS.rental.updateStatus(id), rental);

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

export const getRentalZones = async () => {
    try {
        const response = await get(ENDPOINTS.rental.getRentalZones);

        if (response.success) {
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting zone:', error);

        return null;
    } 
};
