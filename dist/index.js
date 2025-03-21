#!/usr/bin/env node

// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import relativeTime from "dayjs/plugin/relativeTime.js";

// src/tools.ts
var CURRENT_TIME = {
  name: "current_time",
  description: "Get the current date and time.",
  inputSchema: {
    type: "object",
    properties: {
      format: {
        type: "string",
        description: "The format of the time, default is empty string",
        enum: [
          "h:mm A",
          "h:mm:ss A",
          "YYYY-MM-DD HH:mm:ss",
          "YYYY-MM-DD",
          "YYYY-MM",
          "MM/DD/YYYY",
          "MM/DD/YY",
          "YYYY/MM/DD",
          "YYYY/MM"
        ],
        default: "YYYY-MM-DD"
      }
    }
  }
};
var RELATIVE_TIME = {
  name: "relative_time",
  description: "Get the relative time from now.",
  inputSchema: {
    type: "object",
    properties: {
      time: {
        type: "string",
        description: "The time to get the relative time from now. Format: YYYY-MM-DD HH:mm:ss"
      }
    }
  }
};
var DAYS_IN_MONTH = {
  name: "days_in_month",
  description: "Get the number of days in a month.",
  inputSchema: {
    type: "object",
    properties: {
      date: {
        type: "string",
        description: "The date to get the days in month. Format: YYYY-MM-DD"
      }
    }
  }
};
var GET_TIMESTAMP = {
  name: "get_timestamp",
  description: "Get the timestamp of a time.",
  inputSchema: {
    type: "object",
    properties: {
      time: {
        type: "string",
        description: "The time to get the timestamp. Format: YYYY-MM-DD HH:mm:ss",
        default: void 0
      }
    }
  }
};

// src/index.ts
import dayjs from "dayjs";
dayjs.extend(relativeTime);
var server = new Server({
  name: "time-mcp",
  version: "0.0.1"
}, {
  capabilities: {
    tools: {},
    logging: {}
  }
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [CURRENT_TIME, RELATIVE_TIME, DAYS_IN_MONTH, GET_TIMESTAMP]
  };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "current_time": {
        if (!checkCurrentTimeArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const format = args.format;
        const result = getCurrentTime(format);
        return {
          success: true,
          content: [
            {
              type: "text",
              text: result
            }
          ]
        };
      }
      case "relative_time": {
        if (!checkRelativeTimeArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const time = args.time;
        const result = getRelativeTime(time);
        return {
          success: true,
          content: [
            {
              type: "text",
              text: result
            }
          ]
        };
      }
      case "days_in_month": {
        if (!checkDaysInMonthArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const date = args.date;
        const result = getDaysInMonth(date);
        return {
          success: true,
          content: [
            {
              type: "text",
              text: `The number of days in month is ${result}.`
            }
          ]
        };
      }
      case "get_timestamp": {
        if (!checkTimestampArgs(args)) {
          throw new Error(`Invalid arguments for tool: [${name}]`);
        }
        const time = args.time;
        const result = getTimestamp(time);
        return {
          success: true,
          content: [
            {
              type: "text",
              text: `The timestamp of ${time} is ${result} ms.`
            }
          ]
        };
      }
      default: {
        throw new Error(`Unknown tool: ${name}`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      content: [
        {
          type: "text",
          text: message
        }
      ]
    };
  }
});
function getCurrentTime(format) {
  return dayjs().format(format);
}
function getRelativeTime(time) {
  return dayjs(time).fromNow();
}
function getTimestamp(time) {
  return time ? dayjs(time).valueOf() : dayjs().valueOf();
}
function getDaysInMonth(date) {
  return dayjs(date).daysInMonth();
}
function checkCurrentTimeArgs(args) {
  return typeof args === "object" && args !== null && "format" in args && typeof args.format === "string";
}
function checkRelativeTimeArgs(args) {
  return typeof args === "object" && args !== null && "time" in args && typeof args.time === "string";
}
function checkDaysInMonthArgs(args) {
  return typeof args === "object" && args !== null && "date" in args && typeof args.date === "string";
}
function checkTimestampArgs(args) {
  return typeof args === "object" && args !== null && "time" in args && (typeof args.time === "string" || args.time === void 0);
}
async function runServer() {
  try {
    process.stdout.write("Starting Time MCP server...\n");
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error starting Time MCP server: ${message}
`);
    process.exit(1);
  }
}
runServer().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error running Time MCP server: ${errorMessage}
`);
  process.exit(1);
});
export {
  server
};
//# sourceMappingURL=index.js.map