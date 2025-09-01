// Validation utility functions for Tasker signup

// Mobile number validation for Sri Lanka
export const validateMobileNumber = (phone) => {
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Sri Lanka mobile number patterns - full international format
  const patterns = [
    /^\+947[0-9]{8}$/,  // +947xxxxxxxx (most common)
    /^\+941[0-9]{8}$/,  // +941xxxxxxxx
    /^\+942[0-9]{8}$/,  // +942xxxxxxxx
    /^\+943[0-9]{8}$/,  // +943xxxxxxxx
    /^\+944[0-9]{8}$/,  // +944xxxxxxxx
    /^\+945[0-9]{8}$/,  // +945xxxxxxxx
    /^\+946[0-9]{8}$/,  // +946xxxxxxxx
    /^\+948[0-9]{8}$/,  // +948xxxxxxxx
    /^\+949[0-9]{8}$/,  // +949xxxxxxxx
  ];
  
  // Check if the clean number matches any pattern
  const isValid = patterns.some(pattern => pattern.test(cleanPhone));
  
  return {
    isValid,
    cleanNumber: cleanPhone.replace('+94', ''),
    formattedNumber: cleanPhone
  };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

// Calculate password strength
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  if (score <= 4) return 'strong';
  return 'very-strong';
};

// Name validation
export const validateName = (name) => {
  const trimmedName = name.trim();
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  
  return {
    isValid: nameRegex.test(trimmedName),
    cleanName: trimmedName
  };
};

import { PROVINCES } from '../config/locations';

// Province validation for Sri Lanka
export const validateProvince = (province) => {
  return {
    isValid: PROVINCES.includes(province),
    cleanProvince: province
  };
};

// Skills validation
export const validateSkills = (skills) => {
  if (!Array.isArray(skills) || skills.length === 0) {
    return {
      isValid: false,
      error: 'At least one skill is required'
    };
  }
  
  if (skills.length > 10) {
    return {
      isValid: false,
      error: 'Maximum 10 skills allowed'
    };
  }
  
  const validSkills = skills.filter(skill => 
    skill.trim().length >= 2 && skill.trim().length <= 50
  );
  
  return {
    isValid: validSkills.length === skills.length && validSkills.length > 0,
    cleanSkills: validSkills,
    error: validSkills.length !== skills.length ? 'Some skills are invalid' : null
  };
};



