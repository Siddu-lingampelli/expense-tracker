/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - The currency code (e.g., 'USD', 'EUR')
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  // Handle null, undefined, or non-numeric values
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
  }

  // Format the number as currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Format a date string to a more readable format
 * @param {string|Date} date - The date to format
 * @param {string} [format='MMM d, yyyy'] - The format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'MMM d, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: format.includes('yyyy') ? 'numeric' : undefined,
      month: format.includes('MMM') ? 'short' : format.includes('MM') ? '2-digit' : undefined,
      day: format.includes('d') ? 'numeric' : undefined,
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a number with commas and optional decimal places
 * @param {number} number - The number to format
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined || isNaN(Number(number))) {
    return '0';
  }
  
  const fixed = Number(number).toFixed(decimals);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return parts.join('.');
};

/**
 * Truncate text to a specified length and add ellipsis if needed
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format a duration in milliseconds to a human-readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "2h 30m", "1d 5h", "30s")
 */
export const formatDuration = (ms) => {
  if (!ms && ms !== 0) return '';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Format a file size in bytes to a human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted file size (e.g., "1.5 MB", "2.3 GB")
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (!bytes && bytes !== 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Format a phone number to a standard format
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Check if the number is valid
  const match = cleaned.match(/^(\d{1,3})?(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    // US/Canada format: (123) 456-7890
    const intlCode = match[1] ? `+${match[1]} ` : '';
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
  }
  
  // Return the original if it doesn't match expected format
  return phone;
};

/**
 * Format a credit card number with spaces for better readability
 * @param {string} cardNumber - The credit card number
 * @returns {string} Formatted credit card number
 */
export const formatCreditCard = (cardNumber) => {
  if (!cardNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = ('' + cardNumber).replace(/\D/g, '');
  
  // Format based on card type (simplified)
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  
  // Default format for most cards: XXXX XXXX XXXX XXXX
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

/**
 * Format a percentage value
 * @param {number} value - The value to format as a percentage
 * @param {number} [decimals=1] - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0%';
  }
  
  const multiplier = Math.pow(10, decimals);
  const rounded = Math.round(value * multiplier) / multiplier;
  
  return `${rounded}%`;
};

/**
 * Format a social security number (SSN)
 * @param {string} ssn - The SSN to format
 * @returns {string} Formatted SSN (e.g., "XXX-XX-1234")
 */
export const formatSSN = (ssn) => {
  if (!ssn) return '';
  
  // Remove all non-digit characters
  const cleaned = ('' + ssn).replace(/\D/g, '');
  
  // If we don't have enough digits, return as is
  if (cleaned.length < 4) return cleaned;
  
  // Format as XXX-XX-1234 (last 4 digits visible)
  const lastFour = cleaned.slice(-4);
  const masked = 'XXX-XX-' + lastFour;
  
  return masked;
};

/**
 * Format a string to title case
 * @param {string} str - The string to format
 * @returns {string} String in title case
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
