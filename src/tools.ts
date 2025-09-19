import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const CURRENT_TIME: Tool = {
  name: 'current_time',
  description: 'Get the current date and time.',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        description: 'The format of the time, default is empty string',
        enum: [
          'h:mm A',
          'h:mm:ss A',
          'YYYY-MM-DD HH:mm:ss',
          'YYYY-MM-DD',
          'YYYY-MM',
          'MM/DD/YYYY',
          'MM/DD/YY',
          'YYYY/MM/DD',
          'YYYY/MM',
        ],
        default: 'YYYY-MM-DD HH:mm:ss',
      },
      timezone: {
        type: 'string',
        description: 'The timezone of the time, IANA timezone name, e.g. Asia/Shanghai',
        default: undefined,
      },
    },
    required: ['format'],
  },
};

export const RELATIVE_TIME: Tool = {
  name: 'relative_time',
  description: 'Get the relative time from now.',
  inputSchema: {
    type: 'object',
    properties: {
      time: {
        type: 'string',
        description: 'The time to get the relative time from now. Format: YYYY-MM-DD HH:mm:ss',
      },
    },
    required: ['time'],
  },
};

export const DAYS_IN_MONTH: Tool = {
  name: 'days_in_month',
  description: 'Get the number of days in a month. If no date is provided, get the number of days in the current month.',
  inputSchema: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        description: 'The date to get the days in month. Format: YYYY-MM-DD',
      },
    },
  },
};

export const GET_TIMESTAMP: Tool = {
  name: 'get_timestamp',
  description: 'Get the timestamp for the time.',
  inputSchema: {
    type: 'object',
    properties: {
      time: {
        type: 'string',
        description: 'The time to get the timestamp. Format: YYYY-MM-DD HH:mm:ss.SSS',
      },
    },
  },
};

export const CONVERT_TIME: Tool = {
  name: 'convert_time',
  description: 'Convert time between timezones.',
  inputSchema: {
    type: 'object',
    properties: {
      sourceTimezone: {
        type: 'string',
        description: 'The source timezone. IANA timezone name, e.g. Asia/Shanghai',
      },
      targetTimezone: {
        type: 'string',
        description: 'The target timezone. IANA timezone name, e.g. Europe/London',
      },
      time: {
        type: 'string',
        description: 'Date and time in 24-hour format. e.g. 2025-03-23 12:30:00',
      },
    },
    required: ['sourceTimezone', 'targetTimezone', 'time'],
  },
};

export const GET_WEEK_YEAR: Tool = {
  name: 'get_week_year',
  description: 'Get the week and isoWeek of the year.',
  inputSchema: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        description: 'The date to get the week and isoWeek of the year. e.g. 2025-03-23',
      },
    },
  },
};

export const GET_WEEK_DATES: Tool = {
  name: 'get_week_dates',
  description: 'Get the date range for a given ISO week number and year.',
  inputSchema: {
    type: 'object',
    properties: {
      year: {
        type: 'integer',
        description: 'The year. e.g. 2025',
      },
      week: {
        type: 'integer',
        description: 'The ISO week number (1-53). e.g. 12',
      },
    },
    required: ['year', 'week'],
  },
};

export const GET_WORKDAYS: Tool = {
  name: 'get_workdays',
  description: 'Get a list of workdays (Monday to Friday) for a given week and year.',
  inputSchema: {
    type: 'object',
    properties: {
      year: {
        type: 'integer',
        description: 'The year. e.g. 2025',
      },
      week: {
        type: 'integer',
        description: 'The ISO week number (1-53). e.g. 12',
      },
      format: {
        type: 'string',
        description: 'The date format for output. Default: YYYY-MM-DD',
        enum: [
          'YYYY-MM-DD',
          'MM/DD/YYYY',
          'DD/MM/YYYY',
          'YYYY/MM/DD',
          'YYYY年MM月DD日',
          'MM-DD-YYYY',
        ],
        default: 'YYYY-MM-DD',
      },
    },
    required: ['year', 'week'],
  },
};

export const GET_ISO_WEEKS_IN_MONTH: Tool = {
  name: 'get_iso_weeks_in_month',
  description: 'Get the ISO week numbers contained in a specific month.',
  inputSchema: {
    type: 'object',
    properties: {
      year: {
        type: 'integer',
        description: 'The year. e.g. 2025',
      },
      month: {
        type: 'integer',
        description: 'The month (1-12). e.g. 3 for March',
        minimum: 1,
        maximum: 12,
      },
    },
    required: ['year', 'month'],
  },
};
