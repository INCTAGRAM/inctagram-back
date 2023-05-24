export const getUnixTimestamp = (date: Date) =>
  Math.floor(date.getTime() / 1000);
