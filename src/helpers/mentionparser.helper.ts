import { addMinutes, addHours, addDays, addMonths, addYears } from 'date-fns';

// Define a type for the time units
type TimeUnit =
  | 'minutes'
  | 'hours'
  | 'days'
  | 'months'
  | 'years'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'year';

const isPlural = (unit: string): boolean => {
  return unit.endsWith('s');
};

export const parseMention = (
  mention: string,
): { time: number; unit: TimeUnit } | null => {
  const regex =
    /(?:in\s)?(\d+)\s*(minute|hour|day|month|year|minutes|hours|days|months|years)/i;
  const match = mention.match(regex);

  if (!match) {
    return null;
  }

  const time = parseInt(match[1], 10);
  const rawUnit = match[2].toLowerCase();
  const unit =
    time === 1
      ? (rawUnit as TimeUnit)
      : isPlural(rawUnit)
      ? (rawUnit as TimeUnit)
      : (`${rawUnit}s` as TimeUnit);

  return { time, unit };
};

// Define a function to calculate the future date based on the parsed mention
export const calculateFutureDate = ({
  time,
  unit,
}: {
  time: number;
  unit: TimeUnit;
}): Date => {
  const currentDate = new Date();

  switch (unit) {
    case 'minute':
    case 'minutes':
      return addMinutes(currentDate, time);
    case 'hour':
    case 'hours':
      return addHours(currentDate, time);
    case 'day':
    case 'days':
      return addDays(currentDate, time);
    case 'month':
    case 'months':
      return addMonths(currentDate, time);
    case 'year':
    case 'years':
      return addYears(currentDate, time);
    default:
      throw new Error('Invalid time unit');
  }
};
