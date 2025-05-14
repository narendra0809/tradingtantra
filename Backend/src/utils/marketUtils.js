// src/utils/marketUtils.js
export function isMarketOpen() {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const day = ist.getDay();
  const currentTime = hours * 60 + minutes;
  const startTime = 9 * 60 + 15;  // 9:15 AM
  const endTime = 15 * 60 + 30;   // 3:30 PM
  return day >= 1 && day <= 5 && currentTime >= startTime && currentTime <= endTime;
}