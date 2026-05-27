// src/services/apiService.ts
import { getSession } from 'next-auth/react'; // For client-side
import { getServerSession } from 'next-auth'; // For server-side

import { authOptions } from '@/app/api/login/auth'

import { BASE_URL } from './endpoint';

const FETCH_TIMEOUT_MS = 30000; // 30s - avoid hanging requests

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });

    clearTimeout(id);
    
return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

const addHeaders = async (overrideZoneId?: any): Promise<HeadersInit> => {
  let session;
  let localZoneId: string | null = null;

  if (typeof window !== 'undefined') {
    // Client-side: use getSession
    session = await getSession();

    // Get zoneId from localStorage only if no override
    if (!overrideZoneId) {
      localZoneId = localStorage.getItem('defaultZoneId');
    }
  } else {
    // Server-side: use getServerSession
    session = await getServerSession(authOptions);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const accessToken = (session as any)?.accessToken;

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const clientId = session?.user?.image?.clientId;

  if (clientId) {
    headers['clientId'] = clientId;
  }
  


  // Use overrideZoneId if provided, else fallback to localZoneId on client
  if (overrideZoneId) {
    headers['zoneId'] = overrideZoneId;
  } else if (localZoneId) {
    headers['zoneId'] = localZoneId;
  }

  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    
    const errorData = await response.json().catch(() => null);
  
    throw new Error(errorData?.message || 'API request failed');
  }
  
  return response.json();
};

export const get = async (
  url: string,
  params?: Record<string, any>,
  overrideZoneId?: any
) => {
  try {
    const headers = await addHeaders(overrideZoneId);

    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

    const response = await fetchWithTimeout(
      `${BASE_URL}${url}${queryString}`,
      { method: 'GET', headers, credentials: 'include' }
    );

    
return await handleResponse(response);
  } catch (error) {
    throw error;
  }
};

export const post = async (
  url: string,
  data: any,
  overrideZoneId?: any
) => {
  try {
    const headers = await addHeaders(overrideZoneId);

    const response = await fetchWithTimeout(
      `${BASE_URL}${url}`,
      { method: 'POST', headers, credentials: 'include', body: JSON.stringify(data) }
    );

    
return await handleResponse(response);
  } catch (error) {
    console.error('POST request error:', error);
    throw error;
  }
};

export const patch = async (
  url: string,
  data: any,
  overrideZoneId?: any
) => {
  try {
    const headers = await addHeaders(overrideZoneId);

    const response = await fetchWithTimeout(
      `${BASE_URL}${url}`,
      { method: 'PATCH', headers, credentials: 'include', body: JSON.stringify(data) }
    );

    
return await handleResponse(response);
  } catch (error) {
    console.error('PATCH request error:', error);
    throw error;
  }
};

export const del = async (
  url: string,
  overrideZoneId?: any
) => {
  try {
    const headers = await addHeaders(overrideZoneId);

    const response = await fetchWithTimeout(
      `${BASE_URL}${url}`,
      { method: 'DELETE', headers, credentials: 'include' }
    );

    
return await handleResponse(response);
  } catch (error) {
    console.error('DELETE request error:', error);
    throw error;
  }
};
