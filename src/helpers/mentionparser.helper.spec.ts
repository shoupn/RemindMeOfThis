import { addDays, addHours, addMonths } from 'date-fns';
import { calculateFutureDate, parseMention } from './mentionparser.helper';
jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
// Jest unit tests
describe('RemindMeOfThis Bot', () => {
  test('Parse Mention - Days', () => {
    expect(parseMention('@RemindMeOfThis in 1 days')).toEqual({
      time: 1,
      unit: 'day',
    });
  });

  test('Parse Mention - Days', () => {
    expect(parseMention('@RemindMeOfThis in 5 day')).toEqual({
      time: 5,
      unit: 'days',
    });
  });

  test('Parse Mention - Days', () => {
    expect(parseMention('@RemindMeOfThis in 5 days')).toEqual({
      time: 5,
      unit: 'days',
    });
  });

  test('Parse Mention - Hours', () => {
    expect(parseMention('@RemindMeOfThis in 3 hours')).toEqual({
      time: 3,
      unit: 'hours',
    });
  });

  test('Parse Mention - Months', () => {
    expect(parseMention('@RemindMeOfThis in 2 months')).toEqual({
      time: 2,
      unit: 'months',
    });
  });

  test('Calculate Future Date - Days', () => {
    const threeDaysFromNow = addDays(new Date(), 3);
    expect(calculateFutureDate({ time: 3, unit: 'days' })).toEqual(
      threeDaysFromNow,
    );
  });

  test('Calculate Future Date - Hours', () => {
    const twoHoursFromNow = addHours(new Date(), 2);
    expect(calculateFutureDate({ time: 2, unit: 'hours' })).toEqual(
      twoHoursFromNow,
    );
  });

  test('Calculate Future Date - Months', () => {
    const expectedDate = addMonths(new Date(), 4);
    expect(calculateFutureDate({ time: 4, unit: 'months' })).toEqual(
      expectedDate,
    );
  });
});
