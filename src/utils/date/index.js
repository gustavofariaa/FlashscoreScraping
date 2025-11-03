/**
 * Convert FlashScore date format to ISO 8601
 * @param {string} flashscoreDate - Date in format "DD.MM.YYYY HH:MM"
 * @returns {string|null} ISO 8601 date string or null if invalid
 */
export const convertToISO8601 = (flashscoreDate) => {
  if (!flashscoreDate || typeof flashscoreDate !== 'string') {
    return null;
  }
  
  try {
    // Input: "27.10.2025 12:00"
    // Output: "2025-10-27T12:00:00Z"
    
    const parts = flashscoreDate.trim().split(' ');
    const datePart = parts[0]; // "27.10.2025"
    const timePart = parts[1] || '00:00'; // "12:00" or default to midnight
    
    const [day, month, year] = datePart.split('.');
    const [hour, minute] = timePart.split(':');
    
    // Validate extracted parts
    if (!day || !month || !year || !hour || !minute) {
      throw new Error('Invalid date format');
    }
    
    // Pad with zeros if needed
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    const paddedHour = hour.padStart(2, '0');
    const paddedMinute = minute.padStart(2, '0');
    
    // Create ISO 8601 string (assuming UTC timezone)
    const isoDate = `${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${paddedMinute}:00Z`;
    
    // Validate the date is actually valid
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date value');
    }
    
    return isoDate;
  } catch (err) {
    console.warn(`⚠️  Failed to convert date "${flashscoreDate}" to ISO 8601: ${err.message}`);
    return null; // Return null instead of original to enforce ISO format
  }
};

/**
 * Batch convert multiple dates
 * @param {Array} items - Array of objects with date property
 * @param {string} dateKey - Key name for date property (default: 'date')
 * @returns {Array} Items with converted dates
 */
export const convertDatesInArray = (items, dateKey = 'date') => {
  return items.map(item => {
    if (item[dateKey]) {
      const converted = convertToISO8601(item[dateKey]);
      return {
        ...item,
        [dateKey]: converted || item[dateKey] // Keep original if conversion fails
      };
    }
    return item;
  });
};