# 🚀 Time MCP Server: Giving LLMs Time Awareness Capabilities

A Model Context Protocol (MCP) server implementation that allows LLMs to have time awareness capabilities.

<div align="center">
 <img src="./assets/cursor.png"></img>
</div>

## Tools

- `current_time`: Get current time (UTC and local time)
- `relative_time`: Get relative time
- `get_timestamp`: Get timestamp
- `days_in_month`: Get days in month
- `convert_time`: Convert time between timezones

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
