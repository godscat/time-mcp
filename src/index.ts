#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CURRENT_TIME, DAYS_IN_MONTH, GET_TIMESTAMP, RELATIVE_TIME, CONVERT_TIME, GET_WEEK_YEAR, GET_WEEK_DATES, GET_WORKDAYS_BY_WEEK, GET_ISO_WEEKS_IN_MONTH, GET_WORKDAYS_BY_MONTH, GET_WORKDAYS_BY_RANGE, GET_WORKDAYS_BY_QUARTER, GET_WORKDAYS_BY_YEAR, GET_WORKDAY_STATS } from './tools.js';
import { HolidayManager } from './holiday-manager.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import dayjs from 'dayjs';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export const server = new Server({
  name: 'time-mcp',
  version: '0.0.1',
}, {
  capabilities: {
    tools: {},
    logging: {},
  },
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [CURRENT_TIME, RELATIVE_TIME, DAYS_IN_MONTH, GET_TIMESTAMP, CONVERT_TIME, GET_WEEK_YEAR, GET_WEEK_DATES, GET_WORKDAYS_BY_WEEK, GET_ISO_WEEKS_IN_MONTH, GET_WORKDAYS_BY_MONTH, GET_WORKDAYS_BY_RANGE, GET_WORKDAYS_BY_QUARTER, GET_WORKDAYS_BY_YEAR, GET_WORKDAY_STATS],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'current_time': {
        if (!checkCurrentTimeArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }

        const { format, timezone } = args;
        const result = getCurrentTime(format, timezone);
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `Current UTC time is ${result.utc}, and the time in ${result.timezone} is ${result.local}.`,
            },
          ],
        };
      }
      case 'relative_time': {
        if (!checkRelativeTimeArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }

        const time = args.time;
        const result = getRelativeTime(time);
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
      case 'days_in_month': {
        if (!checkDaysInMonthArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }

        const date = args.date;
        const result = getDaysInMonth(date);
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `The number of days in month is ${result}.`,
            },
          ],
        };
      }
      case 'get_timestamp': {
        if (!checkTimestampArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const time = args.time;
        const result = getTimestamp(time);
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: time 
                ? `The timestamp of ${time} (parsed as UTC) is ${result} ms.`
                : `The current timestamp is ${result} ms.`,
            },
          ],
        };
      }
      case 'convert_time': {
        if (!checkConvertTimeArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { sourceTimezone, targetTimezone, time } = args;
        const { sourceTime, targetTime, timeDiff } = convertTime(sourceTimezone, targetTimezone, time);
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `Current time in ${sourceTimezone} is ${sourceTime}, and the time in ${targetTimezone} is ${targetTime}. The time difference is ${timeDiff} hours.`,
            },
          ],
        };
      }
      case 'get_week_year': {
        if (!checkWeekOfYearArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { date } = args;
        const { week, isoWeek } = getWeekOfYear(date);
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `The week of the year is ${week}, and the isoWeek of the year is ${isoWeek}.`,
            },
          ],
        };
      }
      case 'get_week_dates': {
        if (!checkWeekDatesArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { year, week } = args;
        const { startDate, endDate } = getWeekDates(year, week);
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `ISO week ${week} of ${year} runs from ${startDate} to ${endDate}.`,
            },
          ],
        };
      }
      case 'get_workdays_by_week': {
        if (!checkWorkdaysArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { year, week, format, region, useHolidays, refreshData, customWorkdays, customHolidays } = args;
        const workdays = await getWorkdays(year, week, format, region, useHolidays, refreshData, customWorkdays, customHolidays);

        // 创建结构化的工作日数据
        const structuredWorkdays = workdays.map((item) => {
          return {
            date: item.date,
            day: item.dayName,
            week: week,
            year: year,
            isWeekend: item.isWeekend,
            isHoliday: item.isHoliday,
            isWorkday: item.isWorkday,
            isInLieuDay: item.isInLieuDay,
            isCustomWorkday: item.isCustomWorkday,
            isCustomHoliday: item.isCustomHoliday,
            holidayInfo: item.holidayInfo,
            workdayInfo: item.workdayInfo,
            inLieuDayInfo: item.inLieuDayInfo,
          };
        });

        const regionText = region === 'china' ? ' (China region with holidays)' : ' (Standard Monday-Friday)';
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `Workdays for ISO week ${week} of ${year}${regionText}:\n${workdays.map(item => `- ${item.date} (${item.dayName})${item.isHoliday ? ' 🏖️' : item.isWorkday ? ' 🏢' : ''}`).join('\n')}`,
            },
            {
              type: 'text',
              text: `Structured data:\n${JSON.stringify(structuredWorkdays, null, 2)}`,
            },
          ],
        };
      }
      case 'get_iso_weeks_in_month': {
        if (!checkIsoWeeksInMonthArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { year, month } = args;
        const isoWeeks = getIsoWeeksInMonth(year, month);
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `ISO weeks in ${year}-${month.toString().padStart(2, '0')}: ${isoWeeks.weeks.join(', ')}`,
            },
            {
              type: 'text',
              text: `Detailed info:\n${JSON.stringify(isoWeeks, null, 2)}`,
            },
          ],
        };
      }
      case 'get_workdays_by_month': {
        if (!checkWorkdaysByMonthArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { year, month, format, region, useHolidays, refreshData, customWorkdays, customHolidays } = args;
        const workdays = await getWorkdaysByMonth(year, month, format, region, useHolidays, refreshData, customWorkdays, customHolidays);

        // 创建结构化的工作日数据
        const structuredWorkdays = workdays.map((item) => {
          return {
            date: item.date,
            day: item.dayName,
            month: month,
            year: year,
            isWeekend: item.isWeekend,
            isHoliday: item.isHoliday,
            isWorkday: item.isWorkday,
            isInLieuDay: item.isInLieuDay,
            isCustomWorkday: item.isCustomWorkday,
            isCustomHoliday: item.isCustomHoliday,
            holidayInfo: item.holidayInfo,
            workdayInfo: item.workdayInfo,
            inLieuDayInfo: item.inLieuDayInfo,
          };
        });

        const regionText = region === 'china' ? ' (China region with holidays)' : ' (Standard Monday-Friday)';
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `Workdays for ${year}-${month.toString().padStart(2, '0')}${regionText}:\n${workdays.map(item => `- ${item.date} (${item.dayName})${item.isHoliday ? ' 🏖️' : item.isWorkday ? ' 🏢' : ''}`).join('\n')}`,
            },
            {
              type: 'text',
              text: `Structured data:\n${JSON.stringify(structuredWorkdays, null, 2)}`,
            },
          ],
        };
      }
      case 'get_workdays_by_range': {
        if (!checkWorkdaysByRangeArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { startDate, endDate, format, region, useHolidays, refreshData, customWorkdays, customHolidays } = args;
        const workdays = await getWorkdaysByRange(startDate, endDate, format, region, useHolidays, refreshData, customWorkdays, customHolidays);

        // 创建结构化的工作日数据
        const structuredWorkdays = workdays.map((item) => {
          return {
            date: item.date,
            day: item.dayName,
            isWeekend: item.isWeekend,
            isHoliday: item.isHoliday,
            isWorkday: item.isWorkday,
            isInLieuDay: item.isInLieuDay,
            isCustomWorkday: item.isCustomWorkday,
            isCustomHoliday: item.isCustomHoliday,
            holidayInfo: item.holidayInfo,
            workdayInfo: item.workdayInfo,
            inLieuDayInfo: item.inLieuDayInfo,
          };
        });

        const regionText = region === 'china' ? ' (China region with holidays)' : ' (Standard Monday-Friday)';
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `Workdays from ${startDate} to ${endDate}${regionText}:\n${workdays.map(item => `- ${item.date} (${item.dayName})${item.isHoliday ? ' 🏖️' : item.isWorkday ? ' 🏢' : ''}`).join('\n')}`,
            },
            {
              type: 'text',
              text: `Structured data:\n${JSON.stringify(structuredWorkdays, null, 2)}`,
            },
          ],
        };
      }
      case 'get_workdays_by_quarter': {
        if (!checkWorkdaysByQuarterArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { year, quarter, format, region, useHolidays, refreshData, customWorkdays, customHolidays } = args;
        const workdays = await getWorkdaysByQuarter(year, quarter, format, region, useHolidays, refreshData, customWorkdays, customHolidays);

        // 创建结构化的工作日数据
        const structuredWorkdays = workdays.map((item) => {
          return {
            date: item.date,
            day: item.dayName,
            quarter: quarter,
            year: year,
            isWeekend: item.isWeekend,
            isHoliday: item.isHoliday,
            isWorkday: item.isWorkday,
            isInLieuDay: item.isInLieuDay,
            isCustomWorkday: item.isCustomWorkday,
            isCustomHoliday: item.isCustomHoliday,
            holidayInfo: item.holidayInfo,
            workdayInfo: item.workdayInfo,
            inLieuDayInfo: item.inLieuDayInfo,
          };
        });

        const regionText = region === 'china' ? ' (China region with holidays)' : ' (Standard Monday-Friday)';
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `Workdays for Q${quarter} ${year}${regionText}:\n${workdays.map(item => `- ${item.date} (${item.dayName})${item.isHoliday ? ' 🏖️' : item.isWorkday ? ' 🏢' : ''}`).join('\n')}`,
            },
            {
              type: 'text',
              text: `Structured data:\n${JSON.stringify(structuredWorkdays, null, 2)}`,
            },
          ],
        };
      }
      case 'get_workdays_by_year': {
        if (!checkWorkdaysByYearArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { year, format, region, useHolidays, refreshData, customWorkdays, customHolidays } = args;
        const workdays = await getWorkdaysByYear(year, format, region, useHolidays, refreshData, customWorkdays, customHolidays);

        // 创建结构化的工作日数据
        const structuredWorkdays = workdays.map((item) => {
          return {
            date: item.date,
            day: item.dayName,
            year: year,
            isWeekend: item.isWeekend,
            isHoliday: item.isHoliday,
            isWorkday: item.isWorkday,
            isInLieuDay: item.isInLieuDay,
            isCustomWorkday: item.isCustomWorkday,
            isCustomHoliday: item.isCustomHoliday,
            holidayInfo: item.holidayInfo,
            workdayInfo: item.workdayInfo,
            inLieuDayInfo: item.inLieuDayInfo,
          };
        });

        const regionText = region === 'china' ? ' (China region with holidays)' : ' (Standard Monday-Friday)';
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `Workdays for ${year}${regionText}:\n${workdays.map(item => `- ${item.date} (${item.dayName})${item.isHoliday ? ' 🏖️' : item.isWorkday ? ' 🏢' : ''}`).join('\n')}`,
            },
            {
              type: 'text',
              text: `Structured data:\n${JSON.stringify(structuredWorkdays, null, 2)}`,
            },
          ],
        };
      }
      case 'get_workday_stats': {
        if (!checkWorkdayStatsArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { startDate, endDate, region, useHolidays, refreshData, customWorkdays, customHolidays } = args;
        const stats = await getWorkdayStats(startDate, endDate, region, useHolidays, refreshData, customWorkdays, customHolidays);

        const regionText = region === 'china' ? ' (China region with holidays)' : ' (Standard Monday-Friday)';
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `Workday statistics from ${startDate} to ${endDate}${regionText}:\n` +
                     `• Total days: ${stats.totalDays}\n` +
                     `• Workdays: ${stats.workdays}\n` +
                     `• Holidays: ${stats.holidays}\n` +
                     `• Weekends: ${stats.weekends}\n` +
                     `• In-lieu days: ${stats.inLieuDays}\n` +
                     `• Custom workdays: ${stats.customWorkdays}\n` +
                     `• Custom holidays: ${stats.customHolidays}`,
            },
            {
              type: 'text',
              text: `Detailed statistics:\n${JSON.stringify(stats, null, 2)}`,
            },
          ],
        };
      }
      default: {
        throw new Error(`Unknown tool: ${name}`);
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      content: [
        {
          type: 'text',
          text: message,
        },
      ],
    };
  }
});