// File validation
export const validateFile = (file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/*', 'application/pdf']) => {
  if (!file) {
    return {
      isValid: false,
      error: 'File is required'
    };
  }
  
  // Check file size (5MB default)
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    };
  }
  
  // Check file type
  const isValidType = allowedTypes.some(type => {
    if (type === 'image/*') {
      return file.type.startsWith('image/');
    }
    if (type === 'application/pdf') {
      return file.type === 'application/pdf';
    }
    return file.type === type;
  });
  
  if (!isValidType) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload images or PDF files'
    };
  }
  
  return {
    isValid: true,
    file
  };
};

// Step 1 validation (Tasker)
export const validateStep1 = (data) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateName(data.fullName);
  if (!nameValidation.isValid) {
    errors.fullName = 'Please enter a valid name (2-50 characters, letters only)';
  }
  
  // Validate email
  if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Validate phone
  const phoneValidation = validateMobileNumber(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = 'Please enter a valid Sri Lankan mobile number (e.g., +94715669231)';
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }
  
  // Validate confirm password
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Validate terms agreement
  if (!data.agreedToTerms) {
    errors.agreedToTerms = 'You must agree to the Terms and Privacy Policy';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanData: {
      fullName: nameValidation.cleanName,
      email: data.email.toLowerCase().trim(),
      phone: phoneValidation.formattedNumber,
      password: data.password
    }
  };
};

// Customer signup validation
export const validateCustomerSignup = (data) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateName(data.fullName);
  if (!nameValidation.isValid) {
    errors.fullName = 'Please enter a valid name (2-50 characters, letters only)';
  }
  
  // Validate email
  if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Validate phone
  const phoneValidation = validateMobileNumber(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = 'Please enter a valid Sri Lankan mobile number (e.g., +94715669231)';
  }
  
  // Validate province
  const provinceValidation = validateProvince(data.province);
  if (!provinceValidation.isValid) {
    errors.province = 'Please select a valid province';
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }
  
  // Validate confirm password
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanData: {
      fullName: nameValidation.cleanName,
      email: data.email.toLowerCase().trim(),
      phone: phoneValidation.formattedNumber,
      province: provinceValidation.cleanProvince,
      password: data.password
    }
  };
};

// Step 2 validation (Tasker)
export const validateStep2 = (data) => {
  const errors = {};
  
  // Validate skills
  const skillsValidation = validateSkills(data.skills);
  if (!skillsValidation.isValid) {
    errors.skills = skillsValidation.error;
  }
  
  // Validate province
  const provinceValidation = validateProvince(data.province);
  if (!provinceValidation.isValid) {
    errors.province = 'Please select a valid province';
  }
  
  // Validate district
  if (!data.district || data.district.trim() === '') {
    errors.district = 'Please select a district';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanData: {
      skills: skillsValidation.cleanSkills,
      province: provinceValidation.cleanProvince,
      district: data.district
    }
  };
};

// Step 3 validation (Tasker)
export const validateStep3 = (data) => {
  const errors = {};
  
  // Validate ID document
  const idValidation = validateFile(data.idDocument);
  if (!idValidation.isValid) {
    errors.idDocument = idValidation.error;
  }
  
  // Validate qualification documents (optional but if provided, must be valid)
  if (data.qualificationDocuments && data.qualificationDocuments.length > 0) {
    const qualErrors = [];
    Array.from(data.qualificationDocuments).forEach((file, index) => {
      const fileValidation = validateFile(file);
      if (!fileValidation.isValid) {
        qualErrors.push(`File ${index + 1}: ${fileValidation.error}`);
      }
    });
    
    if (qualErrors.length > 0) {
      errors.qualificationDocuments = qualErrors.join(', ');
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanData: {
      idDocument: idValidation.file,
      qualificationDocuments: data.qualificationDocuments
    }
  };
};

// Real-time validation helpers
export const getFieldError = (fieldName, value, validationType) => {
  switch (validationType) {
    case 'name':
      const nameValidation = validateName(value);
      return nameValidation.isValid ? null : 'Please enter a valid name (2-50 characters, letters only)';
    
    case 'email':
      return validateEmail(value) ? null : 'Please enter a valid email address';
    
    case 'phone':
      const phoneValidation = validateMobileNumber(value);
      return phoneValidation.isValid ? null : 'Please enter a valid Sri Lankan mobile number (e.g., +94715669231)';
    
    case 'password':
      const passwordValidation = validatePassword(value);
      return passwordValidation.isValid ? null : passwordValidation.errors[0];
    
    case 'province':
      const provinceValidation = validateProvince(value);
      return provinceValidation.isValid ? null : 'Please select a valid province';
    
    case 'district':
      if (!value || value.trim() === '') {
        return 'Please select a district';
      }
      return null;
    
    default:
      return null;
  }
};

// Format phone number as user types
export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters except +
  const cleanValue = value.replace(/[^\d+]/g, '');
  
  // If it already starts with +94, return as is
  if (cleanValue.startsWith('+94')) {
    return cleanValue;
  }
  
  // If it starts with 94, add the +
  if (cleanValue.startsWith('94')) {
    return `+${cleanValue}`;
  }
  
  // If it's a 9-digit number starting with 7, add +94
  if (cleanValue.length === 9 && cleanValue.startsWith('7')) {
    return `+94${cleanValue}`;
  }
  
  // If it's a 9-digit number starting with other digits, add +94
  if (cleanValue.length === 9 && /^[1-9]/.test(cleanValue)) {
    return `+94${cleanValue}`;
  }
  
  // For partial input, just return the cleaned value
  return cleanValue;
}; 