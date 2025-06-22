// Vehicle number validation utilities
export const validateVehicleNumber = (vehicleNo: string): { isValid: boolean; error?: string } => {
  if (!vehicleNo || vehicleNo.trim() === '') {
    return { isValid: false, error: 'Vehicle number is required' };
  }

  // Remove spaces and convert to uppercase
  const cleanVehicleNo = vehicleNo.replace(/\s/g, '').toUpperCase();

  // Indian vehicle number format: XX##XX#### (e.g., MH12AB1234)
  // XX = State code (2 letters)
  // ## = District code (2 digits)
  // XX = Series (2 letters)
  // #### = Unique number (4 digits)
  const vehicleNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

  if (!vehicleNumberRegex.test(cleanVehicleNo)) {
    return { 
      isValid: false, 
      error: 'Invalid format. Use format: MH12AB1234 (State-District-Series-Number)' 
    };
  }

  return { isValid: true };
};

export const formatVehicleNumber = (vehicleNo: string): string => {
  // Remove spaces and convert to uppercase
  const cleanVehicleNo = vehicleNo.replace(/\s/g, '').toUpperCase();
  
  // Add spaces for better readability: MH12AB1234 -> MH 12 AB 1234
  if (cleanVehicleNo.length === 10) {
    return `${cleanVehicleNo.slice(0, 2)} ${cleanVehicleNo.slice(2, 4)} ${cleanVehicleNo.slice(4, 6)} ${cleanVehicleNo.slice(6, 10)}`;
  }
  
  return cleanVehicleNo;
};

export const normalizeVehicleNumber = (vehicleNo: string): string => {
  // Remove spaces and convert to uppercase for storage
  return vehicleNo.replace(/\s/g, '').toUpperCase();
};

// Mobile number validation
export const validateMobileNumber = (mobile: string): { isValid: boolean; error?: string } => {
  if (!mobile || mobile.trim() === '') {
    return { isValid: true }; // Optional field
  }

  // Remove spaces, dashes, and plus signs
  const cleanMobile = mobile.replace(/[\s\-\+]/g, '');

  // Indian mobile number format: 10 digits starting with 6-9
  const mobileRegex = /^[6-9][0-9]{9}$/;
  
  // Also allow with country code +91
  const mobileWithCountryCodeRegex = /^91[6-9][0-9]{9}$/;

  if (!mobileRegex.test(cleanMobile) && !mobileWithCountryCodeRegex.test(cleanMobile)) {
    return { 
      isValid: false, 
      error: 'Invalid mobile number. Use 10-digit format (6XXXXXXXXX) or with country code (+91XXXXXXXXXX)' 
    };
  }

  return { isValid: true };
};

export const formatMobileNumber = (mobile: string): string => {
  if (!mobile) return '';
  
  // Remove all non-digits
  const cleanMobile = mobile.replace(/\D/g, '');
  
  // Format based on length
  if (cleanMobile.length === 10) {
    return `+91 ${cleanMobile.slice(0, 5)} ${cleanMobile.slice(5)}`;
  } else if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
    return `+91 ${cleanMobile.slice(2, 7)} ${cleanMobile.slice(7)}`;
  }
  
  return mobile;
};

export const normalizeMobileNumber = (mobile: string): string => {
  if (!mobile) return '';
  
  // Remove all non-digits
  const cleanMobile = mobile.replace(/\D/g, '');
  
  // If it starts with 91 and is 12 digits, remove the country code
  if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
    return cleanMobile.slice(2);
  }
  
  return cleanMobile;
};

// Common Indian state codes for reference
export const INDIAN_STATE_CODES = [
  'AP', 'AR', 'AS', 'BR', 'CG', 'GA', 'GJ', 'HR', 'HP', 'JH', 'KA', 'KL', 
  'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD', 'PB', 'RJ', 'SK', 'TN', 'TS', 
  'TR', 'UP', 'UK', 'WB', 'AN', 'CH', 'DN', 'DD', 'DL', 'JK', 'LA', 'LD', 'PY'
];