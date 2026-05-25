// src/utils/apiService.ts
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

import { getServerSession } from 'next-auth'; // Ensure correct path to next-auth

import { getSession } from 'next-auth/react';  // For client-side

import { BASE_URL } from './endpoint';

const apiClient = axios.create({
  baseURL: BASE_URL, // Replace with your API base URL
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
  async (config) => {
    let session;

    if (typeof window !== 'undefined') {
      // Client-side: use getSession
      session = await getSession();
    } else {
      // Server-side: use getServerSession
      session = await getServerSession();
    }


    const token = session?.user?.name;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const clientId = session?.user?.image?.clientId;
    const companyId = session?.user?.image?.companyId;


    if (companyId) {
      config.headers.companyId = companyId;
    }

    if (clientId) {
      config.headers.clientId = clientId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleResponse = (response: AxiosResponse) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    throw new Error(response.statusText);
  }
};

const handleError = (error: any) => {
  if (error.response) {
    // Request made and server responded
    throw new Error(error.response.data.message || error.response.statusText);
  } else if (error.request) {
    // Request made but no response received
    throw new Error('No response received from server');
  } else {
    throw new Error(error.message);
  }
};

export const get = async (url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await apiClient.get(url, config);

    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const post = async (url: string, data: any, config?: AxiosRequestConfig) => {
  try {
    const response = await apiClient.post(url, data, config);

    return handleResponse(response);
  }  catch (error: any) {
    const errorMessage = ( error.response) || 'Something went wrong';

    return errorMessage;
  }
};

export const patch = async (url: string, data: any, config?: AxiosRequestConfig) => {
  try {
    const response = await apiClient.patch(url, data, config);

    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const del = async (url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await apiClient.delete(url, config);

    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export { apiClient };
