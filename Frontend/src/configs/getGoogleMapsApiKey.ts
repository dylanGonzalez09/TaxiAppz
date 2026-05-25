// utils/getGoogleMapsApiKey.ts
import { fetchSettings } from '@/app/api/apps/taxi/setting';

let cachedKey: string | null = null;

export const getGoogleMapsApiKey = async (): Promise<string> => {
  if (cachedKey) return cachedKey;

  const settings = await fetchSettings();
  const general = settings.find((item: any) => item._id === 'keys');
  const apiKey = general?.settings.find((s: any) => s.name === 'geoCoderApiKey')?.value;

  if (!apiKey) throw new Error('Google Maps API Key not found in settings');

  cachedKey = apiKey;
  
  return apiKey;
};
