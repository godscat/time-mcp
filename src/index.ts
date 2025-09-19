#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CURRENT_TIME, DAYS_IN_MONTH, GET_TIMESTAMP, RELATIVE_TIME, CONVERT_TIME, GET_WEEK_YEAR, GET_WEEK_DATES, GET_WORKDAYS, GET_ISO_WEEKS_IN_MONTH } from './tools.js';
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
    tools: [CURRENT_TIME, RELATIVE_TIME, DAYS_IN_MONTH, GET_TIMESTAMP, CONVERT_TIME, GET_WEEK_YEAR, GET_WEEK_DATES, GET_WORKDAYS, GET_ISO_WEEKS_IN_MONTH],
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
      case 'get_workdays': {
        if (!checkWorkdaysArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const { year, week, format } = args;
        const workdays = getWorkdays(year, week, format);
        
        // 创建结构化的工作日数据
        const structuredWorkdays = workdays.map((date, index) => {
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          return {
            date: date,
            day: dayNames[index],
            week: week,
            year: year,
            isWeekend: false,
          };
        });
        
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `Workdays for ISO week ${week} of ${year}:\n${workdays.map(day => `- ${day}`).join('\n')}`,
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

export function getWorkdays(year: number, week: number, format: string = 'YYYY-MM-DD') {
  const firstDayOfYear = dayjs(`${year}-01-01`);
  const firstMonday = firstDayOfYear.startOf('isoWeek');
  
  if (firstDayOfYear.day() === 1) {
    firstMonday.year(firstDayOfYear.year());
  } else {
    firstMonday.add(1, 'week');
  }
  
  const targetWeekStart = firstMonday.add(week - 1, 'week');
  const workdays = [];
  
  for (let i = 0; i < 5; i++) {
    const workday = targetWeekStart.add(i, 'day');
    workdays.push(workday.format(format));
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

function checkWorkdaysArgs(args: unknown): args is { year: number, week: number, format?: string } {
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
    if ('format' in args) {
      const validFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY年MM月DD日', 'MM-DD-YYYY'];
      return typeof args.format === 'string' && validFormats.includes(args.format);
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

async function runServer() {
  try {

    process.stdout.write('Starting Time MCP server...\n');
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