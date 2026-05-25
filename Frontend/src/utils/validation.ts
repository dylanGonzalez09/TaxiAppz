// utils/validation.ts

/**
 * Improved validation functions with consistent dictionary handling
 */

interface Vehicle
{
  capacity: number;
  categoryId: string | null;
  clientId: string;
  campanyId: string | null;
  hightlightImage: FileList | null;
  id: string;
  image: FileList |null;
  serviceType: string[];
  sortingorder: number;
  status: boolean;
  vehicleName: string;
}

export const validateTextOnly = (value: string | undefined, dictionary?: any): true | string => {
  if (!value || value.trim() === '') return true;

  if (!/^[a-zA-Z\s]*$/.test(value)) {
    return dictionary['navigation'].onlyText || 'Only text characters are allowed';
  }

  
return true;
};

export const validateNumeric = (value: string | undefined, dictionary?: any): true | string => {
  if (value === undefined || value.trim() === '') {
    return dictionary['navigation'].required || 'This field is required';
  }

  if (!/^\d+$/.test(value)) {
    return dictionary['navigation'].onlyNumbers || 'Only numbers are allowed';
  }

  if (Number(value) < 0) {
    return dictionary['navigation'].nonNegative || 'Value cannot be negative';
  }

  
return true;
};

// export const validateMinLength = (min: number, dictionary?: any) => 
//   (value: string | undefined): true | string => {
//     if (!value || value.length < min) {
//       const message = dictionary['navigation'].atLeast || 'Must be at least {min} characters';
//       return message.replace('{min}', String(min));
//     }
//     return true;
//   };

// export const validateMaxLength = (max: number, dictionary?: any) => 
//   (value: string | undefined): true | string => {
//     if (!value || value.length > max) {
//       const message = dictionary['navigation'].maxLength || 'Cannot exceed {max} characters';
//       return message.replace('{max}', String(max));
//     }
//     return true;
//   };

export const validateEmail = (value: string | undefined, dictionary?: any): true | string => {
  // If value is empty or undefined, it's valid (email is optional)
  if (value === undefined || value === null || value.trim() === '') {
    return true;
  }

  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strict = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  
  if (!basic.test(value)) {
    return dictionary['navigation'].emailInvalid || 'Invalid email format';
  }

  if (!strict.test(value)) {
    return dictionary['navigation'].emailLowercase || 'Email must be lowercase and properly formatted';
  }

  return true;
};

export const validatePhoneNumber = (value: string | undefined, dictionary?: any): true | string => {
  if (!value || value.trim() === '') {
    return dictionary['navigation'].phoneRequired || 'Phone number is required';
  }

  const trimmed = value.trim();

  if (!/^[\d\s]+$/.test(trimmed)) {
    return dictionary?.['navigation']?.onlyNumbers || 'Only numbers and spaces are allowed';
  }

  const len = trimmed.length;

  if (len < 7 || len > 16) {
    return dictionary['navigation'].phoneLength || 'Phone number must be between 7 and 16 digits';
  }

  
return true;
};

export const validPhoneNumber = (
  value: string | undefined, 
  phoneLength: number | null = null, 
  dictionary?: any
): true | string => {
  if (!value || value.trim() === '') {
    return dictionary['navigation'].phoneRequired || 'Phone number is required';
  }

  const trimmed = value.trim();
  
  if (!/^\d+$/.test(trimmed)) {
    return dictionary['navigation'].onlyNumbers || 'Only numbers are allowed';
  }

  if (phoneLength !== null && trimmed.length !== Number(phoneLength)) {
    const message = dictionary['navigation'].phoneExact || 'Phone number must be exactly {length} digits';

    
return message.replace('{length}', String(phoneLength));
  }

  if (trimmed.length < 7 || trimmed.length > 16) {
    return dictionary['navigation'].phoneLength || 'Phone number must be between 7 and 16 digits';
  }

  
return true;
};

export const textAndMin = (value: string | undefined, dictionary?: any): true | string => {
  if (!value || value.trim() === '') {
    return dictionary['navigation'].required || 'This field is required';
  }

  if (!/^[a-zA-Z\s]*$/.test(value)) {
    return dictionary['navigation'].onlyText || 'Only text characters are allowed';
  }

  if (value.length < 3) {
    return dictionary['navigation'].minThree || 'Must be at least 3 characters';
  }

  
return true;
};

