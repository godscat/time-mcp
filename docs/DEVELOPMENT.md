# 🛠️ Development Guide - Time MCP Server

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm (recommended) or npm

### Setup

```bash
# Clone repository
git clone https://github.com/yokingma/time-mcp.git
cd time-mcp

# Install dependencies
pnpm install

# Build project
pnpm run build

# Run tests
pnpm test
```

## Development Commands

### Daily Development

```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run lint         # Check code quality
pnpm run lint:fix     # Fix linting issues automatically
```

### Testing

```bash
pnpm test             # Run all tests
pnpm test:coverage    # Generate coverage report
pnpm test:watch       # Watch mode for development
```

### Release

```bash
pnpm run build        # Create production build
pnpm publish          # Publish to npm (if authorized)
```

## Project Structure

```
time-mcp/
├── src/
│   ├── index.ts             # Main server entry point
│   ├── tools.ts             # Tool definitions and schemas
│   ├── holiday-manager.ts   # Chinese holiday data management
│   └── *.test.ts           # Test files
├── scripts/
│   └── download-holidays.js # Holiday data downloader
├── docs/
│   ├── API.md               # Complete API documentation
│   └── DEVELOPMENT.md       # This development guide
├── chinese-days.json        # Holiday data (auto-generated)
├── package.json
├── tsconfig.json
└── vitest.config.ts        # Test configuration
```

## Local Development Setup

### Method 1: Build Files (Recommended for Production)

```bash
pnpm run build
```

Configure in your MCP client:

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

### Method 2: Source Code (For Development)

Configure with tsx:

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

### Method 3: pnpm Link (For Testing)

```bash
pnpm run build
pnpm link
```

Configure:

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "time-mcp"
    }
  }
}
```

## Configuration Files Location

### Claude Desktop

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Cursor

- Project root: `mcp.json`

### Windsurf

- `./codeium/windsurf/model_config.json`

### Cherry Studio

- Application settings UI

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch

# Run specific test file
pnpm test src/index.test.ts
```

### Test Structure

- **Unit Tests**: Individual function testing
- **Integration Tests**: MCP protocol compliance
- **Edge Cases**: Date boundaries, invalid inputs
- **Holiday Data**: Chinese holiday integration

### Coverage Goals

- **Target**: 100% code coverage
- **Current**: 65+ test cases, 100% coverage
- **Reports**: Text, JSON, and HTML formats available

## Code Quality

### Linting

```bash
# Check for issues
pnpm run lint

# Fix automatically
pnpm run lint:fix
```

### TypeScript Configuration

- **Strict Mode**: Enabled
- **Target**: ES2022
- **Module**: ESNext
- **Declaration**: Generated for package distribution

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing Commas**: Required in multi-line structures

## Adding New Tools

### 1. Define Tool Schema (tools.ts)

```typescript
export const NEW_TOOL: Tool = {
  name: "new_tool",
  description: "Tool description",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Parameter description",
      },
    },
    required: ["param1"],
  },
};
```

### 2. Add to Server Registration (index.ts)

```typescript
// Add to imports
import { NEW_TOOL } from './tools.js';

// Add to tools list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [CURRENT_TIME, ..., NEW_TOOL]
  };
});
```

### 3. Implement Tool Logic (index.ts)

```typescript
case 'new_tool': {
  if (!checkNewToolArgs(args)) {
    throw new Error(`Invalid arguments for tool: [${name}]`);
  }

  const { param1 } = args;
  const result = await newToolFunction(param1);

  return {
    success: true,
    content: [{
      type: 'text',
      text: `Result: ${result}`
    }]
  };
}
```

### 4. Add Parameter Validation (index.ts)

```typescript
function checkNewToolArgs(args: unknown): args is { param1: string } {
  return (
    typeof args === "object" &&
    args !== null &&
    "param1" in args &&
    typeof args.param1 === "string"
  );
}
```

### 5. Add Tests

```typescript
describe("new_tool", () => {
  it("should handle valid input", () => {
    const result = newToolFunction("test");
    expect(result).toBeDefined();
  });

  it("should validate parameters", () => {
    expect(() => checkNewToolArgs({})).toBe(false);
    expect(() => checkNewToolArgs({ param1: "test" })).toBe(true);
  });
});
```

## Chinese Holiday Data

### Data Management

- **Source**: `https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json`
- **Local Cache**: `chinese-days.json` (35KB)
- **Coverage**: 2004-2025 years
- **Auto-download**: First installation and post-install script

### HolidayManager Class

```typescript
// Initialize and use holiday data
const holidayManager = HolidayManager.getInstance();
await holidayManager.initialize();

// Check if a date is a workday
const isWorkday = holidayManager.isWorkdayForChineseCalendar("2025-03-17");

// Get holiday information
const holidayInfo = holidayManager.getHolidayInfo("2025-01-01");
```

### Manual Data Refresh

```typescript
// Force refresh holiday data
await holidayManager.refreshData();
```

## Performance Considerations

### Memory Usage

- **Runtime**: ~50MB with holiday data loaded
- **Cache**: Holiday data cached in memory for O(1) lookup
- **Storage**: ~5MB including dependencies and data

### Response Time

- **Simple queries**: < 10ms
- **Complex queries**: < 100ms
- **Holiday data load**: ~50ms (first time only)

### Network Usage

- **Holiday data download**: ~35KB (one-time or daily)
- **Offline capable**: Full functionality without network

## Debugging

### Common Issues

1. **Path Issues**: Use absolute paths in configuration
2. **Permission Issues**: Ensure build files have execute permissions
3. **Dependency Issues**: Use `pnpm install` to ensure correct dependencies
4. **Data Issues**: Check `chinese-days.json` exists and is valid

### Debug Commands

```bash
# Test local build
node dist/index.js

# Test with source code
npx tsx src/index.ts

# Check holiday data
node -e "console.log(require('./chinese-days.json').holidays.length)"

# Validate configuration
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"current_time","arguments":{}}}' | node dist/index.js
```

## Contributing

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Ensure all tests pass
5. Update documentation if needed
6. Submit pull request

### Commit Guidelines

- **Format**: `type(scope): description`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Example**: `feat(workdays): add quarterly workday queries`

### Documentation Updates

- Update API.md for new tools
- Update README.md for major features
- Update CLAUDE.md for technical changes
- Add examples for new functionality

## Release Process

### Version Management

- **Format**: Semantic Versioning (MAJOR.MINOR.PATCH)
- **Pre-release**: Use `-beta.X` for testing releases
- **Release**: Update `package.json` version and create git tag

### Build and Test

```bash
# Final checks
pnpm run lint
pnpm test
pnpm run build

# Validate build
node dist/index.js
```

### Publish

```bash
# Only for maintainers
pnpm publish

# Or with Smithery
# Update Smithery configuration
```

## Support

### Issues

- **Bug Reports**: Use GitHub Issues with reproduction steps
- **Feature Requests**: Use GitHub Discussions
- **Questions**: Check documentation first, then GitHub Discussions

### Community

- **GitHub**: <https://github.com/yokingma/time-mcp>
- **Smithery**: <https://smithery.ai/server/@yokingma/time-mcp>
- **Discussions**: GitHub Discussions for general questions

---

This development guide provides comprehensive information for contributing to and maintaining the Time MCP Server project.
