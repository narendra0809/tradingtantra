export const convertTo12HourFormat = (time24) => {
  // Split the time string into hours and minutes
  const [hours, minutes] = time24.split(":").map(Number);
  //10:00:00 AM
  // Determine AM/PM
  const period = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM

  // Return formatted string
  return `${hours12}:${minutes.toString().padStart(2, "0")}:00 ${period}`;
};

export const parseTime = (str) => {
  const [time, period] = str.split(" ");
  let [hours, minutes, seconds] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 3600 + minutes * 60 + seconds;
};

export const getPreviousDate = (today) => {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return yesterday;
};

export const formatDateString = (date = new Date()) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const marketHours = () => {
  // Get current time in IST (India Standard Time)
  const now = new Date();

  // Convert to IST (UTC+5:30)
  const istOffset = 330 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istTime = new Date(now.getTime() + istOffset);

  // Get current hours and minutes in IST
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();

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

export const getLatestTradingDay = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const isPreMarket =
    (hours === 0 && minutes >= 0) ||
    (hours > 0 && hours < 9) ||
    (hours === 9 && minutes < 15);

  let currentDateObj = new Date(now);

  if (isPreMarket) {
    currentDateObj.setDate(currentDateObj.getDate() - 1);
  }

  const adjustedDay = currentDateObj.getDay();

  if (adjustedDay === 0) {
    currentDateObj.setDate(currentDateObj.getDate() - 2);
  } else if (adjustedDay === 6) {
    currentDateObj.setDate(currentDateObj.getDate() - 1);
  }
  return currentDateObj;
};

export function generateTimeRanges(startTime, endTime, intervalMinutes) {
  const ranges = [];

  // Parse start time
  let [startHour, startMinute] = startTime.split(":").map(Number);

  // Parse end time
  let [endHour, endMinute] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute <= endMinute)
  ) {
    // Format current time
    const start = `${currentHour}:${currentMinute.toString().padStart(2, "0")}`;

    // Add interval
    currentMinute += intervalMinutes;

    // Handle hour overflow
    while (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour += 1;
    }

    // Format end time
    const end = `${currentHour}:${currentMinute.toString().padStart(2, "0")}`;

    // Only add if we haven't passed the end time
    if (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      ranges.push(`${start}-${end}`);
    }
  }

  return ranges;
}
