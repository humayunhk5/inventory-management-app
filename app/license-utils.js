// License generation and validation utilities

// Generate a unique license key from phone number and timestamp
export function generateLicenseKey(phoneNumber) {
  // Remove non-digits from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Create a hash-like key from phone + timestamp
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const phonePart = cleanPhone.slice(-4); // Last 4 digits of phone
  const datePart = new Date().getFullYear().toString().slice(-2); // Last 2 digits of year
  
  // Format: BIZ-XXXX-XXXX-YYYY
  const license = `BIZ-${phonePart}-${randomPart}-${datePart}`;
  return license;
}

// Calculate license expiry date (1 year from today)
export function getLicenseExpiryDate() {
  const today = new Date();
  const expiryDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  return expiryDate;
}

// Validate if license is still active
export function validateLicense(licenseData) {
  if (!licenseData || !licenseData.expiryDate) return false;
  
  const today = new Date();
  const expiry = new Date(licenseData.expiryDate);
  return today <= expiry;
}

// Calculate days remaining on license
export function getDaysRemaining(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Create a new license when payment is received
export function createLicense(userData) {
  return {
    licenseKey: generateLicenseKey(userData.phoneNumber),
    phoneNumber: userData.phoneNumber,
    businessName: userData.businessName,
    email: userData.email,
    createdDate: new Date().toISOString(),
    expiryDate: getLicenseExpiryDate().toISOString(),
    planType: 'yearly',
    planPrice: 9,
    status: 'active',
    paymentId: userData.paymentId || null,
  };
}
