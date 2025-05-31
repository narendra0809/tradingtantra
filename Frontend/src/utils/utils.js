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
