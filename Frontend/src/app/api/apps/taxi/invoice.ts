// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchInvoice = async () => {
  try {
    const response = await get(ENDPOINTS.invoice.list)

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

export const getQuestionsReport = async () => {
  try {
    const response = await get(ENDPOINTS.invoice.getQuestionsReport)

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


export const getByInvoiceByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.invoice.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createInvoice = async (invoice: any) => {
  try {
    const response = await post(ENDPOINTS.invoice.create, invoice)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error: any) {
    console.error('Error creating invoice:', error)
    
    if (error.response && error.response.data && error.response.data.message) {
        return { error: error.response.data.message };
    
      }
    
      return null
  }
}

export const updateInvoice = async (id: any, invoice: any) => {
  try {
    const response = await patch(ENDPOINTS.invoice.update(id), invoice)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } 
  catch (error) {
    console.error('Error updating invoice:', error)
    
    return null
  }
}


export const deleteByInvoiceId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.invoice.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting invoice by ID:', error)

    return null
  }
}

export const updateInvoiceStatus = async (id: string, invoice: any) => {
  try {
    const response = await patch(ENDPOINTS.invoice.updateStatus(id), invoice);

    if (response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error updating vehicleModel:', error);

    return null;
  }
};

export const getQuestionsDetails = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.invoice.getQuestionsDetails(id));

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

export const getInvoiceByLanguage = async (id: string,searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.invoice.getInvoiceByLanguage(id,searchTerm, page, limit));
   
    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching invoice by language:', error)

    return null;
  }
};
