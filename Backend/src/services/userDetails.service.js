import moment from "moment-timezone";

const months = [
  { name: "January", value: 0 },
  { name: "February", value: 0 },
  { name: "March", value: 0 },
  { name: "April", value: 0 },
  { name: "May", value: 0 },
  { name: "June", value: 0 },
  { name: "July", value: 0 },
  { name: "August", value: 0 },
  { name: "September", value: 0 },
  { name: "October", value: 0 },
  { name: "November", value: 0 },
  { name: "December", value: 0 },
];

export const getActiveUsersByMonth = (subsUsers) => {
  const monthCounts = months.map((month) => ({ ...month }));

  subsUsers.forEach((user) => {
    if (user.startDate) {
      const date = moment(user.startDate);
      const monthName = date.format("MMMM");

      const monthEntry = monthCounts.find((m) => m.name === monthName);
      if (monthEntry) {
        monthEntry.value++;
      }
    }
  });

  return monthCounts;
};
