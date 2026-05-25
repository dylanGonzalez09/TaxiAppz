// src/services/apiService.ts
import { getSession } from 'next-auth/react'; // For client-side
import { getServerSession } from 'next-auth'; // For server-side

import { BASE_URL } from './endpoint';

const addHeaders = async () => {
    let session;

    // Determine whether the code is running on the client or server
    if (typeof window !== 'undefined') {
        // Client-side: use getSession
        session = await getSession();
    } else {
        // Server-side: use getServerSession
        session = await getServerSession();
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Add Authorization header if the session contains an accessToken
    if (session?.user?.name) {
        headers['Authorization'] = `Bearer ${session.user.name}`;
    }

    const clientId = session?.user?.image?.clientId; // Access clientId
    const companyId = session?.user?.image?.companyId; // Access companyId

    if (clientId) {
        headers['clientId'] = clientId;
    }

    if (companyId) {
        headers['companyId'] = companyId;
    }

    return headers;
};

const handleResponse = async (response: Response) => {


    
    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || 'API request failed');
    }

    
return response.json();
};

export const get = async (url: string, params?: Record<string, any>) => {
    try {
        const headers = await addHeaders();

        const queryString = params
            ? '?' + new URLSearchParams(params).toString()
            : '';

        const response = await fetch(`${url}${queryString}`, {
            method: 'GET',
            headers,
            credentials: 'include',
        });

        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

export const post = async (url: string, data: any) => {
    try {
        const headers = await addHeaders();

        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('POST request error:', error);
        throw error;
    }
};

export const patch = async (url: string, data: any) => {
    try {
        const headers = await addHeaders();

        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'PATCH',
            headers,
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('PATCH request error:', error);
        throw error;
    }
};

export const del = async (url: string) => {
    try {
        const headers = await addHeaders();

        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'DELETE',
            headers,
            credentials: 'include',
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('DELETE request error:', error);
        throw error;
    }
};
