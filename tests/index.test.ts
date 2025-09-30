import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear.js";
import isoWeek from "dayjs/plugin/isoWeek.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import {
  getWeekDates,
  getWorkdays,
  getCurrentTime,
  getRelativeTime,
  getTimestamp,
  getDaysInMonth,
  getWeekOfYear,
} from "../src";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

describe("Time MCP Server - Core Functions", () => {
  describe("getWeekDates", () => {
    it("should return correct date range for a regular week", () => {
      const result = getWeekDates(2025, 12);
      expect(result.startDate).toBe("2025-03-17");
      expect(result.endDate).toBe("2025-03-23");
    });

    it("should handle week 1 correctly", () => {
      const result = getWeekDates(2024, 1);
      expect(result.startDate).toBe("2024-01-01");
      expect(result.endDate).toBe("2024-01-07");
    });

    it("should handle week 53 correctly", () => {
      const result = getWeekDates(2023, 53);
      expect(result.startDate).toBe("2023-12-25");
      expect(result.endDate).toBe("2023-12-31");
    });

    it("should handle cross-year weeks", () => {
      const result = getWeekDates(2025, 1);
      // Should start in 2024 and end in 2025
      expect(result.startDate).toBe("2024-12-30");
      expect(result.endDate).toBe("2025-01-05");
    });

    it("should return dates that are exactly 7 days apart", () => {
      const result = getWeekDates(2025, 12);
      const start = dayjs(result.startDate);
      const end = dayjs(result.endDate);
      const diff = end.diff(start, "days");
      expect(diff).toBe(6); // 6 days difference means 7 days total
    });

    it("should always start on Monday (ISO week)", () => {
      const result = getWeekDates(2025, 12);
      const start = dayjs(result.startDate);
      expect(start.day()).toBe(1); // Monday
    });
  });

  describe("getWorkdays", () => {
    it("should return exactly 5 workdays", async () => {
      const result = await getWorkdays(2025, 12);
      expect(result).toHaveLength(5);
    });

    it("should return Monday to Friday for default format", async () => {
      const result = await getWorkdays(2025, 12);
      const workdayDates = result.map(w => w.date);
      expect(workdayDates).toEqual([
        "2025-03-17", // Monday
        "2025-03-18", // Tuesday
        "2025-03-19", // Wednesday
        "2025-03-20", // Thursday
        "2025-03-21", // Friday
      ]);
    });

    it("should support different date formats", async () => {
      const result = await getWorkdays(2024, 1, "MM/DD/YYYY");
      const workdayDates = result.map(w => w.date);
      expect(workdayDates).toEqual([
        "01/01/2024",
        "01/02/2024",
        "01/03/2024",
        "01/04/2024",
        "01/05/2024",
      ]);
    });

    it("should support Chinese date format", async () => {
      const result = await getWorkdays(2025, 1, "YYYY年MM月DD日");
      const workdayDates = result.map(w => w.date);
      expect(workdayDates).toEqual([
        "2024年12月30日",
        "2024年12月31日",
        "2025年01月01日",
        "2025年01月02日",
        "2025年01月03日",
      ]);
    });

    it("should handle cross-year workdays", async () => {
      const result = await getWorkdays(2025, 1);
      // Should include days from both 2024 and 2025
      expect(result[0].date).toBe("2024-12-30"); // Monday in 2024
      expect(result[4].date).toBe("2025-01-03"); // Friday in 2025
    });

    it("should start with Monday and end with Friday", async () => {
      const result = await getWorkdays(2025, 12);
      const monday = dayjs(result[0].date);
      const friday = dayjs(result[4].date);
      expect(monday.day()).toBe(1); // Monday
      expect(friday.day()).toBe(5); // Friday
    });

    it("should return workdays with correct structure", async () => {
      const result = await getWorkdays(2025, 12);

      result.forEach(workday => {
        expect(workday).toHaveProperty('date');
        expect(workday).toHaveProperty('dayName');
        expect(workday).toHaveProperty('isWeekend');
        expect(workday).toHaveProperty('isHoliday');
        expect(workday).toHaveProperty('isWorkday');
        expect(workday).toHaveProperty('isInLieuDay');
        expect(workday).toHaveProperty('isCustomWorkday');
        expect(workday).toHaveProperty('isCustomHoliday');

        expect(typeof workday.date).toBe('string');
        expect(typeof workday.dayName).toBe('string');
        expect(typeof workday.isWeekend).toBe('boolean');
        expect(typeof workday.isHoliday).toBe('boolean');
        expect(typeof workday.isWorkday).toBe('boolean');
        expect(typeof workday.isInLieuDay).toBe('boolean');
        expect(typeof workday.isCustomWorkday).toBe('boolean');
        expect(typeof workday.isCustomHoliday).toBe('boolean');
      });
    });
  });

  describe("getCurrentTime", () => {
    it("should return current UTC and local time", () => {
      const result = getCurrentTime("YYYY-MM-DD HH:mm:ss");
      expect(result.utc).toBeDefined();
      expect(result.local).toBeDefined();
      expect(result.timezone).toBeDefined();
      expect(typeof result.utc).toBe("string");
      expect(typeof result.local).toBe("string");
      expect(typeof result.timezone).toBe("string");
    });

    it("should use specified timezone when provided", () => {
      const result = getCurrentTime("YYYY-MM-DD HH:mm:ss", "Asia/Shanghai");
      expect(result.timezone).toBe("Asia/Shanghai");
    });

    it("should format time according to specified format", () => {
      const result = getCurrentTime("YYYY-MM-DD");
      expect(result.utc).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.local).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("getRelativeTime", () => {
    it("should return relative time string", () => {
      const pastTime = dayjs()
        .subtract(1, "hour")
        .format("YYYY-MM-DD HH:mm:ss");
      const result = getRelativeTime(pastTime);
      expect(typeof result).toBe("string");
      expect(result).toMatch(/hour/);
    });

    it("should handle future times", () => {
      const futureTime = dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss");
      const result = getRelativeTime(futureTime);
      expect(typeof result).toBe("string");
    });
  });

  describe("getTimestamp", () => {
    it("should return current timestamp when no time provided", () => {
      const result = getTimestamp();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("should return timestamp for specific time", () => {
      const testTime = "2025-01-01 00:00:00";
      const result = getTimestamp(testTime);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("should handle different date formats", () => {
      const testTime = "2025-01-01T00:00:00Z";
      const result = getTimestamp(testTime);
      expect(typeof result).toBe("number");
    });
  });

  describe("getDaysInMonth", () => {
    it("should return correct days for current month when no date provided", () => {
      const result = getDaysInMonth();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(27);
      expect(result).toBeLessThan(32);
    });

    it("should return 31 days for January", () => {
      const result = getDaysInMonth("2025-01-15");
      expect(result).toBe(31);
    });

    it("should return 28 days for February 2025 (not leap year)", () => {
      const result = getDaysInMonth("2025-02-15");
      expect(result).toBe(28);
    });

    it("should return 29 days for February 2024 (leap year)", () => {
      const result = getDaysInMonth("2024-02-15");
      expect(result).toBe(29);
    });

    it("should return 30 days for April", () => {
      const result = getDaysInMonth("2025-04-15");
      expect(result).toBe(30);
    });
  });

  describe("getWeekOfYear", () => {
    it("should return week and isoWeek for current date when no date provided", () => {
      const result = getWeekOfYear();
      expect(result).toHaveProperty("week");
      expect(result).toHaveProperty("isoWeek");
      expect(typeof result.week).toBe("number");
      expect(typeof result.isoWeek).toBe("number");
    });

    it("should return correct week numbers for specific date", () => {
      const result = getWeekOfYear("2025-01-01");
      expect(result.week).toBeGreaterThan(0);
      expect(result.isoWeek).toBeGreaterThan(0);
    });

    it("should handle different date formats", () => {
      const result = getWeekOfYear("2025/01/01");
      expect(result).toHaveProperty("week");
      expect(result).toHaveProperty("isoWeek");
    });

    it("should return week numbers within valid range", () => {
      const result = getWeekOfYear("2025-06-15");
      expect(result.week).toBeGreaterThan(0);
      expect(result.week).toBeLessThan(54);
      expect(result.isoWeek).toBeGreaterThan(0);
      expect(result.isoWeek).toBeLessThan(54);
    });
  });
});
