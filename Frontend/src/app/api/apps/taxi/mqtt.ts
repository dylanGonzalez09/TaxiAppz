/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'



export const InsideDrivers = async (ticket: any) => {
  try {
    const response = await post(ENDPOINTS.Mqtt.create, ticket)

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

