import axios from 'axios';

import { ENDPOINTS } from './endpoint';

export const createJson = async (formData: FormData) => {
  try {
    const response = await axios.post(ENDPOINTS.json.create, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to upload file');
    }
  } catch (error) {
    console.error('Error creating JSON:', error);
    throw error;
  }
};
