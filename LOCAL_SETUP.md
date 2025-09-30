# 🚀 Local Development Setup - Time MCP Server

## Quick Setup

Choose the method that best fits your development workflow:

### Method 1: Built Files (Recommended for Production)

```bash
pnpm run build
```

**Configuration:**

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "node",
      "args": ["E:/Workspace/mcp-servers/time-mcp/dist/index.js"]
    }
  }
}
```

### Method 2: Source Code (Development)

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "npx",
      "args": ["tsx", "E:/Workspace/mcp-servers/time-mcp/src/index.ts"]
    }
  }
}
```

### Method 3: pnpm Link (Testing)

```bash
pnpm run build
pnpm link
```

**Configuration:**

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "time-mcp"
    }
  }
}
```

## Configuration File Locations

### Claude Desktop

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Cursor

- Project root: `mcp.json`

### Windsurf

- `./codeium/windsurf/model_config.json`

### Cherry Studio

- Application settings UI

## Update Workflow

### After Code Changes

- **Method 1**: `pnpm run build`
- **Method 2**: Changes apply automatically
- **Method 3**: `pnpm run build && pnpm link`

## Testing

```bash
# Test built version
node dist/index.js

# Test source code
npx tsx src/index.ts

# Test linked version
time-mcp
```

## Troubleshooting

### Common Issues

1. **Path Problems**: Use absolute paths in configuration
2. **Permission Issues**: Build files should have execute permissions
3. **Dependencies**: Run `pnpm install` if using source code method

### Recommended Approach

- **Development**: Use Method 2 (source code) for real-time updates
- **Testing**: Use Method 1 (built files) for production-like testing
- **Production**: Use Method 1 (built files) for stability

## First Run

The server will automatically download Chinese holiday data on first startup (~35KB). This may take a few seconds. Subsequent runs will use cached data for faster startup.

For detailed development information, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).
