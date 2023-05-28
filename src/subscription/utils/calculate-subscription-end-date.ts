import { PeriodType } from '@prisma/client';

export const calculateSubscriptionEndDate = (
  currentDate: Date,
  period: number,
  periodType: PeriodType,
): Date => {
  const endDateforDay = new Date(
    currentDate.setDate(currentDate.getDate() + period),
  );
  const endDateforMonth = new Date(
    currentDate.setMonth(currentDate.getMonth() + period),
  );
  const endDateforYear = new Date(
    currentDate.setFullYear(currentDate.getFullYear() + period),
  );

  switch (periodType) {
    case PeriodType.DAY:
      return endDateforDay;
    case PeriodType.MONTH:
      return endDateforMonth;
    case PeriodType.YEAR:
      return endDateforYear;
    default:
      return endDateforMonth;
  }
};
