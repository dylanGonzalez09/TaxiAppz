/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/fetchRoles.ts
import { get, post, patch, del } from './apiService'
import { ENDPOINTS } from './endpoint'

export const fetchWallet = async () => {
  try {
    const response = await get(ENDPOINTS.wallet.list)

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching wallet:', error)

    return []
  }
}

export const createWallet = async (wallet: any) => {
  try {
    const response = await post(ENDPOINTS.wallet.create, wallet)

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error creating wallet:', error)

    return null
  }
}


export const getWalletTransactionById = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.wallet.getTransactionById(id))

    if (response.success) {
      return response.data
    } else {
      return null
    }
  } catch (error) {

    return null
  }
}

export const getWalletUserByPagination = async (searchTerm: string, page: number, limit: number) => {
  try {
    const response = await get(ENDPOINTS.wallet.getWalletUserByPagination(searchTerm, page, limit))

    if (response.success) {

      return response.data
    } else {
      return null
    }
  } catch (error) {
   

    return null
  }
}


