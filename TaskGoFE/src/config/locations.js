// ============================================================================
// SRI LANKA LOCATIONS CONFIGURATION
// ============================================================================

// Sri Lankan provinces
export const PROVINCES = [
  'Western Province',
  'Central Province', 
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province'
];

// Sri Lankan districts mapped to provinces
export const DISTRICTS = {
  'Western Province': [
    'Colombo',
    'Gampaha',
    'Kalutara'
  ],
  'Central Province': [
    'Kandy',
    'Matale',
    'Nuwara Eliya'
  ],
  'Southern Province': [
    'Galle',
    'Matara',
    'Hambantota'
  ],
  'Northern Province': [
    'Jaffna',
    'Kilinochchi',
    'Mannar',
    'Vavuniya',
    'Mullaitivu'
  ],
  'Eastern Province': [
    'Batticaloa',
    'Ampara',
    'Trincomalee'
  ],
  'North Western Province': [
    'Kurunegala',
    'Puttalam'
  ],
  'North Central Province': [
    'Anuradhapura',
    'Polonnaruwa'
  ],
  'Uva Province': [
    'Badulla',
    'Moneragala'
  ],
  'Sabaragamuwa Province': [
    'Ratnapura',
    'Kegalle'
  ]
};

// Get all districts as a flat array (sorted alphabetically for backward compatibility)
export const ALL_DISTRICTS = Object.values(DISTRICTS).flat().sort();

// Get districts for a specific province (sorted alphabetically)
export const getDistrictsForProvince = (province) => {
  const districts = DISTRICTS[province] || [];
  return districts.sort();
};

// Check if a district belongs to a province
export const isDistrictInProvince = (district, province) => {
  return DISTRICTS[province]?.includes(district) || false;
};

// Get province for a specific district
export const getProvinceForDistrict = (district) => {
  for (const [province, districts] of Object.entries(DISTRICTS)) {
    if (districts.includes(district)) {
      return province;
    }
  }
  return null;
};

// Validate location data
export const validateLocation = (province, district) => {
  if (!province || !PROVINCES.includes(province)) {
    return { isValid: false, error: 'Invalid province' };
  }
  
  if (!district || !DISTRICTS[province]?.includes(district)) {
    return { isValid: false, error: 'Invalid district for selected province' };
  }
  
  return { isValid: true };
};

// Format location for display
export const formatLocation = (province, district) => {
  if (!province && !district) return '';
  if (!district) return province;
  if (!province) return district;
  return `${district}, ${province}`;
}; 