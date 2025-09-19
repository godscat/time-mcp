import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';

// 导入 dayjs 插件
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';

// 配置插件
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// 直接导入源文件中的函数
import {
  getCurrentTime,
  getRelativeTime,
  getTimestamp,
  getDaysInMonth,
  getWeekOfYear,
  getWeekDates,
  getWorkdays,
  convertTime,
  getIsoWeeksInMonth
} from '../src/index.js';

describe('Time MCP Server - Unit Tests', () => {
  describe('getWeekDates', () => {
    it('should return correct date range for week 12 of 2025', () => {
      const result = getWeekDates(2025, 12);
      expect(result.startDate).toBe('2025-03-17');
      expect(result.endDate).toBe('2025-03-23');
    });

    it('should handle week 1 of 2024 correctly', () => {
      const result = getWeekDates(2024, 1);
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-01-07');
    });

    it('should handle week 53 of 2023 (edge case)', () => {
      const result = getWeekDates(2023, 53);
      expect(result.startDate).toBe('2023-12-25');
      expect(result.endDate).toBe('2023-12-31');
    });

    it('should handle cross-year weeks (2025 week 1)', () => {
      const result = getWeekDates(2025, 1);
      expect(result.startDate).toBe('2024-12-30');
      expect(result.endDate).toBe('2025-01-05');
    });

    it('should return exactly 7 days range', () => {
      const result = getWeekDates(2025, 12);
      const start = dayjs(result.startDate);
      const end = dayjs(result.endDate);
      expect(end.diff(start, 'days')).toBe(6);
    });

    it('should always start on Monday', () => {
      const result = getWeekDates(2025, 12);
      const start = dayjs(result.startDate);
      expect(start.day()).toBe(1); // Monday
    });

    it('should handle invalid week numbers gracefully', () => {
      // The current implementation doesn't throw, but should handle gracefully
      const result1 = getWeekDates(2025, 0);
      const result2 = getWeekDates(2025, 54);
      
      // Should still return valid date objects
      expect(result1).toHaveProperty('startDate');
      expect(result1).toHaveProperty('endDate');
      expect(result2).toHaveProperty('startDate');
      expect(result2).toHaveProperty('endDate');
    });
  });

  describe('getWorkdays', () => {
    it('should return exactly 5 workdays', () => {
      const result = getWorkdays(2025, 12);
      expect(result).toHaveLength(5);
    });

    it('should return Monday to Friday for week 12 of 2025', () => {
      const result = getWorkdays(2025, 12);
      expect(result).toEqual([
        '2025-03-17', // Monday
        '2025-03-18', // Tuesday
        '2025-03-19', // Wednesday
        '2025-03-20', // Thursday
        '2025-03-21', // Friday
      ]);
    });

    it('should handle different date formats', () => {
      const result = getWorkdays(2025, 12, 'MM/DD/YYYY');
      expect(result).toEqual([
        '03/17/2025',
        '03/18/2025',
        '03/19/2025',
        '03/20/2025',
        '03/21/2025',
      ]);
    });

    it('should handle Chinese date format', () => {
      const result = getWorkdays(2025, 12, 'YYYY年MM月DD日');
      expect(result).toEqual([
        '2025年03月17日',
        '2025年03月18日',
        '2025年03月19日',
        '2025年03月20日',
        '2025年03月21日',
      ]);
    });

    it('should handle edge case - week 1 of 2024', () => {
      const result = getWorkdays(2024, 1);
      expect(result).toHaveLength(5);
      expect(result[0]).toBe('2024-01-01'); // Monday
    });

    it('should handle cross-year week properly', () => {
      const result = getWorkdays(2025, 1);
      expect(result).toHaveLength(5);
      expect(result[0]).toBe('2024-12-30'); // Monday of week 1, 2025
    });
  });

  describe('getCurrentTime', () => {
    it('should return current UTC and local time', () => {
      const format = 'YYYY-MM-DD HH:mm:ss';
      const result = getCurrentTime(format);
      
      expect(result).toHaveProperty('utc');
      expect(result).toHaveProperty('local');
      expect(result).toHaveProperty('timezone');
      
      // Should be valid date strings in the specified format
      expect(dayjs(result.utc, format, true).isValid()).toBe(true);
      expect(dayjs(result.local, format, true).isValid()).toBe(true);
    });

    it('should use specified timezone when provided', () => {
      const format = 'YYYY-MM-DD HH:mm:ss';
      const timezone = 'Asia/Shanghai';
      const result = getCurrentTime(format, timezone);
      
      expect(result.timezone).toBe(timezone);
    });

    it('should use default timezone when not provided', () => {
      const format = 'YYYY-MM-DD HH:mm:ss';
      const result = getCurrentTime(format);
      
      expect(result.timezone).toBeDefined();
      expect(typeof result.timezone).toBe('string');
    });

    it('should handle different time formats', () => {
      const formats = ['YYYY-MM-DD', 'MM/DD/YYYY'];
      
      formats.forEach(format => {
        const result = getCurrentTime(format);
        expect(dayjs(result.utc, format, true).isValid()).toBe(true);
        expect(dayjs(result.local, format, true).isValid()).toBe(true);
      });
    });
  });

  describe('getRelativeTime', () => {
    it('should return relative time from now', () => {
      const pastTime = dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
      const result = getRelativeTime(pastTime);
      
      expect(typeof result).toBe('string');
      expect(result).toContain('ago');
    });

    it('should handle future time', () => {
      const futureTime = dayjs().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
      const result = getRelativeTime(futureTime);
      
      expect(typeof result).toBe('string');
      expect(result).toContain('in');
    });

    it('should handle different time units', () => {
      const testCases = [
        { time: dayjs().subtract(1, 'minute'), expected: 'minute' },
        { time: dayjs().subtract(1, 'day'), expected: 'day' },
        { time: dayjs().subtract(1, 'month'), expected: 'month' },
        { time: dayjs().subtract(1, 'year'), expected: 'year' },
      ];
      
      testCases.forEach(({ time, expected }) => {
        const result = getRelativeTime(time.format('YYYY-MM-DD HH:mm:ss'));
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain(expected);
      });
    });
  });

  describe('getTimestamp', () => {
    it('should return timestamp for specific time', () => {
      const time = '2025-03-23 12:30:00';
      const result = getTimestamp(time);
      
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
      
      // Should match expected timestamp
      const expected = dayjs.utc(time).valueOf();
      expect(result).toBe(expected);
    });

    it('should return current timestamp when no time provided', () => {
      const result = getTimestamp();
      
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
      
      // Should be close to current time (within 1 second)
      const now = dayjs().valueOf();
      expect(Math.abs(result - now)).toBeLessThan(1000);
    });

    it('should handle time with milliseconds', () => {
      const time = '2025-03-23 12:30:00.500';
      const result = getTimestamp(time);
      
      expect(typeof result).toBe('number');
      expect(result % 1000).toBe(500); // Should preserve milliseconds
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct days for specified month', () => {
      const result = getDaysInMonth('2025-03-23');
      expect(result).toBe(31); // March has 31 days
    });

    it('should handle February in leap year', () => {
      const result = getDaysInMonth('2024-02-15');
      expect(result).toBe(29); // 2024 is a leap year
    });

    it('should handle February in non-leap year', () => {
      const result = getDaysInMonth('2025-02-15');
      expect(result).toBe(28); // 2025 is not a leap year
    });

    it('should handle different month formats', () => {
      const result = getDaysInMonth('2025-04-01');
      expect(result).toBe(30); // April has 30 days
    });

    it('should return current month days when no date provided', () => {
      const result = getDaysInMonth();
      const currentMonth = dayjs().daysInMonth();
      expect(result).toBe(currentMonth);
    });
  });

  describe('getWeekOfYear', () => {
    it('should return correct week numbers for specific date', () => {
      const result = getWeekOfYear('2025-03-23');
      
      expect(result).toHaveProperty('week');
      expect(result).toHaveProperty('isoWeek');
      expect(typeof result.week).toBe('number');
      expect(typeof result.isoWeek).toBe('number');
    });

    it('should handle different dates correctly', () => {
      const testCases = [
        { date: '2025-01-01', expectedWeek: 1, expectedIsoWeek: 1 },
        { date: '2025-07-01', expectedWeek: 27, expectedIsoWeek: 27 },
      ];
      
      testCases.forEach(({ date, expectedWeek, expectedIsoWeek }) => {
        const result = getWeekOfYear(date);
        expect(result.week).toBe(expectedWeek);
        expect(result.isoWeek).toBe(expectedIsoWeek);
      });
    });

    it('should return current week info when no date provided', () => {
      const result = getWeekOfYear();
      const current = dayjs();
      
      expect(result.week).toBe(current.week());
      expect(result.isoWeek).toBe(current.isoWeek());
    });
  });

  describe('convertTime', () => {
    it('should convert time between timezones', () => {
      const sourceTimezone = 'America/New_York';
      const targetTimezone = 'Asia/Shanghai';
      const time = '2025-03-23 12:30:00';
      
      const result = convertTime(sourceTimezone, targetTimezone, time);
      
      expect(result).toHaveProperty('sourceTime');
      expect(result).toHaveProperty('targetTime');
      expect(result).toHaveProperty('timeDiff');
      
      expect(typeof result.sourceTime).toBe('string');
      expect(typeof result.targetTime).toBe('string');
      expect(typeof result.timeDiff).toBe('number');
    });

    it('should handle timezone conversion correctly', () => {
      const sourceTimezone = 'UTC';
      const targetTimezone = 'Asia/Shanghai';
      const time = '2025-03-23 12:30:00';
      
      const result = convertTime(sourceTimezone, targetTimezone, time);
      
      // Shanghai is UTC+8, so time should be 8 hours ahead
      // Note: actual difference may vary due to DST
      expect([7, 8]).toContain(result.timeDiff);
      
      // Target time should be 8 hours ahead of source time
      const sourceDateTime = dayjs(result.sourceTime);
      const targetDateTime = dayjs(result.targetTime);
      expect(targetDateTime.diff(sourceDateTime, 'hours')).toBe(8);
    });

    it('should use current time when no time provided', () => {
      const sourceTimezone = 'UTC';
      const targetTimezone = 'Asia/Shanghai';
      
      const result = convertTime(sourceTimezone, targetTimezone);
      
      expect(result.sourceTime).toBeDefined();
      expect(result.targetTime).toBeDefined();
      
      // Both should be valid date strings
      expect(dayjs(result.sourceTime, 'YYYY-MM-DD HH:mm:ss', true).isValid()).toBe(true);
      expect(dayjs(result.targetTime, 'YYYY-MM-DD HH:mm:ss', true).isValid()).toBe(true);
    });

    it('should handle various timezone combinations', () => {
      const timezonePairs = [
        { source: 'America/New_York', target: 'Europe/London' },
        { source: 'Asia/Tokyo', target: 'Australia/Sydney' },
        { source: 'UTC', target: 'America/Los_Angeles' },
      ];
      
      timezonePairs.forEach(({ source, target }) => {
        const result = convertTime(source, target, '2025-03-23 12:30:00');
        expect(result.sourceTime).toBeDefined();
        expect(result.targetTime).toBeDefined();
        expect(typeof result.timeDiff).toBe('number');
      });
    });
  });

  describe('getIsoWeeksInMonth', () => {
    it('should return correct ISO weeks for a standard month', () => {
      const result = getIsoWeeksInMonth(2025, 3); // March 2025
      
      expect(result.year).toBe(2025);
      expect(result.month).toBe(3);
      expect(result.monthName).toBe('March');
      expect(Array.isArray(result.weeks)).toBe(true);
      expect(result.weeks.length).toBeGreaterThan(0);
      expect(result.weekCount).toBe(result.weeks.length);
      expect(result.firstWeek).toBe(Math.min(...result.weeks));
      expect(result.lastWeek).toBe(Math.max(...result.weeks));
      
      // Verify all weeks are unique and sorted
      const uniqueWeeks = new Set(result.weeks);
      expect(uniqueWeeks.size).toBe(result.weeks.length);
      expect(result.weeks).toEqual([...uniqueWeeks].sort((a, b) => a - b));
    });

    it('should handle months that span multiple ISO weeks', () => {
      // Test December 2025 which typically spans multiple ISO years
      const result = getIsoWeeksInMonth(2025, 12);
      
      expect(result.year).toBe(2025);
      expect(result.month).toBe(12);
      expect(result.monthName).toBe('December');
      expect(result.weeks.length).toBeGreaterThan(3); // December usually has 4-5 weeks
    });

    it('should handle February in both leap and non-leap years', () => {
      const nonLeapYear = getIsoWeeksInMonth(2023, 2); // February 2023 (28 days)
      const leapYear = getIsoWeeksInMonth(2024, 2);     // February 2024 (29 days)
      
      expect(nonLeapYear.month).toBe(2);
      expect(leapYear.month).toBe(2);
      expect(nonLeapYear.monthName).toBe('February');
      expect(leapYear.monthName).toBe('February');
      
      // Both should have valid week numbers
      expect(nonLeapYear.weeks.length).toBeGreaterThan(0);
      expect(leapYear.weeks.length).toBeGreaterThan(0);
    });

    it('should handle all months of the year', () => {
      for (let month = 1; month <= 12; month++) {
        const result = getIsoWeeksInMonth(2025, month);
        
        expect(result.year).toBe(2025);
        expect(result.month).toBe(month);
        expect(result.weeks.length).toBeGreaterThan(0);
        expect(result.weeks.length).toBeLessThanOrEqual(6); // Maximum 6 weeks per month
        expect(result.weekCount).toBe(result.weeks.length);
        expect(result.firstWeek).toBeLessThanOrEqual(result.lastWeek);
      }
    });

    it('should return valid ISO week numbers (1-53)', () => {
      const result = getIsoWeeksInMonth(2025, 6); // June 2025
      
      result.weeks.forEach(week => {
        expect(week).toBeGreaterThanOrEqual(1);
        expect(week).toBeLessThanOrEqual(53);
      });
    });

    it('should handle month transitions correctly', () => {
      // Test months that often span ISO year boundaries
      const testCases = [
        { year: 2023, month: 1 },  // January 2023
        { year: 2023, month: 12 }, // December 2023
        { year: 2024, month: 1 },  // January 2024
      ];
      
      testCases.forEach(({ year, month }) => {
        const result = getIsoWeeksInMonth(year, month);
        
        expect(result.year).toBe(year);
        expect(result.month).toBe(month);
        expect(result.weeks.length).toBeGreaterThan(0);
        
        // Verify all week numbers are valid
        result.weeks.forEach(week => {
          expect(week).toBeGreaterThanOrEqual(1);
          expect(week).toBeLessThanOrEqual(53);
        });
      });
    });

    it('should have consistent results for the same month', () => {
      const result1 = getIsoWeeksInMonth(2025, 7);
      const result2 = getIsoWeeksInMonth(2025, 7);
      
      expect(result1).toEqual(result2);
    });

    it('should return proper structure with all required fields', () => {
      const result = getIsoWeeksInMonth(2025, 8);
      
      expect(result).toHaveProperty('year', 2025);
      expect(result).toHaveProperty('month', 8);
      expect(result).toHaveProperty('weeks');
      expect(result).toHaveProperty('firstWeek');
      expect(result).toHaveProperty('lastWeek');
      expect(result).toHaveProperty('weekCount');
      expect(result).toHaveProperty('monthName');
      
      expect(typeof result.weeks).toBe('object');
      expect(typeof result.firstWeek).toBe('number');
      expect(typeof result.lastWeek).toBe('number');
      expect(typeof result.weekCount).toBe('number');
      expect(typeof result.monthName).toBe('string');
    });
  });
});