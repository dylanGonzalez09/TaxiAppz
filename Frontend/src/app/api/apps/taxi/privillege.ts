// src/utils/fetchRoles.ts

import { AxiosError } from 'axios'

import { get, patch } from './apiService'

import { ENDPOINTS } from './endpoint'


export const fetchPrivillage = async (id: any) => {
  try {
    const response = await get(ENDPOINTS.privillege.list(id))

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching permission:', error)

    return []
  }
}

export const fetchPrivillageName = async (id: any) => {
  try {
    const response = await get(ENDPOINTS.privillege.listName(id))

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        return;
      }
    } else {
      console.error('Error fetching permissionName:', error);
    }

    return []
  }
}

export const giveprivillege = async (id: string, privillege: any) => {
  try {
    const response = await patch(ENDPOINTS.privillege.update(id), privillege)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error updating permission:', error)

    return null
  }
}
