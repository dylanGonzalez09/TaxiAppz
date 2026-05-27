/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Allows letters from all languages (Tamil, Arabic, English, etc.) and spaces only
if (!/^[\p{L}\s]*$/u.test(value)) {
  return dictionary['navigation']?.onlyText || 'Only text characters are allowed';
}

return true;
};

export const validateSentence = (
  value: string | undefined,
  dictionary?: any
): true | string => {
  if (!value || value.trim() === '') return true;

  // Rules:
  // Letters from all languages
  // Spaces
  // . , ! ? ' -
  const regex =
    /^(?!.*([.,!?'\-])\1{1,})(?!.*\s{2,})[\p{L}\s.,!?'-]+$/u;

  if (!regex.test(value)) {
    return (
      dictionary['navigation']?.invalidSentence ||
      'Invalid sentence format'
    );
  }

  return true;
};


export const validateRoleName = (value: string | undefined, dictionary?: any): true | string => {
  if (!value || value.trim() === '') return true;

  const trimmedValue = value.trim();

  if (!/^[a-zA-Z\s]*$/.test(trimmedValue)) {
    return dictionary?.['navigation']?.onlyText || 'Only text characters are allowed';
  }

  // Reject repeated letter
  if (/(.)\1{2,}/i.test(trimmedValue.replace(/\s+/g, ''))) {
    return dictionary?.['navigation']?.invalidRoleName || 'Role name cannot contain repeated characters';
  }

  return true;
};

export const validateNumeric = (value: string | undefined, dictionary?: any): true | string => {
  if (value === undefined || value.trim() === '') {
    return dictionary['navigation']?.required || 'This field is required';
  }

  if (!/^\d+$/.test(value)) {
    return dictionary['navigation']?.onlyNumbers || 'Only numbers are allowed';
  }

  if (Number(value) < 0) {
    return dictionary['navigation']?.nonNegative || 'Value cannot be negative';
  }

return true;
};

// export const validateMinLength = (min: number, dictionary?: any) =>
//   (value: string | undefined): true | string => {
//     if (!value || value.length < min) {
//       const message = dictionary['navigation']?.atLeast || 'Must be at least {min} characters';
//       return message.replace('{min}', String(min));
//     }
//     return true;
//   };

// export const validateMaxLength = (max: number, dictionary?: any) =>
//   (value: string | undefined): true | string => {
//     if (!value || value.length > max) {
//       const message = dictionary['navigation']?.maxLength || 'Cannot exceed {max} characters';
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
    return dictionary['navigation']?.emailInvalid || 'Invalid email format';
  }

  if (!strict.test(value)) {
    return dictionary['navigation']?.emailLowercase || 'Email must be lowercase and properly formatted';
  }

  return true;
};

export const validatePhoneNumber = (value: string | undefined, dictionary?: any): true | string => {
  if (!value || value.trim() === '') {
    return dictionary['navigation']?.phoneRequired || 'Phone number is required';
  }

  const trimmed = value.trim();

  if (!/^[\d\s]+$/.test(trimmed)) {
    return dictionary?.['navigation']?.onlyNumbers || 'Only numbers and spaces are allowed';
  }

  const len = trimmed.length;

  if (len < 7 || len > 16) {
    return dictionary['navigation']?.phoneLength || 'Phone number must be between 7 and 16 digits';
  }

return true;
};

// export const validateInputContent = (value: string | undefined, dictionary?: any): true | string => {
//     const val = (value || '').trim();

//     //  Allow valid characters
//     if (!/^[A-Za-z0-9\s,.\-/#()]+$/.test(val)) {
//       return 'Address contains invalid characters';
//     }

//     // remove spaces for strict repeat check
//     const noSpaceVal = val.replace(/\s+/g, '');

//     // Block repeated letters (aaa, aaaa)
//     if (/([A-Za-z])\1{2,}/.test(noSpaceVal)) {
//       return 'Address cannot contain repeated letters';
//     }

//     //  Block repeated numbers (1111, 999999)
//     if (/(\d)\1{2,}/.test(noSpaceVal)) {
//       return 'Address cannot contain repeated numbers';
//     }

//     //  Block repeated special chars (---, ///, ###)
//     if (/([,.\-/#()])\1{2,}/.test(noSpaceVal)) {
//       return 'Address cannot contain repeated special characters';
//     }

//     return true;
// }


