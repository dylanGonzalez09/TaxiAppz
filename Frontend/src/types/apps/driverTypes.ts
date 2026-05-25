export interface DriverData {
  key: number;
  sl: number;
  name: string;
  phone: string;
  status: 'active' | 'inactive' | 'block';
  avatarColor: string;
  wallet: number;
  rating: number;
  vehicleType: string;
  vehicleModel: string;
  documentUploaded: 'Yes' | 'No';
  blockedReason : string
  online:'Online' | 'Offline';

  }
  