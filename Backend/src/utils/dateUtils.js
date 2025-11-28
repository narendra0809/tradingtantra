import { getPreviousTradingDay } from "../controllers/liveMarketData.controller.js";

export function convertToIST(unixTimestamp) {
  const date = new Date(unixTimestamp);
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 3) * 3;
  date.setMinutes(roundedMinutes, 0, 0);
  return date
    .toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    })
    .replace(/,/, ", ");
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getPreviousDate = (today, daysBack = 1) => {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - daysBack);
  return yesterday;
};

export function formateDate(currDate) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return formatter.format(currDate).slice(1);
}

export function getPrevousFetchDate() {
  const str = "00:00:00.000+00:00";
  const date = getPreviousDate(new Date()).toISOString().split("T");
  date[1] = str;
  return date.join("T");
}

export function getCurrentFetchDate() {
  const str = "00:00:00.000+00:00";
  const date = new Date().toISOString().split("T");
  date[1] = str;
  return date.join("T");
}

export function getNextDate(dateString, daysForward = 1) {
  const date = dateString instanceof Date ? dateString : new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + daysForward);
  return nextDate;
}

export const formatDateString = async (date) => {
  let targetDate = new Date(date);

  const hours = targetDate.getHours();
  const minutes = targetDate.getMinutes();

  if (hours < 9 || (hours === 9 && minutes < 15)) {
    targetDate = await getPreviousTradingDay(targetDate);
  }

  const day = String(targetDate.getDate()).padStart(2, "0");
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const year = targetDate.getFullYear();

  return `${day}/${month}/${year}`;
};

export const getFormattedTime = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - 3);
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 3) * 3;
  date.setMinutes(roundedMinutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export function addMinutesToTimestamp(timeStr, minutesToAdd = 3) {
  // Parse the time string into a Date object using today as reference
  const now = new Date();

  const [time, modifier] = timeStr.split(" ");
  let [hours, mins, secs] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  } else if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  // Create a date object for today with the parsed time
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    mins,
    secs
  );

  // Add minutes
  date.setMinutes(date.getMinutes() + minutesToAdd);

  // Format back to 12-hour time with AM/PM
  let newHours = date.getHours();
  let newModifier = "AM";
  if (newHours >= 12) {
    newModifier = "PM";
    if (newHours > 12) newHours -= 12;
  } else if (newHours === 0) {
    newHours = 12;
  }

  const newMins = date.getMinutes().toString().padStart(2, "0");
  const newSecs = date.getSeconds().toString().padStart(2, "0");

  return `${newHours}:${newMins}:${newSecs} ${newModifier}`;
}

export const convertTo12HourFormat = (timeStr) => {
  if (!timeStr) return null;

  // Handle both HH:MM and HH:MM:SS formats
  let [hours, minutes, seconds = "00"] = timeStr.split(":").map(Number);

  // Validate input
  if (hours > 23 || minutes > 59 || seconds > 59) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  // Convert to 12-hour format
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12; // Convert 0/12/24 → 12

  return `${displayHours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")} ${period}`;
};
