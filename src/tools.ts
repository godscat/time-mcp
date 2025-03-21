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
        default: 'YYYY-MM-DD',
      },
    },
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
  },
};

export const DAYS_IN_MONTH: Tool = {
  name: 'days_in_month',
  description: 'Get the number of days in a month.',
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
  description: 'Get the timestamp of a time.',
  inputSchema: {
    type: 'object',
    properties: {
      time: {
        type: 'string',
        description: 'The time to get the timestamp. Format: YYYY-MM-DD HH:mm:ss',
        default: undefined,
      },
    },
  },
};