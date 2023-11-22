import {
  addMinutes,
  addHours,
  addDays,
  addMonths,
  addYears,
  addWeeks,
} from 'date-fns';

export const wordToNumber: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  twentyone: 21,
  twentytwo: 22,
  twentythree: 23,
  twentyfour: 24,
  twentyfive: 25,
  twentysix: 26,
  twentyseven: 27,
  twentyeight: 28,
  twentynine: 29,
  thirty: 30,
  thirtyone: 31,
  thirtytwo: 32,
  thirtythree: 33,
  // go up to 100
  thirtyfour: 34,

  thirtyfive: 35,
  thirtysix: 36,
  thirtyseven: 37,
};

// Define a type for the time units
type TimeUnit =
  | 'weeks'
  | 'week'
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

export const parseMention = (
  mention: string,
): { time: number; unit: TimeUnit } | null => {
  const regex =
    /(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty(?:one|two|three|four|five|six|seven|eight|nine)?|thirty)\s*(minute|hour|day|month|year|minutes|hours|days|months|years|week|weeks)/i;

  // const regex =
  //   /(\d+)\s*(minute|hour|day|month|year|minutes|hours|days|months|years|week|weeks)/i;
  const match = mention.match(regex);

  if (!match) {
    return null;
  }

  const numericTime = parseInt(match[1], 10);
  const wordTime = wordToNumber[match[1].toLowerCase()];

  const time = !isNaN(numericTime) ? numericTime : wordTime || 1;
  const rawUnit = match[2].toLowerCase();
  const unit =
    time === 1
      ? (rawUnit as TimeUnit)
      : rawUnit.endsWith('s')
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
    case 'week':
    case 'weeks':
      return addWeeks(currentDate, time);
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
