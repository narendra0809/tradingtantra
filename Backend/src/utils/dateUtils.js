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

export const formatDateString = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const getFormattedTime = () => {
  const date = new Date();

  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 3) * 3;

  const roundedDate = new Date(date);
  roundedDate.setMinutes(roundedMinutes, 0, 0);

  return roundedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};
