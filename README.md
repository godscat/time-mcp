# 🚀 Time MCP Server: Giving LLMs Time Awareness Capabilities

[![smithery badge](https://smithery.ai/badge/@yokingma/time-mcp)](https://smithery.ai/server/@yokingma/time-mcp) <a href="https://github.com/yokingma/time-mcp/stargazers"><img src="https://img.shields.io/github/stars/yokingma/time-mcp" alt="Github Stars"></a> <a href="https://github.com/yokingma/time-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-purple" alt="License"></a> <a href="https://github.com/yokingma/time-mcp/issues/new"><img src="https://img.shields.io/badge/Report a bug-Github-%231F80C0" alt="Report a bug"></a>

A Model Context Protocol (MCP) server implementation that allows LLMs to have time awareness capabilities.

<div align="center">
 <img src="./assets/cursor.png"></img>
</div>

## Tools

- `current_time`: Get current time (UTC and local time)
- `relative_time`: Get relative time
- `get_timestamp`: Get timestamp for the time
- `days_in_month`: Get days in month
- `convert_time`: Convert time between timezones
- `get_week_year`: Get week and isoWeek of the year

## Installation

```shell
# Manually install (Optional)
npm install -g time-mcp
```

```shell
# using npx
npx -y time-mcp
```

## Running on Cursor

Your `mcp.json` file will look like this:

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "npx",
      "args": ["-y", "time-mcp"]
    }
  }
}
```

## Running on Windsurf

Add this to your `./codeium/windsurf/model_config.json` file:

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "npx",
      "args": ["-y", "time-mcp"]
    }
  }
}
```

## License

MIT License - see [LICENSE](./LICENSE) file for details.
