export const calculateSubscriptionEndDate = (
  currentDate: Date,
  months: number,
): Date => {
  return new Date(currentDate.setMonth(currentDate.getMonth() + months));
};
