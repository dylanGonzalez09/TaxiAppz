// src/utils/fetchRoles.ts
import { get, post, del } from './apiService'

import { ENDPOINTS } from './endpoint'

export const  fetchNotifications = async () => {
  try {
    const response = await get(ENDPOINTS.notification.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching notification:', error)

    return []
  }
}

export const fetchUsers = async () => {
  try {
    const response = await get(ENDPOINTS.notification.user)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching notification:', error)

    return []
  }
}

export const fetchDrivers = async () => {
  try {
    const response = await get(ENDPOINTS.notification.driver)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching notification:', error)

    return []
  }
}

export const createNotification = async (notification: any) => {

  try {
    const response = await post(ENDPOINTS.notification.create, notification)
 
    if (response.success) {
      return response
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating notification:', error)

    return null
  }
}




export const deleteByNotificationId = async (id: string) => {
  
  try {
    const response = await del(ENDPOINTS.notification.deleteById(id))
    
    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting notification by ID:', error)

    return null
  }
}
