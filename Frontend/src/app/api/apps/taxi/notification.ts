// src/utils/fetchRoles.ts
import { get, post, del } from './apiService'

import { ENDPOINTS } from './endpoint'

export const  fetchNotifications = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.notification.list, undefined, overrideZoneId)

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

export const fetchUsers = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.notification.user, undefined, overrideZoneId)

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

export const fetchDrivers = async (overrideZoneId?: any) => {
  try {
    const response = await get(ENDPOINTS.notification.driver, undefined, overrideZoneId)

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

export const createNotification = async (notification: any, overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.notification.create, notification, overrideZoneId)

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

export const fetchDropDownByZone = async (clientId: string, zoneIds: string[] = [], overrideZoneId?: any) => {
  try {
    const response = await post(ENDPOINTS.notification.dropDownListByZone(clientId), { zoneIds }, overrideZoneId)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching zone filtered dropdown:', error)

    return null
  }
}

export const deleteByNotificationId = async (id: string, overrideZoneId?: any) => {
  try {
    const response = await del(ENDPOINTS.notification.deleteById(id), overrideZoneId)
    
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

export const sendBulkemail = async (data?: any) => {
  try {

    const response = await post(
      ENDPOINTS.notification.sendBulkemail,
      data
    )

    if (response.success) {
      return response.data
    } else {
      return null
    }

  } catch (error) {
    console.error('Error sending bulk email:', error)

    return null
  }
}

export const fetchEmailNotifications = async () => {
  try {
    const response = await get(ENDPOINTS.notification.emailNotifications)

    if (response.success) {
      return response.data
    }

    return []
  } catch (error) {
    console.error('Error fetching email notifications:', error)

    return []
  }
}