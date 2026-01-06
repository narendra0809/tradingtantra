/**
 * Check if market is currently open (9:15 AM - 3:30 PM IST)
 * @returns {boolean} true if market is open, false otherwise
 */
export const isMarketOpen = () => {
  // Get current time in IST (India Standard Time)
  const now = new Date();
  
  // Convert to IST (UTC+5:30)
  const istOffset = 330 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  
  // Get current hours and minutes in IST
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  const day = istTime.getUTCDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's a weekday (Monday-Friday)
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Market hours: 9:15 AM to 3:30 PM IST
  const marketOpen = { hour: 9, minute: 15 };
  const marketClose = { hour: 15, minute: 30 };
  
  // Create comparable time values
  const currentTime = hours * 60 + minutes;
  const openTime = marketOpen.hour * 60 + marketOpen.minute;
  const closeTime = marketClose.hour * 60 + marketClose.minute;
  
  // Check if current time is within market hours
  return currentTime >= openTime && currentTime <= closeTime;
};

