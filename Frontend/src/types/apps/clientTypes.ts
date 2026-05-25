export interface ClientType {
  clientId(clientId: any): unknown;
  _id?: string;
  id?: string;
  Name?: string;
  clientCode?: string;
  Startdate?: string;
  Enddate?: string;
  noOfVehicle?: string;
  status?: boolean;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  emergencyNumber?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
  active?: boolean;
  subScriptionId?: string;
  features:string;
  taxiModules: string;
  noOfDrivers:string;
  noOfUsers:string;
  demoKey?: string;

};
