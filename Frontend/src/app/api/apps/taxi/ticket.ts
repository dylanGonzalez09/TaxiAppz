// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchTicket = async () => {
  try {
    const response = await get(ENDPOINTS.ticket.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching ticket:', error)

    return []
  }
}

export const fetchAdmins = async () => {
    try { 
      const response = await get(ENDPOINTS.user.getAllAdmin)
  
      if (response.success) {
        return response.data
      } else {
        return []
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
  
      return []
    }
  }
 
  export const fetchGroupTicketsByAdmin = async () => {
    try {
      const response = await get(ENDPOINTS.ticket.groupTicketsByAdmin)
  
      if (response.success) {
        return response.data
      } else {
        return []
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
  
      return []
    }
  }
 
  

export const getByTicketByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.ticket.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


export const createTicket = async (ticket: any) => {
  try {
    const response = await post(ENDPOINTS.ticket.create, ticket)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating ticket:', error)

    return null
  }
}

export const updateTicket = async (id: any, ticket: any) => {
  try {
    const response = await patch(ENDPOINTS.ticket.update(id), ticket)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating ticket:', error)

    return null
  }
}

export const assignAdminAndUpdateStatus = async (id: any, ticket: any) => {
  try {
    const response = await patch(ENDPOINTS.ticket.assignAdminAndUpdateStatus(id), ticket);

    if (response.success) {
      return response.data;  
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};


export const deleteByTicketId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.ticket.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting ticket by ID:', error)

    return null
  }
}

export const updateTicketStatus = async (id: string, ticket: any) => {
  try {
    const response = await patch(ENDPOINTS.ticket.updateStatus(id), ticket);

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
