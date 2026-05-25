// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchPermission = async () => {
  try {
    const response = await get(ENDPOINTS.permission.list)

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

export const getPermissionWithPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.permission.getByPagination(searchTerm, page, limit))

    if (response.success) {



      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}

export const createPermission = async (permission: any) => {
  try {
    const response = await post(ENDPOINTS.permission.create, permission)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating permission:', error)

    return null
  }
}

export const updatePermission = async (id: string, permission: any) => {
  try {
    const response = await patch(ENDPOINTS.permission.update(id), permission)

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

export const getByPermissionId = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.permission.getById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting permission by ID:', error)

    return null
  }
}

export const deleteByPermissionId = async (id: string) => {
  try {
    const response = await del(ENDPOINTS.permission.deleteById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error deleting permission by ID:', error)

    return null
  }
}
