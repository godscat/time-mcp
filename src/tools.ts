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

export const GET_WORKDAYS_BY_WEEK: Tool = {
  name: 'get_workdays_by_week',
  description: 'Get a list of workdays for a given week and year. Supports Chinese holidays and workday adjustments when region is set to "china".',
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
      region: {
        type: 'string',
        description: 'Region for holiday calculations. Use "china" for Chinese holidays, or leave empty for standard Monday-Friday workdays.',
        enum: ['china', ''],
        default: '',
      },
      useHolidays: {
        type: 'boolean',
        description: 'Whether to use holiday data for workday calculations. Only applicable when region is "china".',
        default: true,
      },
      refreshData: {
        type: 'boolean',
        description: 'Whether to refresh holiday data before calculation. Only applicable when region is "china" and useHolidays is true.',
        default: false,
      },
      customWorkdays: {
        type: 'array',
        description: 'Custom workday dates (YYYY-MM-DD format) that should be treated as workdays regardless of holidays or weekends.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      customHolidays: {
        type: 'array',
        description: 'Custom holiday dates (YYYY-MM-DD format) that should be treated as holidays regardless of region settings.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
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

export const GET_WORKDAYS_BY_MONTH: Tool = {
  name: 'get_workdays_by_month',
  description: 'Get a list of workdays for a given month and year. Supports Chinese holidays and workday adjustments when region is set to "china".',
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
      region: {
        type: 'string',
        description: 'Region for holiday calculations. Use "china" for Chinese holidays, or leave empty for standard Monday-Friday workdays.',
        enum: ['china', ''],
        default: '',
      },
      useHolidays: {
        type: 'boolean',
        description: 'Whether to use holiday data for workday calculations. Only applicable when region is "china".',
        default: true,
      },
      refreshData: {
        type: 'boolean',
        description: 'Whether to refresh holiday data before calculation. Only applicable when region is "china" and useHolidays is true.',
        default: false,
      },
      customWorkdays: {
        type: 'array',
        description: 'Custom workday dates (YYYY-MM-DD format) that should be treated as workdays regardless of holidays or weekends.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      customHolidays: {
        type: 'array',
        description: 'Custom holiday dates (YYYY-MM-DD format) that should be treated as holidays regardless of region settings.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
    required: ['year', 'month'],
  },
};

export const GET_WORKDAYS_BY_RANGE: Tool = {
  name: 'get_workdays_by_range',
  description: 'Get a list of workdays for a given date range. Supports Chinese holidays and workday adjustments when region is set to "china".',
  inputSchema: {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        description: 'The start date (YYYY-MM-DD format). e.g. 2025-03-01',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
      endDate: {
        type: 'string',
        description: 'The end date (YYYY-MM-DD format). e.g. 2025-03-31',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
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
      region: {
        type: 'string',
        description: 'Region for holiday calculations. Use "china" for Chinese holidays, or leave empty for standard Monday-Friday workdays.',
        enum: ['china', ''],
        default: '',
      },
      useHolidays: {
        type: 'boolean',
        description: 'Whether to use holiday data for workday calculations. Only applicable when region is "china".',
        default: true,
      },
      refreshData: {
        type: 'boolean',
        description: 'Whether to refresh holiday data before calculation. Only applicable when region is "china" and useHolidays is true.',
        default: false,
      },
      customWorkdays: {
        type: 'array',
        description: 'Custom workday dates (YYYY-MM-DD format) that should be treated as workdays regardless of holidays or weekends.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      customHolidays: {
        type: 'array',
        description: 'Custom holiday dates (YYYY-MM-DD format) that should be treated as holidays regardless of region settings.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
    required: ['startDate', 'endDate'],
  },
};

export const GET_WORKDAYS_BY_QUARTER: Tool = {
  name: 'get_workdays_by_quarter',
  description: 'Get a list of workdays for a given quarter and year. Supports Chinese holidays and workday adjustments when region is set to "china".',
  inputSchema: {
    type: 'object',
    properties: {
      year: {
        type: 'integer',
        description: 'The year. e.g. 2025',
      },
      quarter: {
        type: 'integer',
        description: 'The quarter (1-4). e.g. 1 for Q1 (January-March)',
        minimum: 1,
        maximum: 4,
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
      region: {
        type: 'string',
        description: 'Region for holiday calculations. Use "china" for Chinese holidays, or leave empty for standard Monday-Friday workdays.',
        enum: ['china', ''],
        default: '',
      },
      useHolidays: {
        type: 'boolean',
        description: 'Whether to use holiday data for workday calculations. Only applicable when region is "china".',
        default: true,
      },
      refreshData: {
        type: 'boolean',
        description: 'Whether to refresh holiday data before calculation. Only applicable when region is "china" and useHolidays is true.',
        default: false,
      },
      customWorkdays: {
        type: 'array',
        description: 'Custom workday dates (YYYY-MM-DD format) that should be treated as workdays regardless of holidays or weekends.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      customHolidays: {
        type: 'array',
        description: 'Custom holiday dates (YYYY-MM-DD format) that should be treated as holidays regardless of region settings.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
    required: ['year', 'quarter'],
  },
};

export const GET_WORKDAYS_BY_YEAR: Tool = {
  name: 'get_workdays_by_year',
  description: 'Get a list of workdays for a given year. Supports Chinese holidays and workday adjustments when region is set to "china".',
  inputSchema: {
    type: 'object',
    properties: {
      year: {
        type: 'integer',
        description: 'The year. e.g. 2025',
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
      region: {
        type: 'string',
        description: 'Region for holiday calculations. Use "china" for Chinese holidays, or leave empty for standard Monday-Friday workdays.',
        enum: ['china', ''],
        default: '',
      },
      useHolidays: {
        type: 'boolean',
        description: 'Whether to use holiday data for workday calculations. Only applicable when region is "china".',
        default: true,
      },
      refreshData: {
        type: 'boolean',
        description: 'Whether to refresh holiday data before calculation. Only applicable when region is "china" and useHolidays is true.',
        default: false,
      },
      customWorkdays: {
        type: 'array',
        description: 'Custom workday dates (YYYY-MM-DD format) that should be treated as workdays regardless of holidays or weekends.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      customHolidays: {
        type: 'array',
        description: 'Custom holiday dates (YYYY-MM-DD format) that should be treated as holidays regardless of region settings.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
    required: ['year'],
  },
};

export const GET_WORKDAY_STATS: Tool = {
  name: 'get_workday_stats',
  description: 'Get statistics about workdays, holidays, and weekends for a given date range. Supports Chinese holidays when region is set to "china".',
  inputSchema: {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        description: 'The start date (YYYY-MM-DD format). e.g. 2025-03-01',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
      endDate: {
        type: 'string',
        description: 'The end date (YYYY-MM-DD format). e.g. 2025-03-31',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
      region: {
        type: 'string',
        description: 'Region for holiday calculations. Use "china" for Chinese holidays, or leave empty for standard Monday-Friday workdays.',
        enum: ['china', ''],
        default: '',
      },
      useHolidays: {
        type: 'boolean',
        description: 'Whether to use holiday data for workday calculations. Only applicable when region is "china".',
        default: true,
      },
      refreshData: {
        type: 'boolean',
        description: 'Whether to refresh holiday data before calculation. Only applicable when region is "china" and useHolidays is true.',
        default: false,
      },
      customWorkdays: {
        type: 'array',
        description: 'Custom workday dates (YYYY-MM-DD format) that should be treated as workdays regardless of holidays or weekends.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      customHolidays: {
        type: 'array',
        description: 'Custom holiday dates (YYYY-MM-DD format) that should be treated as holidays regardless of region settings.',
        items: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
    required: ['startDate', 'endDate'],
  },
};
