// src/utils/apiService.ts
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

import { getServerSession } from 'next-auth'; // Server side
import { getSession } from 'next-auth/react'; // Client side

import { authOptions } from '@/app/api/login/auth'

import { BASE_URL } from './endpoint';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Helper to add headers, including optional zone override
const addHeaders = async (config: AxiosRequestConfig = {}, overrideZoneId?: any): Promise<AxiosRequestConfig> => {
  let session;

  if (typeof window !== 'undefined') {
    session = await getSession();
  } else {
    session = await getServerSession(authOptions);
  }

  if (!config.headers) {
    config.headers = {};
  }

  const accessToken = (session as any)?.accessToken;

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (session?.user?.image?.clientId) {
    config.headers['clientId'] = session.user.image.clientId;
  }



  

  // If overrideZoneId provided, set it; else try localStorage (only on client)
  if (overrideZoneId) {
    config.headers['zoneId'] = overrideZoneId;
  } else if (typeof window !== 'undefined') {
    const localZoneId = localStorage.getItem('defaultZoneId');
    
    if (localZoneId) {
      config.headers['zoneId'] = localZoneId;
    }
  }
  
  return config;
};

const handleResponse = (response: AxiosResponse) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    throw new Error(response.statusText);
  }
};

const handleError = (error: any) => {
  if (error.response) {
    const data = error.response.data || {};

    const parsedMessage =
      data.message ||
      data.msg ||
      (Array.isArray(data.errors) && data.errors.length > 0
        ? data.errors[0]?.message || data.errors[0]?.msg
        : undefined) ||
      error.response.statusText ||
      error.message;

    throw new Error(parsedMessage || 'Request failed');
  } else if (error.request) {
    throw new Error('No response received from server');
  } else {
    throw new Error(error.message);
  }
};

export const get = async (url: string, config?: AxiosRequestConfig, overrideZoneId?: any) => {
  try {
    const newConfig = await addHeaders(config, overrideZoneId);
    
    const response = await apiClient.get(url, newConfig);
    
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const post = async (url: string, data: any, config?: AxiosRequestConfig, overrideZoneId?: any) => {
  try {
    
    const newConfig = await addHeaders(config, overrideZoneId);
    const response = await apiClient.post(url, data, newConfig);
    

    return handleResponse(response);
  } catch (error: any) {
    
    const errorMessage = error.response || 'Something went wrong';
    
    return errorMessage;
  }
};

export const patch = async (url: string, data: any, config?: AxiosRequestConfig, overrideZoneId?: any) => {
  try {
    
    const newConfig = await addHeaders(config, overrideZoneId);
    
    const response = await apiClient.patch(url, data, newConfig);
    
    
    return handleResponse(response);
  } catch (error) {
   
    return handleError(error);
  }
};

export const del = async (url: string, config?: AxiosRequestConfig, overrideZoneId?: any) => {
  
  try {
   

    const newConfig = await addHeaders(config, overrideZoneId);
    const response = await apiClient.delete(url, newConfig);
    
    return handleResponse(response);
  } catch (error) {
    
    return handleError(error);
  }
};

export { apiClient };
