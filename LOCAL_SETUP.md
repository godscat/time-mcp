# 本地 MCP Server 配置指南

## 🎯 不发布到 npm，本地使用 Time MCP Server

## 方法对比

| 方法 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **本地构建文件** | 稳定、性能好 | 需要重新构建 | 生产环境 |
| **npm link** | 方便、自动更新 | 全局安装 | 开发环境 |
| **源代码直接运行** | 实时更新、调试方便 | 依赖 tsx | 开发调试 |

---

## 📦 方法1：使用本地构建文件（推荐）

### 步骤

1. **构建项目**

   ```bash
   npm run build
   ```

2. **配置文件**

   ```json
   {
     "mcpServers": {
       "time-mcp": {
         "command": "node",
         "args": [
           "E:/Workspace/mcp-servers/time-mcp/dist/index.js"
         ]
       }
     }
   }
   ```

3. **更新时重新构建**

   ```bash
   npm run build
   ```

---

## 🔗 方法2：使用 npm link（开发推荐）

### 步骤

1. **在项目目录中执行**

   ```bash
   npm run build
   npm link
   ```

2. **配置文件**

   ```json
   {
     "mcpServers": {
       "time-mcp": {
         "command": "time-mcp"
       }
     }
   }
   ```

3. **更新时重新链接**

   ```bash
   npm run build
   npm link
   ```

4. **取消链接**

   ```bash
   npm unlink -g time-mcp
   ```

---

## 📝 方法3：直接使用源代码（开发调试）

### 配置文件

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "npx",
      "args": [
        "tsx",
        "E:/Workspace/mcp-servers/time-mcp/src/index.ts"
      ]
    }
  }
}
```

**或者：**

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "node",
      "args": [
        "--loader",
        "tsx",
        "E:/Workspace/mcp-servers/time-mcp/src/index.ts"
      ]
    }
  }
}
```

---

## 🏠 配置文件位置

### Claude Desktop

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Cursor

- 项目根目录：`mcp.json`

### Windsurf

- `./codeium/windsurf/model_config.json`

---

## 🔧 完整配置示例

### Claude Desktop 配置

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "node",
      "args": [
        "E:/Workspace/mcp-servers/time-mcp/dist/index.js"
      ]
    }
  }
}
```

### Cursor 配置

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "node",
      "args": [
        "E:/Workspace/mcp-servers/time-mcp/dist/index.js"
      ]
    }
  }
}
```

---

## 🔄 更新流程

### 修改代码后

1. **如果使用方法1（构建文件）**

   ```bash
   npm run build
   ```

2. **如果使用方法2（npm link）**

   ```bash
   npm run build
   npm link
   ```

3. **如果使用方法3（源代码）**
   - 无需额外操作，直接生效

---

## 🧪 测试本地配置

### 测试脚本

```bash
# 测试本地构建
node E:/Workspace/mcp-servers/time-mcp/dist/index.js

# 测试源代码
npx tsx E:/Workspace/mcp-servers/time-mcp/src/index.ts

# 测试 npm link
time-mcp
```

---

## 🐛 常见问题

### 1. 路径问题

- 使用绝对路径
- Windows 使用 `/` 或 `\\` 都可以
- 确保路径中没有空格

### 2. 权限问题

- 确保构建文件有执行权限
- Windows 通常不需要特殊权限

### 3. 依赖问题

- 如果使用源代码方式，确保安装了 tsx
- 构建文件方式不需要额外依赖

---

## 💡 推荐方案

**开发环境**：使用方法3（源代码直接运行）
**测试环境**：使用方法1（本地构建文件）
**生产环境**：使用方法1（本地构建文件）

这样可以在开发和测试中快速迭代，在生产环境中保持稳定。
