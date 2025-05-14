export function convertToIST(unixTimestamp) {
  const date = new Date(unixTimestamp);
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 3) * 3;
  date.setMinutes(roundedMinutes, 0, 0);
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  }).replace(/,/, ', ');
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}