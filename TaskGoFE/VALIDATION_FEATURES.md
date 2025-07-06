# Tasker & Customer Signup Validation Features

## Overview
This document describes the comprehensive validation system implemented for both Tasker and Customer signup processes. The validation occurs at each step when the user clicks the "Next" button (for Tasker) or "Create Account" button (for Customer), providing immediate feedback and preventing invalid data from proceeding.

## Validation Features

### Customer Signup Validation

#### Mobile Number Validation
- **Real-time formatting**: Phone numbers are automatically formatted as the user types (e.g., +94715669231)
- **Sri Lankan number validation**: Validates against common Sri Lankan mobile number patterns:
  - +947xxxxxxxx (most common)
  - +941xxxxxxxx, +942xxxxxxxx, +943xxxxxxxx, +944xxxxxxxx
  - +945xxxxxxxx, +946xxxxxxxx, +948xxxxxxxx, +949xxxxxxxx
- **Visual feedback**: Shows green checkmark for valid numbers, red error for invalid ones
- **Clean data**: Automatically formats numbers to international format (+94xxxxxxxxx)

#### Email Validation
- **Format validation**: Ensures proper email format (user@domain.com)
- **Real-time feedback**: Shows validation status as user types
- **Case normalization**: Automatically converts to lowercase

#### Password Validation
- **Strength requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Strength indicator**: Visual progress bar showing password strength (weak, medium, strong, very-strong)
- **Show/hide toggle**: Eye icon to toggle password visibility
- **Confirm password matching**: Real-time validation of password confirmation

#### Name Validation
- **Format validation**: 2-50 characters, letters and spaces only
- **Real-time feedback**: Shows validation status as user types

#### Province Validation
- **Required selection**: Must select a province from dropdown
- **Sri Lankan provinces**: Validates against all 9 provinces of Sri Lanka
- **Real-time feedback**: Shows validation status when selected

### Tasker Signup Validation

#### Step 1: Account Details Validation
- **Mobile Number Validation**: Same as Customer signup
- **Email Validation**: Same as Customer signup
- **Password Validation**: Same as Customer signup
- **Name Validation**: Same as Customer signup
- **Terms Agreement**: Required checkbox validation

#### Step 2: Skills & Location Validation

##### Skills Validation
- **Minimum requirement**: At least one skill required
- **Maximum limit**: Maximum 10 skills allowed
- **Skill length validation**: Each skill must be 2-50 characters
- **Real-time feedback**: Shows count and validation status
- **Duplicate prevention**: Prevents adding the same skill twice
- **Custom skills**: Allows users to add custom skills not in the predefined list

##### Country Validation
- **Required selection**: Must select a country from dropdown
- **Default value**: Pre-filled with "Sri Lanka"

##### Area Validation
- **Length validation**: 2-100 characters required
- **Real-time feedback**: Shows validation status as user types
- **Clean data**: Trims whitespace automatically

#### Step 3: Document Upload Validation

##### ID Document Validation
- **Required field**: ID document is mandatory
- **File type validation**: Accepts PDF and image files only
- **File size validation**: Maximum 5MB per file
- **Drag & drop support**: Users can drag files directly onto the upload area
- **Visual feedback**: Shows file icon, name, and size
- **Remove functionality**: Users can remove and re-upload files

##### Qualification Documents Validation (Optional)
- **Multiple file support**: Can upload multiple qualification documents
- **File type validation**: Accepts PDF and image files only
- **File size validation**: Maximum 5MB per file
- **Individual file validation**: Each file is validated separately
- **Error reporting**: Shows specific errors for each invalid file

## User Experience Features

### Real-time Validation
- **Field-level validation**: Each field validates as user types or on blur
- **Immediate feedback**: Error messages appear instantly
- **Success indicators**: Green checkmarks for valid fields
- **Error clearing**: Errors clear automatically when user starts correcting

### Visual Feedback
- **Border colors**: Red borders for invalid fields, green for valid ones
- **Error messages**: Clear, specific error messages for each field
- **Success messages**: Positive feedback for valid inputs
- **Loading states**: Shows "Validating..." during form submission

### Accessibility
- **Screen reader support**: Proper ARIA labels and error associations
- **Keyboard navigation**: Full keyboard accessibility
- **Focus management**: Proper focus handling during validation
- **Error announcements**: Screen readers announce validation errors

### Progressive Enhancement
- **Graceful degradation**: Works without JavaScript (basic HTML5 validation)
- **Enhanced experience**: Full validation with JavaScript enabled
- **Mobile friendly**: Responsive design with touch-friendly interactions

## Technical Implementation

### Validation Utility (`src/utils/validation.js`)
- **Modular functions**: Separate validation functions for each field type
- **Reusable code**: Can be used across different components
- **Comprehensive coverage**: Handles all validation scenarios
- **Easy maintenance**: Centralized validation logic

### Component Integration
- **Customer signup**: Single-page validation with comprehensive field checking
- **Tasker signup**: Step-by-step validation with data persistence
- **Error state management**: Proper error state handling
- **Form state management**: Clean form state with validation
- **Data cleaning**: Automatically cleans and formats data

### Error Handling
- **User-friendly messages**: Clear, actionable error messages
- **Field-specific errors**: Each field shows its own error
- **Form-level errors**: Overall form validation errors
- **Submission errors**: API error handling and display

## Validation Functions

### Customer Signup Functions
- `validateCustomerSignup(data)` - Complete customer form validation
- `validateProvince(province)` - Province selection validation
- `getFieldError(fieldName, value, 'province')` - Real-time province validation

### Tasker Signup Functions
- `validateStep1(data)` - Step 1 validation (account details)
- `validateStep2(data)` - Step 2 validation (skills & location)
- `validateStep3(data)` - Step 3 validation (document upload)

### Shared Functions
- `validateMobileNumber(phone)` - Sri Lankan mobile number validation (e.g., +94715669231)
- `validateEmail(email)` - Email format validation
- `validatePassword(password)` - Password strength validation
- `validateName(name)` - Name format validation
- `formatPhoneNumber(value)` - Phone number formatting
- `getFieldError(fieldName, value, validationType)` - Real-time field validation

## Benefits

1. **Improved User Experience**: Users get immediate feedback and don't waste time on invalid data
2. **Data Quality**: Ensures only valid data reaches the backend
3. **Reduced Server Load**: Prevents unnecessary API calls with invalid data
4. **Better Conversion**: Users are more likely to complete signup with clear guidance
5. **Accessibility**: Inclusive design for all users
6. **Maintainability**: Centralized validation logic is easy to update
7. **Consistency**: Same validation rules across both signup flows
8. **Localization**: Sri Lankan-specific validation (phone numbers, provinces)

## Future Enhancements

- **Phone number verification**: SMS verification for mobile numbers
- **Email verification**: Email confirmation during signup
- **Document verification**: Backend verification of uploaded documents
- **Advanced password requirements**: Integration with password breach databases
- **Geolocation validation**: Automatic province detection based on user location
- **Address validation**: Integration with postal service APIs
- **Social login validation**: Validation for social media login flows 