export function getCurrentTime(format: string, timezone?: string) {
  const utcTime = dayjs.utc();
  const localTimezone = timezone ?? dayjs.tz.guess();
  const localTime = dayjs().tz(localTimezone);
  return {
    utc: utcTime.format(format),
    local: localTime.format(format),
    timezone: localTimezone,
  };
}

export function getRelativeTime(time: string) {
  return dayjs(time).fromNow();
}

export function getTimestamp(time?: string) {
  return time ? dayjs.utc(time).valueOf() : dayjs().valueOf();
}

export function getDaysInMonth(date?: string) {
  return date ? dayjs(date).daysInMonth() : dayjs().daysInMonth();
}

export function getWeekOfYear(date?: string) {
  const week =  date ? dayjs(date).week() : dayjs().week();
  const isoWeek = date ? dayjs(date).isoWeek() : dayjs().isoWeek();
  return {
    week,
    isoWeek,
  };
}

export function getWeekDates(year: number, week: number) {
  const firstDayOfYear = dayjs(`${year}-01-01`);
  const firstMonday = firstDayOfYear.startOf('isoWeek');
  
  if (firstDayOfYear.day() === 1) {
    firstMonday.year(firstDayOfYear.year());
  } else {
    firstMonday.add(1, 'week');
  }
  
  const targetWeekStart = firstMonday.add(week - 1, 'week');
  const targetWeekEnd = targetWeekStart.add(6, 'day');
  
  return {
    startDate: targetWeekStart.format('YYYY-MM-DD'),
    endDate: targetWeekEnd.format('YYYY-MM-DD'),
  };
}

