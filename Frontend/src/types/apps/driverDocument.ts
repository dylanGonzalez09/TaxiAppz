export interface DriverDocumentType {
  _id: string; // ID of the document
  documentName: string; // Name of the document
  required: boolean; // Indicates if the document is required
  identifier: boolean; // Indicates if an identifier is required
  expiryDate: boolean; // Indicates if an expiry date is required
  issueDate: boolean; // Indicates if an issue date is required
  documentId: string; // Unique ID for the document
  status: boolean; // Status of the document (e.g., active/inactive)
  clientId: string; // ID of the client associated with the document
  categoryName: string; // Name of the category (e.g., "AadharCard")
  documentImage: string; // URL of the document image
  expriyReason: string; // Reason for expiry or if not uploaded
  expiryStatus?: boolean; // Status of expiry (true if expired)
  documentStatus: string; // Status of the document (e.g., "APPROVED", "DENIED")
  driverDocstatus: boolean; // Status specific to the driver (e.g., completed)
  // Optional fields for when `issueDate`, `expiryDate`, or `identifier` is true
  issueDateValue?: string; // Value of the issue date (format: "DD/MM/YYYY")
  expiryDateValue?: string; // Value of the expiry date (format: "DD/MM/YYYY")
  identifierValue?: string; // Value of the identifier (can be a string or number)
  driverDocmentId: string;
}