export const validateInputContent = (
  value: string | undefined,
  dictionary?: any
): true | string => {
  const val = (value || '').trim();

  //  Allow all language letters + numbers + common address chars
  if (!/^[\p{L}0-9\s,.\-/#()]+$/u.test(val)) {
    return (
      dictionary?.navigation?.invalidAddress ||
      'Address contains invalid characters'
    );
  }

  // Remove spaces for repeat checks
  const noSpaceVal = val.replace(/\s+/g, '');

  //  Block repeated letters in any language
  if (/([\p{L}])\1{2,}/u.test(noSpaceVal)) {
    return (
      dictionary?.navigation?.repeatedLetters ||
      'Address cannot contain repeated letters'
    );
  }

  // Block repeated numbers (111, 9999)
  if (/(\d)\1{2,}/.test(noSpaceVal)) {
    return (
      dictionary?.navigation?.repeatedNumbers ||
      'Address cannot contain repeated numbers'
    );
  }

  // Block repeated special chars (---, ///, ###)
  if (/([,.\-/#()])\1{2,}/.test(noSpaceVal)) {
    return (
      dictionary?.navigation?.repeatedSpecialChars ||
      'Address cannot contain repeated special characters'
    );
  }

  return true;
};

export const validatePersonName = (value: string | undefined, dictionary?: any): true | string => {
  if (!value || value.trim() === '') return true

  const trimmed = value.trim()

  // Letters + spaces only
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return dictionary?.navigation?.nameInvalid || dictionary?.navigation?.onlyText || 'Please enter a valid name'
  }

  // No multiple spaces
  if (/\s{2,}/.test(trimmed)) {
    return dictionary?.navigation?.nameInvalid || 'Please enter a valid name'
  }

  // Overall length
  if (trimmed.length < 2 || trimmed.length > 50) {
    return dictionary?.navigation?.nameLength || 'Name must be between 2 and 50 characters'
  }

  // Prevent very long single-word garbage (e.g., 40+ chars with no space)
  const maxWordLen = 20
  const words = trimmed.split(' ').filter(Boolean)

  if (words.some(w => w.length > maxWordLen)) {
    return dictionary?.navigation?.nameInvalid || 'Please enter a valid name'
  }

  return true
}


export const validPhoneNumber = (
  value: string | undefined,
  phoneLength: number | null = null,
  dictionary?: any
): true | string => {
  if (!value || value.trim() === '') {
    return dictionary['navigation']?.phoneRequired || 'Phone number is required';
  }

  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed)) {
    return dictionary['navigation']?.onlyNumbers || 'Only numbers are allowed';
  }
  
  if (phoneLength !== 0 && phoneLength !== null && trimmed.length !== Number(phoneLength)) {
    const message = dictionary['navigation']?.phoneExact || 'Phone number must be exactly {length} digits';

    return message.replace('{length}', String(phoneLength));
  }

  // if (trimmed.length < 7 || trimmed.length > 16) {
  //   return dictionary['navigation']?.phoneLength || 'Phone number must be between 7 and 16 digits';
  // }

return true;
};

export const textAndMin = (value: string | undefined, dictionary?: any): true | string => {
  if (!value || value.trim() === '') {
    return dictionary['navigation']?.required || 'This field is required';
  }

  if (!/^[\p{L}\s]*$/u.test(value)) {
    return dictionary['navigation']?.onlyText || 'Only text characters are allowed';
  }

  if (value.length < 3) {
    return dictionary['navigation']?.minThree || 'Must be at least 3 characters';
  }

return true;
};

export const validatePassword = (value: string | undefined, dictionary?: any): true | string => {


  if (!value) {
    return dictionary['navigation']?.required || 'Password is required';
  }

  if (value.length < 8) {
    return dictionary['navigation']?.passwordLength || 'Password must be at least 8 characters';
  }

   const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;

  if (!strongPassword.test(value)) {
    return 'Please enter a strong password';
  }

return true;
};

export const validatePasswordsMatch = (newPassword: string | undefined, dictionary?: any) =>

  (confirmPassword: string | undefined): true | string => {
    if (newPassword !== confirmPassword) {
      return  'Confirm password was not matched';
    }

return true;
  };

export const validateText = (value: string | undefined, dictionary?: any): true | string => {
  if (value === undefined || value === '') return true;

  if (!/^[\p{L}\s]*$/u.test(value)) {
    return dictionary['navigation']?.onlyText || 'Only text characters are allowed';
  }

return true;
};

