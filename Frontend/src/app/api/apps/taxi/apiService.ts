// Enhanced API service with explicit zone support
import axios from 'axios';
import { getSession } from 'next-auth/react';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/login/auth'

import { BASE_URL } from './endpoint';

const apiService = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30s - avoid hanging requests
});

const toReadableError = (error: any): Error => {
  const data = error?.response?.data || {};

  const message =
    data?.message ||
    data?.msg ||
    data?.data?.message ||
    data?.data?.msg ||
    (Array.isArray(data?.errors) && data.errors.length > 0
      ? data.errors[0]?.message || data.errors[0]?.msg
      : undefined) ||
    error?.message ||
    'Request failed';

  return (message);
};

// Enhanced helper function with explicit zone override
const addHeaders = async (config: any, overrideZoneId?: any) => {
  let session;

  if (typeof window !== 'undefined') {
    session = await getSession();
  } else {
    session = await getServerSession(authOptions);
  }

  if (!config.headers) {
    config.headers = {};
  }

  // NextAuth stores our API token on `session.accessToken` (see auth callbacks).
  const accessToken = (session as any)?.accessToken;

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const clientId = session?.user?.image?.clientId;
  
  
  // Use override zone if provided, otherwise use session zone
  const zoneId = overrideZoneId || session?.user?.image?.zoneId || '';
  

  if (clientId) {
    config.headers.clientId = clientId;
  }

  if (zoneId) {
    config.headers.zoneId = zoneId;
  }

  return config;
};

// Enhanced API functions with optional zone override
export const get = async (url: string, params?: any, overrideZoneId?: any) => {
 
  try {
    
    const config = await addHeaders({ params }, overrideZoneId);
    const response = await apiService.get(url, config);
    
    return response.data;
  } catch (error) {
    throw toReadableError(error);
  }
};

export const post = async (url: string, data: any, overrideZoneId?: any) => {
  
  try {
   
    const config = await addHeaders({}, overrideZoneId);
    
    const response = await apiService.post(url, data, config);
    
    return response.data;
  } catch (error) {
    throw toReadableError(error);
  }
};

export const patch = async (url: string, data: any, overrideZoneId?: any) => {
  try {
   
    const config = await addHeaders({}, overrideZoneId);
    
    
    const response = await apiService.patch(url, data, config);

    console.log(response)
    
return response.data;
  } catch (error) {
    console.error('PATCH request error:', error);

    throw toReadableError(error);
  }
};

export const del = async (url: string, overrideZoneId?: any) => {
 
  try {
   
    const config = await addHeaders({}, overrideZoneId);
   
    const response = await apiService.delete(url, config);
   
    return response.data;
  } catch (error) {
    console.error('DELETE request error:', error);

    throw toReadableError(error);
  }
};