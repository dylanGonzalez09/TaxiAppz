// src/types.ts

export interface CategoryType {
  id: string;
  category: string;
  categoryImage: string;
  zoneId:string;
  zoneName?:string;
  status: boolean;
}
export interface VehicleModelType {
  id: string;
  status: string;
  description: string; 
  vehicleModel: string; 
  vehicleId: string; 

}
export interface GroupDocumentType {
  id: string;
  name: string;
  zoneId:string;
  zoneName?:string;
  status?: boolean;
}

export interface DocumentType {
  map(arg0: (doc: any) => any): unknown;
  id: string;
  documentName: string;
  required: boolean;
  identifier: boolean;
  expiryDate: boolean;
  issueDate: boolean;
  imageRequired: boolean;
  documentId: string;
  status?: boolean;
}