export const validatePassword = (value: string | undefined, dictionary?: any): true | string => {
  if (!value) {
    return dictionary['navigation'].required || 'Password is required';
  }

  if (value.length < 8) {
    return dictionary['navigation'].passwordLength || 'Password must be at least 8 characters';
  }

  
return true;
};

export const validatePasswordsMatch = (newPassword: string | undefined, dictionary?: any) => 
  (confirmPassword: string | undefined): true | string => {
    if (newPassword !== confirmPassword) {
      return dictionary['navigation'].passwordMismatch || 'Passwords do not match';
    }

    
return true;
  };

export const validateText = (value: string | undefined, dictionary?: any): true | string => {
  if (value === undefined || value === '') return true;

  if (!/^[a-zA-Z\s]*$/.test(value)) {
    return dictionary['navigation'].onlyText || 'Only text characters are allowed';
  }

  
return true;
};

export const validateImage = (fileList: FileList | null, dictionary?: any): true | string => {
  if (!fileList || fileList.length === 0) {
    return dictionary['navigation'].imageRequired || 'Image is required';
  }

  const file = fileList[0];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return dictionary['navigation'].imageInvalid || 'Invalid image format (JPG, PNG, GIF only)';
  }

  if (file.size > 5 * 1024 * 1024) {
    return dictionary['navigation'].imageTooLarge || 'Image must be less than 5MB';
  }

  
return true;
};

export const validateAtLeastOneChecked = (value: string[], dictionary?: any): true | string => {
  if (value.length === 0) {
    return dictionary['navigation'].minOneCheckbox || 'Select at least one option';
  }

  
return true;
};

export const checkOrder = (value: string | undefined,id: string | null,vehicleData?: Array<Vehicle> | undefined,dictionary?: any):true | string => {
  if(vehicleData)
  {
    if(id === null)
    {
      const exists = vehicleData.some((item => 
        item.sortingorder === Number(value)
      ));

      if(exists) 
      
        {
        return dictionary['navigation'].orderCheck || 'Sorting order is already exists...Kindly give some other value';
      }
    }
  }
  
  return true;
}

export const validatePhoneWithOutNumber = (value: string | undefined, dictionary?: any): true | string => {
  if (!value) return true;
  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed)) {
    return dictionary['navigation'].onlyNumbers || 'Only numbers are allowed';
  }

  if (trimmed.length < 7 || trimmed.length > 16) {
    return dictionary['navigation'].phoneLength || 'Phone number must be between 7 and 16 digits';
  }

  
return true;
};

export const validateSmallTextOnly = (value: string, dictionary?: any): true | string => {
  if (value.length !== 2) {
    const message = dictionary['navigation'].exactLength || 'Must be exactly {count} characters';

    
return message.replace('{count}', '2');
  }

  if (!/^[a-z]+$/.test(value)) {
    return dictionary['navigation'].onlyLowercase || 'Only lowercase letters are allowed';
  }

  
return true;
};

export const validateNumber = (value: string | undefined, dictionary?: any): true | string => {
  if (value === undefined) {
    return dictionary['navigation'].required || 'This field is required';
  }

  if (!/^\d*\.?\d+$/.test(value)) {
    return dictionary['navigation'].onlyNumbers || 'Only numbers are allowed';
  }

  if (Number(value) < 0) {
    return dictionary['navigation'].nonNegative || 'Value cannot be negative';
  }

  
return true;
};

export const validatePhoneLive = (value: string | undefined, dictionary?: any): true | string => {
  if (!value || value.trim() === '') {
    return dictionary?.['navigation']?.phoneRequired || 'Phone number is required';
  }

  // Allow letters, digits, and spaces only (adjust regex as needed)
  if (!/^[a-zA-Z0-9\s]*$/.test(value)) {
    return dictionary?.['navigation']?.onlyNumbers || 'Only alphanumeric characters and spaces are allowed';
  }

  // Remove all non-digit characters to check length of digits only
  const digitsOnly = value.replace(/\D/g, '');

  if (digitsOnly.length < 7 || digitsOnly.length > 16) {
    return dictionary?.['navigation']?.phoneLength || 'Phone number must be between 7 and 16 digits';
  }

  return true;
};
