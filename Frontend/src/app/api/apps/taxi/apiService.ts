// src/services/apiService.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';  // For client-side

import { getServerSession } from 'next-auth';  // For server-side

import { BASE_URL } from './endpoint';

const apiService = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Helper function to add headers to the request
const addHeaders = async (config: any) => {
  let session;

  // Determine whether the code is running on the client or server
  if (typeof window !== 'undefined') {
    // Client-side: use getSession
    session = await getSession();
  } else {
    // Server-side: use getServerSession
    session = await getServerSession();
  }

  // Ensure headers object is initialized
  if (!config.headers) {
    config.headers = {};
  }

  // Add Authorization header if the session contains an accessToken
  if (session?.user?.name) {
    config.headers['Authorization'] = `Bearer ${session.user.name}`;
  }

  const clientId = session?.user?.image?.clientId; // Access clientId
  const companyId = session?.user?.image?.companyId; // Access companyId

  if (clientId) {
    config.headers.clientId = clientId;
  }

  if (companyId) {
    config.headers.companyId = companyId;
  }

  return config;
};

export const get = async (url: string, params?: any) => {
  try {
    const config = await addHeaders({ params });
    const response = await apiService.get(url, config);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const post = async (url: string, data: any) => {
  try {
    const config = await addHeaders({});
    const response = await apiService.post(url, data, config);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const patch = async (url: string, data: any) => {
  try {
    const config = await addHeaders({});
    const response = await apiService.patch(url, data, config);

    return response.data;
  } catch (error) {
    console.error('PATCH request error:', error);
    throw error;
  }
};

export const del = async (url: string) => {
  try {
    const config = await addHeaders({});
    const response = await apiService.delete(url, config);

    return response.data;
  } catch (error) {
    console.error('DELETE request error:', error);
    throw error;
  }
};
