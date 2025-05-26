// src/utils/generateTimestamps.js
export const generateTimestamps = (dateStr = "2025-05-15") => {
  const timestamps = [];
  const startTime = new Date(`${dateStr} 09:15:00 GMT+0530`);
  const endTime = new Date(`${dateStr} 15:30:00 GMT+0530`);

  for (let time = startTime; time <= endTime; time.setMinutes(time.getMinutes() + 3)) {
    const month = (time.getMonth() + 1).toString().padStart(2, "0");
    const day = time.getDate().toString().padStart(2, "0");
    const year = time.getFullYear();
    const hours = time.getHours() % 12 || 12;
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const seconds = "00";
    const ampm = time.getHours() >= 12 ? "PM" : "AM";
    const timestamp = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
    timestamps.push(timestamp);
  }

  return timestamps;
};