export const validateImage = (fileList: FileList | null, dictionary?: any): true | any => {
  if (!fileList || fileList.length === 0) {
    return dictionary['navigation']?.imageRequired || 'Image is required';
  }

  const file = fileList[0];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return dictionary['navigation']?.imageInvalid || 'Invalid image format (JPG, PNG, GIF only)';
  }

  if (file.size > 5 * 1024 * 1024) {
    return dictionary['navigation']?.imageTooLarge || 'Image must be less than 5MB';
  }


return true;
};

export const validateAtLeastOneChecked = (value: string[], dictionary?: any): true | string => {
  if (value.length === 0) {
    return dictionary['navigation']?.minOneCheckbox || 'Select at least one option';
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
        return dictionary['navigation']?.orderCheck || 'Sorting order is already exists...Kindly give some other value';
      }
    }
  }

  return true;
}

export const validatePhoneWithOutNumber = (value: string | undefined, dictionary?: any): true | string => {
  if (!value) return true;
  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed)) {
    return dictionary['navigation']?.onlyNumbers || 'Only numbers are allowed';
  }

  if (trimmed.length < 7 || trimmed.length > 16) {
    return dictionary['navigation']?.phoneLength || 'Phone number must be between 7 and 16 digits';
  }

return true;
};

export const validateSmallTextOnly = (value: string, dictionary?: any): true | string => {
  if (value.length !== 2) {
    const message = dictionary['navigation']?.exactLength || 'Must be exactly {count} characters';

return message.replace('{count}', '2');
  }

  if (!/^[a-z]+$/.test(value)) {
    return dictionary['navigation']?.onlyLowercase || 'Only lowercase letters are allowed';
  }

return true;
};

export const validateNumber = (value: string | undefined, dictionary?: any): true | string => {
  if (value === undefined) {
    return dictionary['navigation']?.required || 'This field is required';
  }

  if (!/^\d*\.?\d+$/.test(value)) {
    return dictionary['navigation']?.onlyNumbers || 'Only numbers are allowed';
  }

  if (Number(value) < 0) {
    return dictionary['navigation']?.nonNegative || 'Value cannot be negative';
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

export const validateAddress = (
  value: string | undefined,
  dictionary?: any
): true | string => {

  if (!value || value.trim() === '') {
    return dictionary?.['navigation']?.newAddressRequired || 'Address is required';
  }

  const trimmed = value.trim();

  //  Allow common address characters
  const validPattern = /^[a-zA-Z0-9\s,./#-]+$/;

  if (!validPattern.test(trimmed)) {
    return (
      dictionary?.['navigation']?.invalidAddress ||
      'Address contains invalid characters'
    );
  }

  //  Avoid 4+ continuous special characters
  const continuousSpecialChars = /[^a-zA-Z0-9\s]{4,}/;

  if (continuousSpecialChars.test(trimmed)) {
    return (
      dictionary?.['navigation']?.invalidAddress ||
      'Too many special characters in a row'
    );
  }

   //  Must contain at least ONE number , Lettters and Special Characters

 const strongAddressPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[,./#-]).+$/;

if (!strongAddressPattern.test(trimmed)) {
  return (
    dictionary?.['navigation']?.invalidAddress ||
    'Address must include letters, numbers, and at least one special character'
  );
}


  //  Minimum length
  if (trimmed.length < 5) {
    return (
      dictionary?.['navigation']?.addressTooShort ||
      'Address is too short'
    );
  }

  return true;
};

export const validateTextWithNumber = (
  value: string | undefined,
  dictionary?: any
): true | string => {
  if (!value) {
    return dictionary?.navigation?.required || 'This field is required';
  }

  const formattedValue = value.trim();

  // Allow letters + numbers + space + hyphen
  const vehicleRegex = /^[A-Za-z0-9\s-]+$/;

  if (!vehicleRegex.test(formattedValue)) {
    return (
      dictionary?.navigation?.invalidVehicle ||
      'Only letters, numbers, spaces and hyphens are allowed'
    );
  }

  // Optional: must contain at least 1 letter and 1 number
  if (!/[A-Za-z]/.test(formattedValue) || !/[0-9]/.test(formattedValue)) {
    return (
      dictionary?.navigation?.invalidVehicle ||
      'Must contain both letters and numbers'
    );
  }

  return true;
};