interface HolidayInfo {
  date: string;
  name: string;
  chineseName: string;
  type: number;
  isHoliday: boolean;
}

interface WorkdayDataInfo {
  date: string;
  name: string;
  chineseName: string;
  type: number;
  isWorkday: boolean;
}

interface InLieuDayInfo {
  date: string;
  name: string;
  chineseName: string;
  type: number;
  isInLieuDay: boolean;
}

interface WorkdayInfo {
  date: string;
  dayName: string;
  isWeekend: boolean;
  isHoliday: boolean;
  isWorkday: boolean;
  isInLieuDay: boolean;
  isCustomWorkday: boolean;
  isCustomHoliday: boolean;
  holidayInfo?: HolidayInfo;
  workdayInfo?: WorkdayDataInfo;
  inLieuDayInfo?: InLieuDayInfo;
}

export async function getWorkdays(
  year: number,
  week: number,
  format: string = 'YYYY-MM-DD',
  region: string = '',
  useHolidays: boolean = true,
  refreshData: boolean = false,
  customWorkdays: string[] = [],
  customHolidays: string[] = [],
): Promise<WorkdayInfo[]> {
  const firstDayOfYear = dayjs(`${year}-01-01`);
  const firstMonday = firstDayOfYear.startOf('isoWeek');

  if (firstDayOfYear.day() === 1) {
    firstMonday.year(firstDayOfYear.year());
  } else {
    firstMonday.add(1, 'week');
  }

  const targetWeekStart = firstMonday.add(week - 1, 'week');
  const workdays: WorkdayInfo[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // 如果使用中国节假日数据，初始化节假日管理器
  let holidayManager: HolidayManager | null = null;
  if (region === 'china' && useHolidays) {
    holidayManager = HolidayManager.getInstance();
    await holidayManager.initialize();

    if (refreshData) {
      await holidayManager.refreshData();
    }
  }

  // 获取整周的所有日期
  for (let i = 0; i < 7; i++) {
    const currentDate = targetWeekStart.add(i, 'day');
    const dateString = currentDate.format('YYYY-MM-DD');
    const dayOfWeek = currentDate.day();

    const workdayInfo: WorkdayInfo = {
      date: currentDate.format(format),
      dayName: dayNames[dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isHoliday: false,
      isWorkday: false,
      isInLieuDay: false,
      isCustomWorkday: customWorkdays.includes(dateString),
      isCustomHoliday: customHolidays.includes(dateString),
    };

    // 如果是自定义工作日，强制为工作日
    if (workdayInfo.isCustomWorkday) {
      workdayInfo.isWorkday = true;
      workdayInfo.isHoliday = false;
      workdayInfo.isWeekend = false;
      workdays.push(workdayInfo);
      continue;
    }

    // 如果是自定义节假日，强制为节假日
    if (workdayInfo.isCustomHoliday) {
      workdayInfo.isWorkday = false;
      workdayInfo.isHoliday = true;
      workdays.push(workdayInfo);
      continue;
    }

    // 使用中国节假日数据
    if (region === 'china' && useHolidays && holidayManager) {
      workdayInfo.isHoliday = holidayManager.isHoliday(dateString);
      workdayInfo.isWorkday = holidayManager.isWorkday(dateString);
      workdayInfo.isInLieuDay = holidayManager.isInLieuDay(dateString);

      if (workdayInfo.isHoliday) {
        workdayInfo.holidayInfo = holidayManager.getHolidayInfo(dateString);
      }
      if (workdayInfo.isWorkday) {
        workdayInfo.workdayInfo = holidayManager.getWorkdayInfo(dateString);
      }
      if (workdayInfo.isInLieuDay) {
        workdayInfo.inLieuDayInfo = holidayManager.getInLieuDayInfo(dateString);
      }

      // 中国工作日判断逻辑
      const isActualWorkday = holidayManager.isWorkdayForChineseCalendar(dateString);
      workdayInfo.isWorkday = isActualWorkday;
    } else {
      // 标准工作日判断逻辑（周一到周五）
      workdayInfo.isWorkday = !workdayInfo.isWeekend;
    }

    // 只添加实际工作日
    if (workdayInfo.isWorkday) {
      workdays.push(workdayInfo);
    }
  }

  return workdays;
}

export function getIsoWeeksInMonth(year: number, month: number) {
  // 获取指定月份的第一天和最后一天
  const firstDayOfMonth = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`);
  const lastDayOfMonth = firstDayOfMonth.endOf('month');
  const daysInMonth = lastDayOfMonth.date();

  // 收集该月份包含的所有ISO周数
  const weeks = new Set<number>();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    weeks.add(currentDate.isoWeek());
  }

  const sortedWeeks = Array.from(weeks).sort((a, b) => a - b);

  return {
    year,
    month,
    weeks: sortedWeeks,
    firstWeek: Math.min(...sortedWeeks),
    lastWeek: Math.max(...sortedWeeks),
    weekCount: sortedWeeks.length,
    monthName: firstDayOfMonth.format('MMMM'),
  };
}

// 工作日统计接口
interface WorkdayStats {
  totalDays: number;
  workdays: number;
  holidays: number;
  weekends: number;
  inLieuDays: number;
  customWorkdays: number;
  customHolidays: number;
  startDate: string;
  endDate: string;
  region: string;
}

// 通用的日期处理函数
async function processDateRange(
  startDate: dayjs.Dayjs,
  endDate: dayjs.Dayjs,
  format: string,
  region: string,
  useHolidays: boolean,
  refreshData: boolean,
  customWorkdays: string[],
  customHolidays: string[],
  returnAll: boolean = false,
): Promise<WorkdayInfo[]> {
  const workdays: WorkdayInfo[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // 如果使用中国节假日数据，初始化节假日管理器
  let holidayManager: HolidayManager | null = null;
  if (region === 'china' && useHolidays) {
    holidayManager = HolidayManager.getInstance();
    await holidayManager.initialize();

    if (refreshData) {
      await holidayManager.refreshData();
    }
  }

  // 遍历日期范围
  let currentDate = startDate;
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    const dateString = currentDate.format('YYYY-MM-DD');
    const dayOfWeek = currentDate.day();

    const workdayInfo: WorkdayInfo = {
      date: currentDate.format(format),
      dayName: dayNames[dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isHoliday: false,
      isWorkday: false,
      isInLieuDay: false,
      isCustomWorkday: customWorkdays.includes(dateString),
      isCustomHoliday: customHolidays.includes(dateString),
    };

    // 如果是自定义工作日，强制为工作日
    if (workdayInfo.isCustomWorkday) {
      workdayInfo.isWorkday = true;
      workdayInfo.isHoliday = false;
      workdayInfo.isWeekend = false;
      workdays.push(workdayInfo);
      currentDate = currentDate.add(1, 'day');
      continue;
    }

    // 如果是自定义节假日，强制为节假日
    if (workdayInfo.isCustomHoliday) {
      workdayInfo.isWorkday = false;
      workdayInfo.isHoliday = true;
      workdays.push(workdayInfo);
      currentDate = currentDate.add(1, 'day');
      continue;
    }

    // 使用中国节假日数据
    if (region === 'china' && useHolidays && holidayManager) {
      workdayInfo.isHoliday = holidayManager.isHoliday(dateString);
      workdayInfo.isWorkday = holidayManager.isWorkday(dateString);
      workdayInfo.isInLieuDay = holidayManager.isInLieuDay(dateString);

      if (workdayInfo.isHoliday) {
        workdayInfo.holidayInfo = holidayManager.getHolidayInfo(dateString);
      }
      if (workdayInfo.isWorkday) {
        workdayInfo.workdayInfo = holidayManager.getWorkdayInfo(dateString);
      }
      if (workdayInfo.isInLieuDay) {
        workdayInfo.inLieuDayInfo = holidayManager.getInLieuDayInfo(dateString);
      }

      // 中国工作日判断逻辑
      const isActualWorkday = holidayManager.isWorkdayForChineseCalendar(dateString);
      workdayInfo.isWorkday = isActualWorkday;
    } else {
      // 标准工作日判断逻辑（周一到周五）
      workdayInfo.isWorkday = !workdayInfo.isWeekend;
    }

    // 如果返回所有日期或只是工作日
    if (returnAll || workdayInfo.isWorkday) {
      workdays.push(workdayInfo);
    }

    currentDate = currentDate.add(1, 'day');
  }

  return workdays;
}

export async function getWorkdaysByMonth(
  year: number,
  month: number,
  format: string = 'YYYY-MM-DD',
  region: string = '',
  useHolidays: boolean = true,
  refreshData: boolean = false,
  customWorkdays: string[] = [],
  customHolidays: string[] = [],
): Promise<WorkdayInfo[]> {
  const firstDayOfMonth = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`);
  const lastDayOfMonth = firstDayOfMonth.endOf('month');

  return processDateRange(
    firstDayOfMonth,
    lastDayOfMonth,
    format,
    region,
    useHolidays,
    refreshData,
    customWorkdays,
    customHolidays,
  );
}

export async function getWorkdaysByRange(
  startDate: string,
  endDate: string,
  format: string = 'YYYY-MM-DD',
  region: string = '',
  useHolidays: boolean = true,
  refreshData: boolean = false,
  customWorkdays: string[] = [],
  customHolidays: string[] = [],
): Promise<WorkdayInfo[]> {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // 验证日期范围
  if (start.isAfter(end)) {
    throw new Error('Start date must be before or equal to end date');
  }

  return processDateRange(
    start,
    end,
    format,
    region,
    useHolidays,
    refreshData,
    customWorkdays,
    customHolidays,
  );
}

export async function getWorkdaysByQuarter(
  year: number,
  quarter: number,
  format: string = 'YYYY-MM-DD',
  region: string = '',
  useHolidays: boolean = true,
  refreshData: boolean = false,
  customWorkdays: string[] = [],
  customHolidays: string[] = [],
): Promise<WorkdayInfo[]> {
  // 计算季度的起始月份
  const startMonth = (quarter - 1) * 3 + 1;

  const firstDayOfQuarter = dayjs(`${year}-${startMonth.toString().padStart(2, '0')}-01`);
  const lastDayOfQuarter = firstDayOfQuarter.add(2, 'month').endOf('month');

  return processDateRange(
    firstDayOfQuarter,
    lastDayOfQuarter,
    format,
    region,
    useHolidays,
    refreshData,
    customWorkdays,
    customHolidays,
  );
}

export async function getWorkdaysByYear(
  year: number,
  format: string = 'YYYY-MM-DD',
  region: string = '',
  useHolidays: boolean = true,
  refreshData: boolean = false,
  customWorkdays: string[] = [],
  customHolidays: string[] = [],
): Promise<WorkdayInfo[]> {
  const firstDayOfYear = dayjs(`${year}-01-01`);
  const lastDayOfYear = firstDayOfYear.endOf('year');

  return processDateRange(
    firstDayOfYear,
    lastDayOfYear,
    format,
    region,
    useHolidays,
    refreshData,
    customWorkdays,
    customHolidays,
  );
}

export async function getWorkdayStats(
  startDate: string,
  endDate: string,
  region: string = '',
  useHolidays: boolean = true,
  refreshData: boolean = false,
  customWorkdays: string[] = [],
  customHolidays: string[] = [],
): Promise<WorkdayStats> {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // 验证日期范围
  if (start.isAfter(end)) {
    throw new Error('Start date must be before or equal to end date');
  }

  // 获取所有日期的详细信息
  const allDates = await processDateRange(
    start,
    end,
    'YYYY-MM-DD',
    region,
    useHolidays,
    refreshData,
    customWorkdays,
    customHolidays,
    true, // 返回所有日期，不仅仅是工作日
  );

  // 统计各类日期
  const stats: WorkdayStats = {
    totalDays: allDates.length,
    workdays: 0,
    holidays: 0,
    weekends: 0,
    inLieuDays: 0,
    customWorkdays: 0,
    customHolidays: 0,
    startDate,
    endDate,
    region,
  };

  allDates.forEach(date => {
    if (date.isCustomWorkday) {
      stats.customWorkdays++;
    }
    if (date.isCustomHoliday) {
      stats.customHolidays++;
    }
    if (date.isWeekend) {
      stats.weekends++;
    }
    if (date.isHoliday) {
      stats.holidays++;
    }
    if (date.isInLieuDay) {
      stats.inLieuDays++;
    }
    if (date.isWorkday) {
      stats.workdays++;
    }
  });

  return stats;
}

export function convertTime(sourceTimezone: string, targetTimezone: string, time?: string) {
  // 如果没有提供时间，使用当前时间
  const sourceTime = time ? dayjs.tz(time, sourceTimezone) : dayjs().tz(sourceTimezone);
  const targetTime = sourceTime.clone().tz(targetTimezone);
  const formatString = 'YYYY-MM-DD HH:mm:ss';
  
  // 计算时区偏移差异（以小时为单位）
  const sourceOffset = sourceTime.utcOffset() / 60; // 转换为小时
  const targetOffset = targetTime.utcOffset() / 60; // 转换为小时
  const timeDiff = targetOffset - sourceOffset;
  
  return {
    sourceTime: sourceTime.format(formatString),
    targetTime: targetTime.format(formatString),
    timeDiff: timeDiff,
  };
}

function checkCurrentTimeArgs(args: unknown): args is { format: string, timezone?: string } {
  return (
    typeof args === 'object' &&
    args !== null &&
    'format' in args &&
    typeof args.format === 'string' &&
    ('timezone' in args ? typeof args.timezone === 'string' : true)
  );
}

function checkRelativeTimeArgs(args: unknown): args is { time: string } {
  return (
    typeof args === 'object' &&
    args !== null &&
    'time' in args &&
    typeof args.time === 'string'
  );
}

function checkDaysInMonthArgs(args: unknown): args is { date: string } {
  return (
    typeof args === 'object' &&
    args !== null &&
    'date' in args &&
    typeof args.date === 'string'
  );
}

function checkTimestampArgs(args: unknown): args is { time?: string } {
  if (args === undefined || args === null) {
    return true;
  }
  return (
    typeof args === 'object' &&
    (!('time' in (args as Record<string, unknown>)) || typeof (args as { time?: unknown }).time === 'string')
  );
}

function checkConvertTimeArgs(args: unknown): args is { sourceTimezone: string, targetTimezone: string, time: string } {
  return (
    typeof args === 'object' &&
    args !== null &&
    'sourceTimezone' in args &&
    typeof args.sourceTimezone === 'string' &&
    'targetTimezone' in args &&
    typeof args.targetTimezone === 'string' &&
    'time' in args &&
    typeof args.time === 'string'
  );
}

function checkWeekOfYearArgs(args: unknown): args is { date: string } {
  return (
    typeof args === 'object' &&
    args !== null &&
    ('date' in args ? typeof args.date === 'string' : true)
  );
}

function checkWeekDatesArgs(args: unknown): args is { year: number, week: number } {
  return (
    typeof args === 'object' &&
    args !== null &&
    'year' in args &&
    typeof args.year === 'number' &&
    'week' in args &&
    typeof args.week === 'number' &&
    args.week >= 1 &&
    args.week <= 53
  );
}

function checkWorkdaysArgs(args: unknown): args is {
  year: number,
  week: number,
  format?: string,
  region?: string,
  useHolidays?: boolean,
  refreshData?: boolean,
  customWorkdays?: string[],
  customHolidays?: string[]
} {
  if (
    typeof args === 'object' &&
    args !== null &&
    'year' in args &&
    typeof args.year === 'number' &&
    'week' in args &&
    typeof args.week === 'number' &&
    args.week >= 1 &&
    args.week <= 53
  ) {
    // 检查 format 参数
    if ('format' in args) {
      const validFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY年MM月DD日', 'MM-DD-YYYY'];
      if (typeof args.format !== 'string' || !validFormats.includes(args.format)) {
        return false;
      }
    }

    // 检查 region 参数
    if ('region' in args) {
      const validRegions = ['china', ''];
      if (typeof args.region !== 'string' || !validRegions.includes(args.region)) {
        return false;
      }
    }

    // 检查 useHolidays 参数
    if ('useHolidays' in args && typeof args.useHolidays !== 'boolean') {
      return false;
    }

    // 检查 refreshData 参数
    if ('refreshData' in args && typeof args.refreshData !== 'boolean') {
      return false;
    }

    // 检查 customWorkdays 参数
    if ('customWorkdays' in args) {
      if (!Array.isArray(args.customWorkdays)) {
        return false;
      }
      for (const date of args.customWorkdays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    // 检查 customHolidays 参数
    if ('customHolidays' in args) {
      if (!Array.isArray(args.customHolidays)) {
        return false;
      }
      for (const date of args.customHolidays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    return true;
  }
  return false;
}

function checkIsoWeeksInMonthArgs(args: unknown): args is { year: number, month: number } {
  return (
    typeof args === 'object' &&
    args !== null &&
    'year' in args &&
    typeof args.year === 'number' &&
    'month' in args &&
    typeof args.month === 'number' &&
    args.month >= 1 &&
    args.month <= 12
  );
}

function checkWorkdaysByMonthArgs(args: unknown): args is {
  year: number,
  month: number,
  format?: string,
  region?: string,
  useHolidays?: boolean,
  refreshData?: boolean,
  customWorkdays?: string[],
  customHolidays?: string[]
} {
  if (
    typeof args === 'object' &&
    args !== null &&
    'year' in args &&
    typeof args.year === 'number' &&
    'month' in args &&
    typeof args.month === 'number' &&
    args.month >= 1 &&
    args.month <= 12
  ) {
    // 检查 format 参数
    if ('format' in args) {
      const validFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY年MM月DD日', 'MM-DD-YYYY'];
      if (typeof args.format !== 'string' || !validFormats.includes(args.format)) {
        return false;
      }
    }

    // 检查 region 参数
    if ('region' in args) {
      const validRegions = ['china', ''];
      if (typeof args.region !== 'string' || !validRegions.includes(args.region)) {
        return false;
      }
    }

    // 检查 useHolidays 参数
    if ('useHolidays' in args && typeof args.useHolidays !== 'boolean') {
      return false;
    }

    // 检查 refreshData 参数
    if ('refreshData' in args && typeof args.refreshData !== 'boolean') {
      return false;
    }

    // 检查 customWorkdays 参数
    if ('customWorkdays' in args) {
      if (!Array.isArray(args.customWorkdays)) {
        return false;
      }
      for (const date of args.customWorkdays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    // 检查 customHolidays 参数
    if ('customHolidays' in args) {
      if (!Array.isArray(args.customHolidays)) {
        return false;
      }
      for (const date of args.customHolidays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    return true;
  }
  return false;
}

function checkWorkdaysByRangeArgs(args: unknown): args is {
  startDate: string,
  endDate: string,
  format?: string,
  region?: string,
  useHolidays?: boolean,
  refreshData?: boolean,
  customWorkdays?: string[],
  customHolidays?: string[]
} {
  if (
    typeof args === 'object' &&
    args !== null &&
    'startDate' in args &&
    typeof args.startDate === 'string' &&
    'endDate' in args &&
    typeof args.endDate === 'string'
  ) {
    // 验证日期格式
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(args.endDate)) {
      return false;
    }

    // 验证日期范围
    const start = dayjs(args.startDate);
    const end = dayjs(args.endDate);
    if (start.isAfter(end)) {
      return false;
    }

    // 检查 format 参数
    if ('format' in args) {
      const validFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY年MM月DD日', 'MM-DD-YYYY'];
      if (typeof args.format !== 'string' || !validFormats.includes(args.format)) {
        return false;
      }
    }

    // 检查 region 参数
    if ('region' in args) {
      const validRegions = ['china', ''];
      if (typeof args.region !== 'string' || !validRegions.includes(args.region)) {
        return false;
      }
    }

    // 检查 useHolidays 参数
    if ('useHolidays' in args && typeof args.useHolidays !== 'boolean') {
      return false;
    }

    // 检查 refreshData 参数
    if ('refreshData' in args && typeof args.refreshData !== 'boolean') {
      return false;
    }

    // 检查 customWorkdays 参数
    if ('customWorkdays' in args) {
      if (!Array.isArray(args.customWorkdays)) {
        return false;
      }
      for (const date of args.customWorkdays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    // 检查 customHolidays 参数
    if ('customHolidays' in args) {
      if (!Array.isArray(args.customHolidays)) {
        return false;
      }
      for (const date of args.customHolidays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    return true;
  }
  return false;
}

function checkWorkdaysByQuarterArgs(args: unknown): args is {
  year: number,
  quarter: number,
  format?: string,
  region?: string,
  useHolidays?: boolean,
  refreshData?: boolean,
  customWorkdays?: string[],
  customHolidays?: string[]
} {
  if (
    typeof args === 'object' &&
    args !== null &&
    'year' in args &&
    typeof args.year === 'number' &&
    'quarter' in args &&
    typeof args.quarter === 'number' &&
    args.quarter >= 1 &&
    args.quarter <= 4
  ) {
    // 检查 format 参数
    if ('format' in args) {
      const validFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY年MM月DD日', 'MM-DD-YYYY'];
      if (typeof args.format !== 'string' || !validFormats.includes(args.format)) {
        return false;
      }
    }

    // 检查 region 参数
    if ('region' in args) {
      const validRegions = ['china', ''];
      if (typeof args.region !== 'string' || !validRegions.includes(args.region)) {
        return false;
      }
    }

    // 检查 useHolidays 参数
    if ('useHolidays' in args && typeof args.useHolidays !== 'boolean') {
      return false;
    }

    // 检查 refreshData 参数
    if ('refreshData' in args && typeof args.refreshData !== 'boolean') {
      return false;
    }

    // 检查 customWorkdays 参数
    if ('customWorkdays' in args) {
      if (!Array.isArray(args.customWorkdays)) {
        return false;
      }
      for (const date of args.customWorkdays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    // 检查 customHolidays 参数
    if ('customHolidays' in args) {
      if (!Array.isArray(args.customHolidays)) {
        return false;
      }
      for (const date of args.customHolidays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    return true;
  }
  return false;
}

function checkWorkdaysByYearArgs(args: unknown): args is {
  year: number,
  format?: string,
  region?: string,
  useHolidays?: boolean,
  refreshData?: boolean,
  customWorkdays?: string[],
  customHolidays?: string[]
} {
  if (
    typeof args === 'object' &&
    args !== null &&
    'year' in args &&
    typeof args.year === 'number'
  ) {
    // 检查 format 参数
    if ('format' in args) {
      const validFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY年MM月DD日', 'MM-DD-YYYY'];
      if (typeof args.format !== 'string' || !validFormats.includes(args.format)) {
        return false;
      }
    }

    // 检查 region 参数
    if ('region' in args) {
      const validRegions = ['china', ''];
      if (typeof args.region !== 'string' || !validRegions.includes(args.region)) {
        return false;
      }
    }

    // 检查 useHolidays 参数
    if ('useHolidays' in args && typeof args.useHolidays !== 'boolean') {
      return false;
    }

    // 检查 refreshData 参数
    if ('refreshData' in args && typeof args.refreshData !== 'boolean') {
      return false;
    }

    // 检查 customWorkdays 参数
    if ('customWorkdays' in args) {
      if (!Array.isArray(args.customWorkdays)) {
        return false;
      }
      for (const date of args.customWorkdays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    // 检查 customHolidays 参数
    if ('customHolidays' in args) {
      if (!Array.isArray(args.customHolidays)) {
        return false;
      }
      for (const date of args.customHolidays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    return true;
  }
  return false;
}

function checkWorkdayStatsArgs(args: unknown): args is {
  startDate: string,
  endDate: string,
  region?: string,
  useHolidays?: boolean,
  refreshData?: boolean,
  customWorkdays?: string[],
  customHolidays?: string[]
} {
  if (
    typeof args === 'object' &&
    args !== null &&
    'startDate' in args &&
    typeof args.startDate === 'string' &&
    'endDate' in args &&
    typeof args.endDate === 'string'
  ) {
    // 验证日期格式
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(args.endDate)) {
      return false;
    }

    // 验证日期范围
    const start = dayjs(args.startDate);
    const end = dayjs(args.endDate);
    if (start.isAfter(end)) {
      return false;
    }

    // 检查 region 参数
    if ('region' in args) {
      const validRegions = ['china', ''];
      if (typeof args.region !== 'string' || !validRegions.includes(args.region)) {
        return false;
      }
    }

    // 检查 useHolidays 参数
    if ('useHolidays' in args && typeof args.useHolidays !== 'boolean') {
      return false;
    }

    // 检查 refreshData 参数
    if ('refreshData' in args && typeof args.refreshData !== 'boolean') {
      return false;
    }

    // 检查 customWorkdays 参数
    if ('customWorkdays' in args) {
      if (!Array.isArray(args.customWorkdays)) {
        return false;
      }
      for (const date of args.customWorkdays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    // 检查 customHolidays 参数
    if ('customHolidays' in args) {
      if (!Array.isArray(args.customHolidays)) {
        return false;
      }
      for (const date of args.customHolidays) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return false;
        }
      }
    }

    return true;
  }
  return false;
}

async function runServer() {
  try {
    process.stdout.write('Starting Time MCP server...\n');

    // 初始化节假日管理器
    const holidayManager = HolidayManager.getInstance();
    await holidayManager.initialize();

    const lastSyncTime = holidayManager.getLastSyncTime();
    if (lastSyncTime) {
      process.stdout.write(`Holiday data loaded, last sync: ${lastSyncTime.toISOString()}\n`);
    } else {
      process.stdout.write('Holiday data initialization completed\n');
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error starting Time MCP server: ${message}\n`);
    process.exit(1);
  }
}

runServer().catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error running Time MCP server: ${errorMessage}\n`);
  process.exit(1);
});